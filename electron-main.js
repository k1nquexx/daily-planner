const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let javaProcess = null;

const SERVER_URL = 'http://localhost:8080';

function checkServerReady(callback, retries = 30) {
  http.get(`${SERVER_URL}/api/network-info`, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      retry();
    }
  }).on('error', () => {
    retry();
  });

  function retry() {
    if (retries <= 0) {
      callback(false);
      return;
    }
    setTimeout(() => checkServerReady(callback, retries - 1), 600);
  }
}

function startBackendIfNeeded(callback) {
  checkServerReady((isReady) => {
    if (isReady) {
      callback();
      return;
    }

    const jarPath = path.join(__dirname, 'backend', 'build', 'libs', 'daily-planner-0.0.1-SNAPSHOT.jar');
    javaProcess = spawn('java', ['-jar', jarPath], {
      cwd: path.join(__dirname, 'backend', 'build', 'libs'),
      detached: false,
      stdio: 'ignore'
    });

    checkServerReady((readyAfterSpawn) => {
      callback();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 860,
    minWidth: 700,
    minHeight: 600,
    title: 'DayFlow',
    autoHideMenuBar: true,
    backgroundColor: '#020617',
    icon: path.join(__dirname, 'frontend', 'public', 'icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(SERVER_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendIfNeeded(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (javaProcess) {
    try {
      javaProcess.kill();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
