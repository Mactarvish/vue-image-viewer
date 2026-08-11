import glob
import os
import re
import shutil


def change_urls_to_static(src_filepath):
    with open(src_filepath, "r") as f:
        text = f.read()
    if src_filepath.endswith(".html"):
        # "/xxx" -> "/static/xxx", but never double-prefix
        def repl_quoted(m):
            path = m.group(1)
            if path.startswith("/static/") or path == "/static":
                return m.group(0)
            return '"/static' + path + '"'
        text = re.sub(r'"(/[^"]*)"', repl_quoted, text)

        def repl_unquoted(m):
            path = m.group(1)
            if path.startswith("/static/") or path == "/static":
                return m.group(0)
            return "=/static" + path
        text = re.sub(r"=(/[^ >]*)", repl_unquoted, text)
    elif src_filepath.endswith(".css"):
        # url(/fonts/...) -> url(/static/fonts/...); skip if already /static/
        text = re.sub(r"url\(/((?!static/))", r"url(/static/\1", text)
    with open(src_filepath, "w") as f:
        f.write(text)

if __name__ == '__main__':
    if os.path.exists("dist"):
        shutil.rmtree("dist")
    assert os.system('npm run build') == 0
    os.makedirs("dist/static", exist_ok=True)
    for name in os.listdir("dist"):
        if name == "static":
            continue
        shutil.move(os.path.join("dist", name), os.path.join("dist", "static", name))

    change_urls_to_static("dist/static/index.html")
    for src_css_path in glob.glob(os.path.join("dist/static/css", "*.css")):
        change_urls_to_static(src_css_path)
