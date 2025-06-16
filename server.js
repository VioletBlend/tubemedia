const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/download', (req, res) => {
    const { url, quality } = req.body;

    // YouTube動画のURLが正しいか確認
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // ダウンロードする動画の情報を取得
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    ytdl(url, { quality: quality })
        .pipe(res)
        .on('finish', () => {
            console.log('Download completed');
        })
        .on('error', (err) => {
            console.error('Error downloading video:', err);
            res.status(500).json({ error: 'Error downloading video' });
        });
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});