import glob
import os
import re


def change_urls_to_static(src_filepath):
    with open(src_filepath, "r") as f:
        text = f.read()
    def eee(p):
        m = '/static' + p.group(1)
        return m
    if src_filepath.endswith(".html"):
        text = re.sub(r'"(/.*?)"', eee, text)
    elif src_filepath.endswith(".css"):
        text = text.replace("url(/", "url(/static/")
    with open(src_filepath, "w") as f:
        f.write(text)

if __name__ == '__main__':
    os.system("rm -r dist")
    os.system('npm run build')
    os.makedirs("dist/static", exist_ok=True)
    os.system('mv dist/* dist/static/')
    
    change_urls_to_static("dist/static/index.html")
    src_css_paths = glob.glob(os.path.join("dist/static/css", "*.css"))
    for src_css_path in src_css_paths:
        change_urls_to_static(src_css_path)
