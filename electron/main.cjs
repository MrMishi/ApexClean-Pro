const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { registerSystemBridge } = require('./systemBridge.cjs');

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, '../public/favicon.ico');
  const windowOptions = {
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    title: 'ApexClean Pro - Optimizador de Sistema y Limpieza de PC',
    backgroundColor: '#020617', // slate-950
    autoHideMenuBar: true,
    frame: true, // Native Windows chrome frame
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  };

  if (fs.existsSync(iconPath)) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);

  // In production, load the built index.html from dist
  const distIndexPath = path.join(__dirname, '../dist/index.html');
  
  if (app.isPackaged || process.env.NODE_ENV === 'production') {
    mainWindow.loadFile(distIndexPath);
  } else {
    // If DEV_SERVER_URL is provided or fallback to local port 3000
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl).catch(() => {
      // If dev server is not running, load the dist build
      mainWindow.loadFile(distIndexPath);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC handlers
ipcMain.on('app-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('app-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('app-close', () => {
  if (mainWindow) mainWindow.close();
});

app.whenReady().then(() => {
  registerSystemBridge();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
