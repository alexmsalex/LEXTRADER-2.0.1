
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// LEXTRADER-IAG DESKTOP LAUNCHER
// Este arquivo permite a compilação para .EXE e acesso ao disco nativo.

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    backgroundColor: '#050505',
    title: 'LEXTRADER-IAG Terminal Quântico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Necessário para acesso direto ao 'process' no renderer (para fins de demo)
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'favicon.ico')
  });

  // Em produção (Buildado), carrega o arquivo da pasta dist. Em dev, carrega localhost.
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  
  win.loadURL(startUrl);

  // Ocultar menu padrão
  win.setMenuBarVisibility(false);

  // Abrir DevTools apenas se não estiver empacotado
  if (!app.isPackaged) {
    // win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- API NATIVA PARA O FRONTEND (DRIVE ACCESS) ---

ipcMain.handle('scan-drive', async (event, drivePath) => {
    try {
        const files = fs.readdirSync(drivePath || os.homedir());
        return {
            path: drivePath,
            files: files.slice(0, 50), // Limitar para não travar a UI
            status: 'ACCESS_GRANTED'
        };
    } catch (error) {
        return { error: error.message, status: 'ACCESS_DENIED' };
    }
});

ipcMain.handle('write-neural-memory', async (event, data) => {
    const filePath = path.join(os.homedir(), 'lextrader_neural_core.json');
    fs.writeFileSync(filePath, JSON.stringify(data));
    return { success: true, path: filePath };
});