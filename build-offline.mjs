import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(root, "index.html");
const outputPath = resolve(root, "snake-game-offline.html");
const html = await readFile(htmlPath, "utf8");
const moduleScript = /<script type="module">([\s\S]*?)<\/script>/;
const match = html.match(moduleScript);

if (!match) throw new Error("Could not find the game's module script in index.html");

const result = await build({
  stdin: {
    contents: match[1],
    resolveDir: root,
    sourcefile: "snake-game.js",
    loader: "js"
  },
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  legalComments: "none",
  write: false
});

const offlineHtml = html.replace(moduleScript, `<script>${result.outputFiles[0].text}</script>`);
await writeFile(outputPath, offlineHtml);
console.log(`Built standalone game: ${outputPath}`);