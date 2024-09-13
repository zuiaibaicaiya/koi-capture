const { contextBridge, ipcRenderer } = require('electron/renderer')
contextBridge.exposeInMainWorld('electronAPI', {
    setImg: (callback: (data: Uint8Array) => void) => ipcRenderer.on('SET_SOURCE_BG', (_event, value) => callback(value)),
})