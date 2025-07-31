const { app, protocol, BrowserWindow, ipcMain, dialog } = require("electron");
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import Store from "electron-store";
const store = new Store();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const log = require("electron-log");
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";
import { db as Database, initializeDatabase } from "./database.js";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  log.info("Ready");
  electronApp.setAppUserModelId("com.exampapersetter");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "");
    const filePath = path.join(app.getAppPath(), url);
    callback(filePath);
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

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
initializeDatabase();
// Function To Minimize Window
ipcMain.handle("minimize", () => {
  mainWindow.minimize();
});

// Function To Maximize Window
ipcMain.handle("maximize", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle("showDialog", async (event, args) => {
  let win = null;
  switch (args.window) {
    case "mainWindow":
      win = mainWindow;
      break;
    case "CourseWindow":
      win = CourseWindow;
      break;
    default:
      break;
  }

  return dialog.showMessageBox(win, args.options);
});

//useful than window.confirm because window.confirm locks input after used
ipcMain.handle("openDialog", async (events, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "warning",
    message: message,
    buttons: ["Oui", "Non"],
  });
  return result.response === 0;
});

ipcMain.handle("alertDialog", async (events, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "info",
    message: message,
    buttons: ["OK,compris."],
  });
  return result.response === 0;
});

ipcMain.handle("app-get-path", (event, args) => {
  return app.getPath(args.path);
});
ipcMain.handle("get-app-path", (event, args) => {
  return app.getAppPath();
});

