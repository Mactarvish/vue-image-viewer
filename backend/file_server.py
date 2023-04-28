from flask import Flask, request, send_from_directory, jsonify
from collections import defaultdict
import os
from flask import Flask, render_template,request
from flask_cors import CORS
import sys


if sys.gettrace():
    app = Flask(__name__)
else:
    app = Flask(__name__,
                template_folder="../dist/static",
                static_folder="../dist/static", # https://blog.csdn.net/Likianta/article/details/89363973
                # static_url_path= # 修改dist中index.html的引用url，每个url前头都加上/static
                )
CORS(app)


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/<path:path>')
def serve_file(path):
    path = '/' + path
    response = send_from_directory(*os.path.split(path));
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response 

@app.route('/clickImagePath')
def handle_click_image_path():
    with open("logs/clicked_image_paths.txt", 'a') as f:
        f.write(request.args["clickedImagePath"] + '\n')
    return "OK"

@app.route('/getAllImagePaths', methods=['GET', 'POST'])
def get_all_image_paths():
    print(request)
    recursive = request.form["recursive"].lower() == "true"
    src_dir = request.form["srcDir"]
    postfixes = request.form["postfixes"].split(",")
    
    dir_file_path_map = defaultdict(list)
    if not os.path.exists(src_dir):
        dir_file_path_map["state"] = "not exist"
        return jsonify(dir_file_path_map)

    for cur_dir, _, filenames in os.walk(src_dir):
        for filename in filenames:
            if not os.path.splitext(filename)[-1] in postfixes:
                continue
            src_file_path = os.path.join(cur_dir, filename)
            dir_file_path_map[cur_dir].append(src_file_path)
        if not recursive:
            break
    dir_file_path_map["state"] = "ok"
    
    return jsonify(dir_file_path_map)
                

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003) # 启动服务器，监听IP地址为0.0.0.0，端口号为8000
