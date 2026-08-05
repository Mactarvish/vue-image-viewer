import glob
import os
import re
import shutil


def change_urls_to_static(src_filepath):
    with open(src_filepath, "r") as f:
        text = f.read()
    def eee(p):
        m = '/static' + p.group(1)
        return m
    if src_filepath.endswith(".html"):
        text = re.sub(r'"(/.*?)"', eee, text)
        text = re.sub(r"=(/[^ >]*)", lambda m: "=/static" + m.group(1) if not m.group(1).startswith("/static") else m.group(0), text)
    elif src_filepath.endswith(".css"):
        text = text.replace("url(/", "url(/static/")
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
