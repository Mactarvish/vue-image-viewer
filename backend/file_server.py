from flask import Flask, request, send_from_directory

app = Flask(__name__)

@app.route('/files/<path:path>')
def serve_file(path):
    print(path)
    root_dir = '.' # .表示file_server.py所在目录，不是cmd当前目录
    return send_from_directory(root_dir, path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003) # 启动服务器，监听IP地址为0.0.0.0，端口号为8000
