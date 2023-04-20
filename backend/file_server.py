from flask import Flask, request, send_from_directory, jsonify
from collections import defaultdict
import os
from flask import Flask, render_template,request
from flask_cors import CORS

# app = Flask(__name__)
app = Flask(__name__,
            template_folder="../dist",
            static_folder="../dist",
            static_url_path="") # TODO 这个参数没整明白，反正是跟上边这个搭配使用，有空看看
  
CORS(app)


@app.route('/getfile')
def aaa():
    return ""
    ...

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


@app.route('/getAllImagePaths', methods=['GET', 'POST'])
def get_all_image_paths():
    print(request)
    recursive = request.form["recursive"].lower() == "true"
    src_dir = request.form["srcDir"]
    postfixes = request.form["postfixes"].split(",")
    
    dir_file_path_map = defaultdict(list)
    for cur_dir, _, filenames in os.walk(src_dir):
        for filename in filenames:
            if not os.path.splitext(filename)[-1] in postfixes:
                continue
            src_file_path = os.path.join(cur_dir, filename)
            dir_file_path_map[cur_dir].append(src_file_path)
        if not recursive:
            break
    
    return jsonify(dir_file_path_map)
                

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003) # 启动服务器，监听IP地址为0.0.0.0，端口号为8000
