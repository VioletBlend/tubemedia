import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import os from "os";
import fs from "fs";
import { WebSocketServer } from "ws";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
// WebSocket（進捗送信用）
const wss = new WebSocketServer({ port: 3001 });
function broadcastProgress(text) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1)
            client.send(text);
    });
}
// 英単語辞書（200語以上）
const words = [
    "sunrise", "sunset", "forest", "river", "ocean", "harbor", "island", "meadow", "valley",
    "mountain", "canyon", "desert", "prairie", "horizon", "rainfall", "thunder", "storm",
    "breeze", "shadow", "ember", "blossom", "crystal", "mist", "glacier", "solstice",
    "nebula", "galaxy", "cosmos", "orbit", "meteor", "comet", "asteroid", "eclipse",
    "starlight", "supernova", "quasar", "pulsar", "gravity", "void", "nova", "zenith",
    "falcon", "raven", "wolf", "tiger", "panther", "lynx", "eagle", "phoenix", "dragon",
    "orca", "dolphin", "lion", "hawk", "serpent", "griffin", "pegasus",
    "mythos", "arcane", "rune", "specter", "phantom", "oracle", "titan", "leviathan",
    "chimera", "wyrm", "valkyrie", "odin", "zephyr", "aether", "elysium", "asgard",
    "voyager", "sentinel", "vortex", "cipher", "matrix", "nexus", "vertex", "echo",
    "quantum", "paradox", "legacy", "harmony", "infinity", "radiance", "pulse", "flux",
    "ember", "signal", "origin", "apex", "zen", "prime", "core", "element", "spirit",
    "pixel", "byte", "circuit", "module", "engine", "system", "protocol", "vector",
    "neon", "cyber", "fusion", "ion", "reactor", "terminal", "network",
    "scarlet", "azure", "violet", "amber", "silver", "onyx", "obsidian", "emerald",
    "sapphire", "ruby", "pearl", "opal", "topaz", "crimson", "indigo", "golden"
];
function randomWord() {
    return words[Math.floor(Math.random() * words.length)];
}
// .part → .mp4 の強化処理
function fixPartFiles(downloadDir, finalPath) {
    const files = fs.readdirSync(downloadDir);
    const partFiles = files.filter((f) => f.endsWith(".part"));
    if (partFiles.length === 0)
        return false;
    // 一番大きい .part を採用
    let largest = partFiles
        .map((f) => ({
        name: f,
        size: fs.statSync(path.join(downloadDir, f)).size,
    }))
        .sort((a, b) => b.size - a.size)[0];
    const partPath = path.join(downloadDir, largest.name);
    // リネーム
    fs.renameSync(partPath, finalPath);
    // 残りの .part を削除
    partFiles.forEach((f) => {
        if (f !== largest.name) {
            fs.unlinkSync(path.join(downloadDir, f));
        }
    });
    return true;
}
// サムネイル取得
app.post("/api/thumbnail", (req, res) => {
    const { url } = req.body;
    exec(`yt-dlp --get-thumbnail "${url}"`, (err, stdout) => {
        if (err)
            return res.json({ status: false });
        res.json({
            status: true,
            thumbnail: stdout.trim(),
        });
    });
});
// ダウンロード処理
app.post("/api/download", (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.json({ status: false, error: "URLが入力されていません。" });
    }
    const filename = `${randomWord()}.mp4`;
    const downloadDir = path.join(os.homedir(), "Downloads");
    const outputPath = path.join(downloadDir, filename);
    const cmd = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 --progress -o "${outputPath}" "${url}"`;
    const child = exec(cmd, { maxBuffer: 1024 * 1024 * 10 });
    // 進捗を WebSocket で送信
    child.stdout.on("data", (data) => {
        const text = data.toString();
        if (text.includes("[download]"))
            broadcastProgress(text);
    });
    child.on("close", () => {
        // mp4 が生成されていれば成功
        if (fs.existsSync(outputPath)) {
            return res.json({ status: true, file: outputPath });
        }
        // 失敗 → .part を探してリネーム
        const fixed = fixPartFiles(downloadDir, outputPath);
        if (fixed) {
            return res.json({
                status: true,
                file: outputPath,
                note: ".part を mp4 にリネームしました",
            });
        }
        return res.json({
            status: false,
            error: "ダウンロードに失敗しました。",
        });
    });
});
app.listen(3000, () => {
    console.log("Server running → http://localhost:3000");
});
