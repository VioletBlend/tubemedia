const btn = document.getElementById("btn");
const result = document.getElementById("result");
const progressBar = document.getElementById("progress");
const thumb = document.getElementById("thumb");

// WebSocket（進捗バー）
const ws = new WebSocket("ws://localhost:3001");
ws.onmessage = (msg) => {
  const text = msg.data;
  const match = text.match(/(\d+\.\d+)%/);
  if (match) {
    progressBar.style.width = match[1] + "%";
  }
};

// サムネイル取得
async function loadThumbnail(url) {
  const res = await fetch("/api/thumbnail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  if (data.status) {
    thumb.src = data.thumbnail;
    thumb.style.display = "block";
  }
}

btn.addEventListener("click", async () => {
  const url = document.getElementById("url").value;

  result.innerHTML = "▶ 解析中...";
  progressBar.style.width = "0%";

  loadThumbnail(url);

  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  const data = await res.json();

  if (!data.status) {
    result.innerHTML = "✖ ERROR\n" + data.error;
    return;
  }

  result.innerHTML = `✔ COMPLETE\n保存先:\n${data.file}`;
});
