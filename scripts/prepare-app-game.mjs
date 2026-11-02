import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "snake-game-offline.html");
const source = await readFile(sourcePath, "utf8");

const outputs = [
  resolve(root, "electron/game.html"),
  resolve(root, "android-app/www/index.html")
];

for (const output of outputs) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, source);
}
