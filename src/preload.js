const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // electron-store
  store: {
    get: (key) => ipcRenderer.invoke("electron-store-get", key),
    set: (key, value) => ipcRenderer.invoke("electron-store-set", key, value),
    delete: (key) => ipcRenderer.invoke("electron-store-delete", key),
  },

  // Auth
  auth: {
    createUser: ({ username, password }) =>
      ipcRenderer.invoke("auth-create-user", { username, password }),
    verifyUser: ({ username, password }) =>
      ipcRenderer.invoke("auth-verify-user", { username, password }),
    hasUsers: () => ipcRenderer.invoke("auth-has-users"),
    changePassword: ({ username, newPassword }) =>
      ipcRenderer.invoke("auth-change-password", { username, newPassword }),
  },

  // API DB
  db: {
    query: (sql, params) => ipcRenderer.invoke("db-query", { sql, params }),
    getAll: (table, options) =>
      ipcRenderer.invoke("db-get-all", { table, options }),
    getById: (table, id) => ipcRenderer.invoke("db-get-by-id", { table, id }),
    insert: (table, data) => ipcRenderer.invoke("db-insert", { table, data }),
    update: (table, data, whereClause, whereParams) =>
      ipcRenderer.invoke("db-update", {
        table,
        data,
        whereClause,
        whereParams,
      }),
    delete: (table, whereClause, whereParams) =>
      ipcRenderer.invoke("db-delete", { table, whereClause, whereParams }),
  },

  // API avancée
  dbAdvanced: {
    transaction: (operations) =>
      ipcRenderer.invoke("db-transaction", { operations }),
  },

  // Fenêtre
  minimize: () => ipcRenderer.invoke("minimize"),
  maximize: () => ipcRenderer.invoke("maximize"),
  close: (args) => ipcRenderer.invoke("close", args),

  // Navigation
  onNavigate: (callback) => ipcRenderer.on("navigate", callback),
  navigate: (route) => ipcRenderer.send("navigate", route),

  // Fichiers
  generateFilename: (originalName) => {
    const path = require("path");
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `${baseName.replaceAll(" ", "_")}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}${ext}`;
  },
  appGetPath: () => ipcRenderer.invoke("app-get-path"),
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  saveFile: (data) => ipcRenderer.invoke("save-file", data),

  confirm: (message) => ipcRenderer.invoke("openDialog", message),
});
