const { app, BrowserWindow } = require("electron");
const { join } = require("node:path");

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 560,
    title: "Ultimate Snake",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.loadFile(join(__dirname, "game.html")).catch(error => {
    console.error("Could not load the game:", error);
    app.exit(1);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
