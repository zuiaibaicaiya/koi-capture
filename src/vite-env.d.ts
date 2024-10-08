/// <reference types="vite/client" />
export interface IElectronAPI {
    loadPreferences: () => Promise<void>,
    setImg: (callback: (data: Uint8Array, startTime: number) => void) => void,
    clear: (callback: () => void) => void,
    hideWin: () => void,
}

declare global {
    interface Window {
        electronAPI?: IElectronAPI
    }
}
export {}