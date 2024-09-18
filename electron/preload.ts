const {contextBridge, ipcRenderer} = require('electron/renderer')
contextBridge.exposeInMainWorld('electronAPI', {
    setImg: (callback: (data: Uint8Array) => void) => ipcRenderer.on('SET_SOURCE_BG', (_event, value) => callback(value)),
    clear: (callback) => ipcRenderer.on('CLEAR_CANVAS', (_event) => callback())
})