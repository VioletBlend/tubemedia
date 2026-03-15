from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)

# サムネイル取得
@app.post("/thumbnail")
def thumbnail():
    url = request.json.get("url")
    ydl = yt_dlp.YoutubeDL({"quiet": True})
    info = ydl.extract_info(url, download=False)
    return jsonify({
        "status": True,
        "thumbnail": info.get("thumbnail")
    })

# ダウンロード
@app.post("/download")
def download():
    url = request.json.get("url")

    ydl_opts = {
        "outtmpl": "%(title)s.%(ext)s",
        "progress_hooks": []
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

    return jsonify({
        "status": True,
        "file": filename
    })

app.run(host="127.0.0.1", port=5000)
