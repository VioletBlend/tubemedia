document.getElementById('downloadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const url = document.getElementById('videoUrl').value;
    const quality = document.getElementById('quality').value;

    // デプロイしたサーバーのURLを指定
    const serverUrl = 'https://your-project-name.vercel.app/download'; // デプロイしたサービスのURL

    fetch(serverUrl, {
        method: 'POST',
        body: JSON.stringify({ url: url, quality: quality }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.blob(); // Blobとしてレスポンスを取得
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'video.mp4'; // ダウンロードするファイル名
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('ダウンロードが開始されました。');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('エラーが発生しました: ' + error.message);
    });
});