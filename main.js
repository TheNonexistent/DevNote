const {app, BrowserWindow} = require('electron')

const path = require('path')  

require('electron-reload')(__dirname);


let win

function createWindow () 
{
    win = new BrowserWindow({
        width: 800,
        minWidth: 800,
        height: 600,
        minHeight: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

    win.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})
