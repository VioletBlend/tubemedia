import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const isWin = process.platform === "win32";
const pythonCmd = isWin ? "python" : "python3";

// Python 起動
const py = spawn(pythonCmd, ["main.py"], {
  cwd: path.join(__dirname, "../py2rest")
});

py.stdout.on("data", d => console.log("[py2rest]", d.toString()));
py.stderr.on("data", d => console.error("[py2rest ERROR]", d.toString()));

// ★ サムネイル取得
app.post("/api/thumbnail", async (req, res) => {
  const { url } = req.body;

  const apiRes = await fetch("http://127.0.0.1:5000/thumbnail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  const data = await apiRes.json();
  res.json(data);
});

// ★ ダウンロード
app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  const apiRes = await fetch("http://127.0.0.1:5000/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  const data = await apiRes.json();
  res.json(data);
});

app.listen(3000, () => {
  console.log("Node.js running → http://localhost:3000");
});
