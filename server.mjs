import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(
  new URL(process.argv.includes("--dist") ? "./dist/" : "./", import.meta.url),
);
const port = Number(process.env.PORT || 4317);
const allowed = new Set([
  "index.html",
  "style.css",
  "play.css",
  "game.js",
  "adventure.js",
  "questions.js",
  "journey-ui.js",
  "vehicles.js",
  "assets",
]);
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const relative = path === "/" ? "index.html" : path.replace(/^\/+/, "");
    const file = resolve(root, relative);
    if (
      !file.startsWith(root.endsWith(sep) ? root : root + sep) ||
      !allowed.has(relative.split("/")[0])
    ) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": `${types[extname(file)] || "application/octet-stream"}${[".html", ".css", ".js", ".svg"].includes(extname(file)) ? "; charset=utf-8" : ""}`,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : await readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Cloudkeepers is ready at http://127.0.0.1:${port}`),
);
