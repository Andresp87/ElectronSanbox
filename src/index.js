const { app, Menu, Tray } = require("electron");
const path = require("path");
const { createWindow, createLoginWindow } = require("./main");

require("./database");

app.whenReady().then(() => {
  // createWindow()
  createLoginWindow();
  // FUNCIONALIDAD PARA ICONO DE BANDEJA
  // tray = new Tray(path.join(__dirname,'../assets/icon_user.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: "Item1", type: "normal" },
    { label: "Item2", type: "separator" },
    { label: "Item3", type: "radio", checked: true },
    { label: "Item4", type: "checkbox" },
  ]);
  // tray.setToolTip('This is my application.')
  // tray.setContextMenu(contextMenu)
});

try {
  require("electron-reloader")(module);
} catch (_) {}

app.allowRendererProcessReuse = false;
