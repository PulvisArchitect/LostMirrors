import { app, BrowserWindow, globalShortcut } from 'electron';
import electronDl from 'electron-dl';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import urlExist from 'url-exist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cwd = path.resolve('.');

const settingsFilePath = path.join(cwd, 'settings.json');
app.commandLine.appendSwitch('disable-http-cache');

let settings;

if (fs.existsSync(settingsFilePath)) {
    const buffer = fs.readFileSync(settingsFilePath);
    settings = JSON.parse(buffer.toString());
} else {
    const defaultSettings = {
        "applicationUrl": "https://pulvis.jp/HyperbolicKaleidoscope",
        "fallbackFilePath": "../HyperbolicKaleidoscope/docs/index.html",
        "enableDevTools": false,
        "params": {
            "debug": false,
            "scene": {
            },
            "logging": {
                "url": "https://hooks.slack.com/services/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",
                "clientName": "machine1"
            }
        }
    };
    settings = defaultSettings;
    fs.writeFileSync(
        settingsFilePath,
        Buffer.from(JSON.stringify(settings, null, '    ')),
    );
}

function composeURL(settings) {
    const url = settings['applicationUrl'];
    const searchParams = new URLSearchParams({
        'params': btoa(JSON.stringify(settings.params))
    });
    return url + '?' + searchParams.toString();
}

electronDl();

const url = composeURL(settings);
let isURLValid = false;
try {
    isURLValid = await urlExist(url);
} catch (error) {
    isURLValid = false;
}

await postMessage(settings.params.logging,
                  'Lost Mirrorsが起動しました. ').catch((error) => {
                      console.error(error);
                  });

function createWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,
        autoHideMenuBar: true,
        frame: false,
        kiosk: true,
        alwaysOnTop: true,
    });
    if(settings.enableDevTools) {
        win.webContents.openDevTools();
    }
    if(isURLValid){
        win.loadURL(composeURL(settings));
    } else {
        win.loadFile(path.join(cwd, settings.fallbackFilePath),
                     {
                         query: {
                             params: btoa(JSON.stringify(settings.params))
                         }
                     });
    }
};

/**
 * @param {object} loggingSettings
 * @param {string} message
 */
async function postMessage(loggingSettings, message){
    const response = await fetch(loggingSettings.url, {
        method: 'POST',
        body: JSON.stringify({
            text: `${loggingSettings.clientName}: ${message}`
        })
    });
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', async () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    const ret = globalShortcut.register('ctrl+q', async () => {
        await postMessage(settings.params.logging,
            'Lost Mirrorsが終了しました. ').catch((error) => {
                console.error(error);
            });
        app.quit();
    });
    if (!ret) {
        console.log('registration failed');
    }
});

app.on('will-quit', async () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') app.quit();
});