ipcMain.handle(
  "save-file",
  async (event, { fileName, fileData, targetSubfolder }) => {
    try {
      const resourcesPath = path.join(
        app.getAppPath(),
        "resources",
        targetSubfolder
      );

      // Créer le dossier si nécessaire
      if (!fs.existsSync(resourcesPath)) {
        fs.mkdirSync(resourcesPath, { recursive: true });
      }

      const filePath = path.join(resourcesPath, fileName);

      // Convertir Uint8Array en Buffer pour Node.js
      const buffer = Buffer.from(fileData);

      fs.writeFileSync(filePath, buffer);

      return {
        success: true,
        path: filePath,
        folder: targetSubfolder,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
);

// Function To Close Window
ipcMain.handle("close", (event, args) => {
  switch (args) {
    case "mainWindow":
      app.quit();
      break;
    case "CourseWindow":
      mainWindow.webContents.send("reload");
      CourseWindow.close();
      break;
    default:
      break;
  }
});

// Handlers de base de données
ipcMain.handle(
  "db-query",
  createDbHandler(({ sql, params }) => Database.raw(sql, params))
);
ipcMain.handle(
  "db-get-all",
  createDbHandler(({ table, options }) => Database.getAll(table, options))
);
ipcMain.handle(
  "db-get-by-id",
  createDbHandler(({ table, id }) => Database.getById(table, id))
);
ipcMain.handle(
  "db-insert",
  createDbHandler(({ table, data }) => Database.insert(table, data))
);
ipcMain.handle(
  "db-update",
  createDbHandler(({ table, data, conditions }) =>
    Database.update(table, data, conditions)
  )
);
ipcMain.handle(
  "db-delete",
  createDbHandler(({ table, conditions }) => Database.delete(table, conditions))
);

/**
 * Handler pour exécuter plusieurs opérations dans une transaction
 */
ipcMain.handle("db-transaction", async (event, { operations }) => {
  try {
    await Database.transactionAsync(async () => {
      for (const op of operations) {
        const { type, args } = op;

        switch (type) {
          case "insert":
            await Database.insert(args.table, args.data);
            break;
          case "update":
            await Database.update(args.table, args.data, args.conditions);
            break;
          case "delete":
            await Database.delete(args.table, args.conditions);
            break;
          case "query":
            await Database.raw(args.sql, args.params);
            break;
          default:
            throw new Error(`Type d'opération inconnu: ${type}`);
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur de transaction:", error);
    return { success: false, error: error.message };
  }
});

// store

ipcMain.handle("electron-store-get", (event, key) => {
  return store.get(key);
});

ipcMain.handle("electron-store-set", (event, key, val) => {
  return store.set(key, val);
});

ipcMain.handle("electron-store-delete", (event, key) => {
  return store.delete(key);
});

// Auth handlers
ipcMain.handle('auth-create-user', async (event, { username, password }) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return Database('utilisateurs').insert({ username, password: hashedPassword, role: 'admin' });
});

ipcMain.handle('auth-verify-user', async (event, { username, password }) => {
  const user = await Database('utilisateurs').where({ username }).first();
  if (!user) {
    return { success: false, message: 'Mot de passe incorrect.' };
  }

  const failedAttemptsKey = `failed_attempts_${username}`;
  const lockoutUntilKey = `lockout_until_${username}`;
  const systemPasswordRequiredKey = `system_password_required_${username}`;

  let failedAttempts = store.get(failedAttemptsKey, 0);
  let lockoutUntil = store.get(lockoutUntilKey, 0);
  let systemPasswordRequired = store.get(systemPasswordRequiredKey, false);

  const now = Date.now();

  // Si le mot de passe système est requis, on ne vérifie plus le mot de passe normal
  if (systemPasswordRequired) {
    return { success: false, systemPasswordRequired: true, message: 'Veuillez utiliser le mot de passe système.' };
  }

  // Vérifier si l'utilisateur est actuellement verrouillé
  if (lockoutUntil > now) {
    return { success: false, isLockedOut: true, lockoutEndsAt: lockoutUntil, message: 'Trop de tentatives. Veuillez réessayer plus tard.' };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    // Connexion réussie : réinitialiser les compteurs
    store.set(failedAttemptsKey, 0);
    store.set(lockoutUntilKey, 0);
    return { success: true };
  } else {
    // Mot de passe incorrect : incrémenter les tentatives échouées
    failedAttempts++;
    store.set(failedAttemptsKey, failedAttempts);

    if (failedAttempts >= 3) {
      // Si 3 tentatives échouées, verrouiller pour 5 minutes
      const newLockoutUntil = now + 5 * 60 * 1000; // 5 minutes en ms
      store.set(lockoutUntilKey, newLockoutUntil);
      // Réinitialiser les tentatives après un verrouillage pour le prochain cycle
      store.set(failedAttemptsKey, 0);

      // Si c'est le 3ème verrouillage (3 * 3 = 9 tentatives échouées au total)
      if (failedAttempts % 3 === 0 && failedAttempts / 3 >= 3) {
        store.set(systemPasswordRequiredKey, true);
        return { success: false, systemPasswordRequired: true, message: 'Trop de tentatives. Veuillez utiliser le mot de passe système.' };
      }
      return { success: false, isLockedOut: true, lockoutEndsAt: newLockoutUntil, message: 'Trop de tentatives. Veuillez réessayer plus tard.' };
    }
    return { success: false, message: 'Mot de passe incorrect.' };
  }
});

ipcMain.handle('auth-has-users', async () => {
  const result = await Database('utilisateurs').count('id as count').first();
  return result.count > 0;
});

ipcMain.handle('auth-change-password', async (event, { username, newPassword }) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await Database('utilisateurs').where({ username }).update({ password: hashedPassword });
    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: error.message };
  }
});

/**
 * Handler pour la navigation entre les pages
 */
ipcMain.on("navigate", (event, route) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.webContents.send("navigate", route);
  }
});

app.on("activate", () => {
  if (mainWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on("uncaughtException", (error) => {
  log.info(`Exception: ${error}`);
  if (process.platform !== "darwin") {
    app.quit();
  }
});


app.on('before-quit', () => {
  // Effacer le statut de connexion avant de quitter
  store.delete('loggedIn');
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
