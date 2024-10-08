import {
    app,
    BrowserWindowConstructorOptions,
    desktopCapturer,
    globalShortcut,
    BrowserWindow,
    screen,
    ipcMain,
} from 'electron';
import * as path from "path";

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
    if (process.argv.length > 2 && process.argv.find(v => v.includes('http://localhost'))) {
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
                // console.log(new Date().getTime() - startTime);
                // fs.writeFileSync(String(new Date().getTime() - startTime) + "-1.png", source.thumbnail.toPNG())
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
        if (currentWindow) {
            if (currentWindow.isMinimized()) {
                currentWindow.restore();
            }
            if (!currentWindow.isVisible()) {
                currentWindow.show();
            }
            currentWindow.focus();
            currentWindow.webContents.reload();
        }
    });
    app.whenReady().then(async () => {
        currentWindow = await createWindow();
        ipcMain.on('HIDE_WIN', () => {
            if (currentWindow) {
                currentWindow.webContents.reload();
                currentWindow.minimize();
            }
        })

        globalShortcut.register('F2', async () => {
            if (!currentWindow) {
                currentWindow = await createWindow();
            }
            capture()
            currentWindow.show();
        })
        globalShortcut.register('CommandOrControl+T', async () => {
            currentWindow.destroy();
            await pinWindow()
            currentWindow = await createWindow();
        })
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
