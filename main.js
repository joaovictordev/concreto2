const { app, BrowserWindow } = require("electron");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Calculo de Pilar",
    width: 550,
    height: 900,
    resizable: true,
    autoHideMenuBar: true,
    icon: `${__dirname}/img/icon.png`,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/main.html`);
}

app.on("ready", createMainWindow);
