/// <reference types="vite/client" />
export interface IElectronAPI {
    loadPreferences: () => Promise<void>,
    setImg: (callback: (data: Uint8Array) => void) => void,
    clear: (callback: () => void) => void,
}

declare global {
    interface Window {
        electronAPI?: IElectronAPI
    }
}
export {}