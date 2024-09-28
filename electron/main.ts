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
        alwaysOnTop: true,
        skipTaskbar: true,
        transparent: true,
        fullscreen: true,
        resizable: false,
        // backgroundColor: "rgba(0, 0, 0, 0.6)",
        show: false,
        paintWhenInitiallyHidden: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
    };
    const mainWindow = new BrowserWindow(config);
    mainWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true})
    if (process.argv.length > 2) {
        await mainWindow.loadURL(process.argv[2])
        // mainWindow.webContents.openDevTools({mode: 'undocked'});
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
        skipTaskbar: true,
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
    const startTime = new Date().getTime();
    desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
            width: width * primaryDisplay.scaleFactor,
            height: height * primaryDisplay.scaleFactor,
        }
    }).then(sources => {
        for (const source of sources) {
            if (source.id.startsWith('screen')) {
                currentWindow.webContents.send('SET_SOURCE_BG', source.thumbnail.toPNG(), startTime)
                console.log(new Date().getTime() - startTime);
                fs.writeFileSync(String(new Date().getTime() - startTime) + "-1.png", source.thumbnail.toPNG())
                break
            }
        }
        // currentWindow.show();
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
        mainWindow = await createWindow();
        globalShortcut.register('F2', async () => {
            if (!currentWindow) {
                currentWindow = await createWindow();
            }
            capture()
            currentWindow.show();
        })
        globalShortcut.register('F3', async () => {
            if (currentWindow) {
                currentWindow.webContents.send('CLEAR_CANVAS');
                currentWindow.minimize();
            }
        })
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
