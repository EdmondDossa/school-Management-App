import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Database from './database.js';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

/**
 * Initialise la base de données et crée la fenêtre principale
 */
async function initialize() {
  try {
    await Database.init();
    createWindow();
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
    app.quit();
  }
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

/**
 * Wrapper générique pour la gestion des erreurs et des requêtes de base de données
 * @param {Function} method - Méthode à exécuter
 * @returns {Function} - Fonction compatible avec ipcMain
 */
function createDbHandler(method) {
  return async (event, args) => {
    try {
      const result = await method(args);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Erreur dans ${method.name}:`, error);
      return { success: false, error: error.message };
    }
  };
}

// Handlers de base de données
ipcMain.handle('db-query', createDbHandler(({ sql, params }) => Database.query(sql, params)));
ipcMain.handle('db-get-all', createDbHandler(({ table, options }) => Database.getAll(table, options)));
ipcMain.handle('db-get-by-id', createDbHandler(({ table, id }) => Database.getById(table, id)));
ipcMain.handle('db-insert', createDbHandler(({ table, data }) => Database.insert(table, data)));
ipcMain.handle('db-update', createDbHandler(({ table, data, conditions }) => Database.update(table, data, conditions)));
ipcMain.handle('db-delete', createDbHandler(({ table, conditions }) => Database.delete(table, conditions)));

/**
* Handler pour exécuter plusieurs opérations dans une transaction
*/
ipcMain.handle('db-transaction', async (event, { operations }) => {
  try {
    await Database.transactionAsync(async () => {
      for (const op of operations) {
        const { type, args } = op;

        switch (type) {
          case 'insert':
            await Database.insert(args.table, args.data);
            break;
          case 'update':
            await Database.update(args.table, args.data, args.conditions);
            break;
          case 'delete':
            await Database.delete(args.table, args.conditions);
            break;
          case 'query':
            await Database.query(args.sql, args.params);
            break;
          default:
            throw new Error(`Type d'opération inconnu: ${type}`);
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur de transaction:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Handler pour la navigation entre les pages
 */
ipcMain.on('navigate', (event, route) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.webContents.send('navigate', route);
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(initialize);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
