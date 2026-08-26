import os
import platform
import sys
import json
from collections import defaultdict
import argparse

from flask import Flask, request, send_from_directory, jsonify, render_template
from flask_cors import CORS


if sys.gettrace():
    app = Flask(__name__)
else:
    app = Flask(__name__,
                template_folder="../dist/static",
                static_folder="../dist/static",
                )
CORS(app)


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/clickImagePath')
def handle_click_image_path():
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


@app.route('/saveLabelme', methods=['POST'])
def save_labelme():
    """Append a rectangle shape to a labelme json next to the image."""
    data = request.get_json(force=True, silent=True) or {}
    image_path = data.get("imagePath") or ""
    label = (data.get("label") or "object").strip() or "object"
    points = data.get("points")
    image_width = data.get("imageWidth")
    image_height = data.get("imageHeight")

    if not image_path or not isinstance(points, list) or len(points) != 2:
        return jsonify({"state": "error", "message": "invalid payload"}), 400
    try:
        p1 = [float(points[0][0]), float(points[0][1])]
        p2 = [float(points[1][0]), float(points[1][1])]
    except (TypeError, ValueError, IndexError):
        return jsonify({"state": "error", "message": "invalid points"}), 400

    if not os.path.isfile(image_path):
        return jsonify({"state": "error", "message": f"image not found: {image_path}"}), 404

    stem, _ = os.path.splitext(image_path)
    json_path = stem + ".json"
    image_name = os.path.basename(image_path)

    shape = {
        "label": label,
        "points": [p1, p2],
        "group_id": None,
        "description": "",
        "shape_type": "rectangle",
        "flags": {},
    }

    if os.path.isfile(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                doc = json.load(f)
        except Exception as e:
            return jsonify({"state": "error", "message": f"read json failed: {e}"}), 500
        if not isinstance(doc, dict):
            doc = {}
        shapes = doc.get("shapes")
        if not isinstance(shapes, list):
            shapes = []
        shapes.append(shape)
        doc["shapes"] = shapes
        doc["imagePath"] = image_name
        if image_width:
            doc["imageWidth"] = int(image_width)
        if image_height:
            doc["imageHeight"] = int(image_height)
        if "version" not in doc:
            doc["version"] = "5.0.1"
        if "flags" not in doc:
            doc["flags"] = {}
        if "imageData" not in doc:
            doc["imageData"] = None
    else:
        doc = {
            "version": "5.0.1",
            "flags": {},
            "shapes": [shape],
            "imagePath": image_name,
            "imageData": None,
            "imageHeight": int(image_height) if image_height else None,
            "imageWidth": int(image_width) if image_width else None,
        }

    try:
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify({"state": "error", "message": f"write failed: {e}"}), 500

    return jsonify({
        "state": "ok",
        "jsonPath": json_path,
        "shapeCount": len(doc["shapes"]),
    })


@app.route('/<path:path>')
def serve_file(path):
    # 对于linux或者苹果系统，一般都是/开头的，而url中这个/就被吃了，所以得额外加上
    if platform.system() != 'Windows':
        path = '/' + path
    response = send_from_directory(*os.path.split(path))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", default=8003, type=int)
    args = parser.parse_args()
    app.run(host='0.0.0.0', port=args.port)
