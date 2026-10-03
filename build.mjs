import { mkdir, copyFile, cp, rm } from "node:fs/promises";
const root = new URL("./", import.meta.url);
const dist = new URL("./dist/", root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of [
  "index.html",
  "style.css",
  "play.css",
  "game.js",
  "adventure.js",
  "questions.js",
  "journey-ui.js",
  "vehicles.js",
  "library.js",
  "cloud-save.js",
  "id.js",
  "evidence.js",
  "manifest.webmanifest",
])
  await copyFile(new URL(file, root), new URL(file, dist));
await cp(new URL("assets/", root), new URL("assets/", dist), {
  recursive: true,
});
await cp(new URL("icons/", root), new URL("icons/", dist), {
  recursive: true,
});
console.log("Cloudkeepers built in dist/ — all assets are local.");
