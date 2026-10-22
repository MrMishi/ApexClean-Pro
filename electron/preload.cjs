const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('app-minimize'),
  maximize: () => ipcRenderer.send('app-maximize'),
  close: () => ipcRenderer.send('app-close'),
  isElectron: true,

  // Real System Information & Telemetry
  getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
  getHardwareStats: () => ipcRenderer.invoke('system:get-hardware-stats'),

  // Real Windows Startup Applications
  getStartupApps: () => ipcRenderer.invoke('system:get-startup-apps'),
  toggleStartupApp: (name, enabled) => ipcRenderer.invoke('system:toggle-startup-app', { name, enabled }),

  // Real Windows Processes
  getProcesses: () => ipcRenderer.invoke('system:get-processes'),
  killProcess: (pid) => ipcRenderer.invoke('system:kill-process', { pid }),

  // Real Windows Junk Cleaner
  scanJunk: () => ipcRenderer.invoke('system:scan-junk'),
  cleanJunk: (itemIds) => ipcRenderer.invoke('system:clean-junk', { itemIds }),

  // RAM Purge
  purgeRam: () => ipcRenderer.invoke('system:purge-ram'),
});
