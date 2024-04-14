import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

store.set('applicationUrl',
          'https://pulvis.jp/HyperbolicKaleidoscope');

const settingsFilePath = path.join(path.resolve('.'),
                                   'settings.json');

let settings = {
    'applicationUrl': 'https://pulvis.jp/HyperbolicKaleidoscope',
    'params': {
        'debug': false,
        'defaultScale': 4.5
    }
};

if(fs.existsSync(settingsFilePath)) {
    const buffer = fs.readFileSync(settingsFilePath);
    settings = JSON.parse(buffer.toString());
} else {
    fs.writeFileSync(settingsFilePath,
                     Buffer.from(JSON.stringify(settings)));
}

function composeURL(settings) {
    const url = settings['applicationUrl'];
    const searchParams = new URLSearchParams(settings.params);
    return url + '?'+ searchParams.toString();
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        fullscreen: true,
        autoHideMenuBar: true,
        frane: false,
        kiosk: true,
        alwaysOnTop: true
    });

    win.loadURL(store.get('applicationUrl'));
};


app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    const ret = globalShortcut.register('ctrl+q', () => {
        app.quit();
    });
    if (!ret) {
        console.log('registration failed')
    };
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});
 
