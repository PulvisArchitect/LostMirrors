import { app, BrowserWindow, globalShortcut } from 'electron';
import electronDl from 'electron-dl';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

store.set('applicationUrl', 'https://pulvis.jp/HyperbolicKaleidoscope');

const settingsFilePath = path.join(path.resolve('.'), 'settings.json');
app.commandLine.appendSwitch('disable-http-cache');

let settings;

if (fs.existsSync(settingsFilePath)) {
    const buffer = fs.readFileSync(settingsFilePath);
    settings = JSON.parse(buffer.toString());
} else {
    const defaultSettings = {
        applicationUrl: 'https://pulvis.jp/HyperbolicKaleidoscope',
        params: {
            debug: false,
            defaultScale: 4.5,
            frameDelayMillis: 0,
        },
    };
    settings = defaultSettings;
    fs.writeFileSync(
        settingsFilePath,
        Buffer.from(JSON.stringify(settings, null, '    ')),
    );
}

function composeURL(settings) {
    const url = settings['applicationUrl'];
    const searchParams = new URLSearchParams(settings.params);
    return url + '?' + searchParams.toString();
}

electronDl();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,
        autoHideMenuBar: true,
        frane: false,
        kiosk: true,
        alwaysOnTop: true,
    });
    //win.webContents.openDevTools();
    win.loadURL(composeURL(settings));
};

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    const ret = globalShortcut.register('ctrl+q', () => {
        app.quit();
    });
    if (!ret) {
        console.log('registration failed');
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
