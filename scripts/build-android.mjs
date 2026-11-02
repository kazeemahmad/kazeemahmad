import { copyFile, existsSync, mkdir } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const androidSdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const javaCommand = process.env.JAVA_HOME
  ? resolve(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java")
  : "java";

if (!androidSdk || !existsSync(androidSdk)) {
  throw new Error("Android SDK not found. Install the Android SDK and set ANDROID_HOME or ANDROID_SDK_ROOT.");
}

const java = spawnSync(javaCommand, ["-version"], { encoding: "utf8" });
if (java.error) throw java.error;
const javaVersion = `${java.stdout}\n${java.stderr}`.match(/version "(?:1\.)?(\d+)/);
const javaMajor = Number(javaVersion?.[1]);
if (!javaVersion || javaMajor < 17 || javaMajor > 24) {
  throw new Error("Android builds require JDK 17-24. JDK 21 is recommended.");
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    ...options
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

run(process.execPath, ["build-offline.mjs"]);
run(process.execPath, ["scripts/prepare-app-game.mjs"]);

if (!existsSync(resolve(root, "android"))) {
  run(npxCommand, ["cap", "add", "android"]);
}

run(npxCommand, ["cap", "sync", "android"]);

const gradleCommand = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
run(gradleCommand, ["assembleDebug"], { cwd: resolve(root, "android") });

const apkPath = resolve(root, "android/app/build/outputs/apk/debug/app-debug.apk");
const releaseDirectory = resolve(root, "dist");
const releaseApk = resolve(releaseDirectory, "UltimateSnake.apk");
await mkdir(releaseDirectory, { recursive: true });
await copyFile(apkPath, releaseApk);

console.log(`Built Android game APK: ${releaseApk}`);
