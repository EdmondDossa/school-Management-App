// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // API simplifiée pour les opérations CRUD
    db: {
        query: (sql, params) => ipcRenderer.invoke('db-query', { sql, params }),  // ✅ Ajout de `query`
        getAll: (table, options) => ipcRenderer.invoke('db-get-all', { table, options }),
        getById: (table, id) => ipcRenderer.invoke('db-get-by-id', { table, id }),
        insert: (table, data) => ipcRenderer.invoke('db-insert', { table, data }),
        update: (table, data, whereClause, whereParams) => ipcRenderer.invoke('db-update', { table, data, whereClause, whereParams }),
        delete: (table, whereClause, whereParams) => ipcRenderer.invoke('db-delete', { table, whereClause, whereParams }),
    },

    // API avancée
    dbAdvanced: {
        transaction: (operations) => ipcRenderer.invoke('db-transaction', { operations }),
    },

    minimize: () => ipcRenderer.invoke('minimize'), // Minimize The Window

    maximize: () => ipcRenderer.invoke('maximize'), // Maximize The Window

    close: (args) => ipcRenderer.invoke('close', args), // Close The Window
    // Navigation
    onNavigate: (callback) => ipcRenderer.on('navigate', callback),
    navigate: (route) => ipcRenderer.send('navigate', route)
});
