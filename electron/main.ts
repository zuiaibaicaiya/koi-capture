import {
    app,
    BrowserWindowConstructorOptions,
    desktopCapturer,
    globalShortcut,
    BrowserWindow,
    screen,
} from 'electron';

import path from 'path'
import fs from "fs";


let mainWindow: BrowserWindow;
let currentWindow: BrowserWindow;


const createWindow = async () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width, height} = primaryDisplay.bounds
    const config: BrowserWindowConstructorOptions = {
        width,
        height,
        // resizable: false,
        // maximizable: false,
        // titleBarStyle: "hidden",
        frame: false,
        // alwaysOnTop: true,
        // skipTaskbar: true,
        transparent: true,
        fullscreen: true,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        show: false,
        paintWhenInitiallyHidden: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
    };
    // mainWindow.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true})
    const mainWindow = new BrowserWindow(config);
    if (process.argv.length > 2) {
        await mainWindow.loadURL(process.argv[2])
        // mainWindow.webContents.openDevTools({mode: 'bottom'});
    } else {
        await mainWindow.loadFile('dist/index.html');
    }
    return mainWindow;
};
const pinWindow = async () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width, height} = primaryDisplay.bounds
    const config: BrowserWindowConstructorOptions = {
        width: 500,
        height: 400,
        show: true,
        x: width - 500,
        y: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
    };
    // mainWindow.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true})
    const mainWindow = new BrowserWindow(config);
    if (process.argv.length > 2) {
        await mainWindow.loadURL(process.argv[2])
        // mainWindow.webContents.openDevTools({mode: 'undocked'});
    } else {
        await mainWindow.loadFile('dist/index.html');
    }
    // mainWindow.webContents.openDevTools({mode: 'undocked'});
}

function capture() {
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width, height} = primaryDisplay.bounds
    desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
            width: width * primaryDisplay.scaleFactor,
            height: height * primaryDisplay.scaleFactor,
        }
    }).then(sources => {
        for (const source of sources) {
            if (source.id.startsWith('screen')) {
                fs.writeFileSync(new Date().getTime() + "-1.png", source.thumbnail.toPNG())
                setImmediate(() => {
                    currentWindow.webContents.send('SET_SOURCE_BG', source.thumbnail.toPNG())
                })
                return
            }
        }
    })


}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 用户正在尝试运行第二个实例，我们需要让焦点指向我们的窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            mainWindow.focus();
        }
    });
    app.whenReady().then(async () => {
        currentWindow = await createWindow();
        globalShortcut.register('F1', async () => {
            if (!currentWindow) {
                currentWindow = await createWindow();
            }
            currentWindow.show()
            setImmediate(() => {
                capture()
            })
        })
        // globalShortcut.register('Esc', async () => {
        //     currentWindow.destroy();
        //     currentWindow = await createWindow();
        // })
        globalShortcut.register('CommandOrControl+T', async () => {
            currentWindow.destroy();
            await pinWindow()
            currentWindow = await createWindow();
        })
        if (process.env.NODE_ENV === 'building') {
            // encryptFile();
        }
    });
    app.on('window-all-closed', () => {
        globalShortcut.unregisterAll();
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}
