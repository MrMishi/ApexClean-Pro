const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('app-minimize'),
  maximize: () => ipcRenderer.send('app-maximize'),
  close: () => ipcRenderer.send('app-close'),
  isElectron: true,
});
