const {contextBridge, ipcRenderer} = require('electron/renderer')
contextBridge.exposeInMainWorld('electronAPI', {
    setImg: (callback: (data: Uint8Array, startTime: number) => void) => ipcRenderer.on('SET_SOURCE_BG', (_event, value, startTime) => callback(value, startTime)),
    clear: (callback) => ipcRenderer.on('CLEAR_CANVAS', (_event) => callback()),
    hideWin:()=>ipcRenderer.send('HIDE_WIN')
})