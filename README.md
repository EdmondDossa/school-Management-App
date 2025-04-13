# 🖥️ Projet Electron Forge avec SQLite

Ce projet est une application **Electron** qui utilise une base de données **SQLite** pour la gestion des élèves d'un collège au Bénin. Il intègre **Vite.js** pour le bundling et **IPC** pour la communication entre le **Main Process** et le **Renderer Process**.

---

## 📦 Installation

1️⃣ **Cloner le projet**

```sh
git clone https://github.com/EdmondDossa/school-Management-App.git #depot github
cd school-Management-App # dossier après clone
npm install # installation des dépendances
npm run start # lancer le projet
npm run build # génére le build
npm start # lancer le projet après build
```

## 📂 Structure du projet

src/
├── services/ # Gestion des requêtes et de la logique métier
├── frontend/ # Interface utilisateur (React/Vue/Svelte/... si utilisé)
├── models/ # Modèles de données et ORM
├── utils/ # Utilitaires et helpers
│ ├── database.js # Gestion de la base de données SQLite
│ ├── main.js # Processus principal d'Electron
│ ├── preload.js # Sécurisation des API IPC
│ ├── renderer.js # Gestion du Renderer Process
├── db/
│ ├── school-management.db # Base de données SQLite
├── index.html # Page principale de l'application
├── forge.config.js # Configuration d'Electron Forge
├── vite.main.config.mjs # Config Vite pour le Main Process
├── vite.preload.config.mjs # Config Vite pour le Preload
├── vite.renderer.config.mjs # Config Vite pour le Renderer
├── tailwind.config.js # Configuration Tailwind CSS (si utilisé)
├── package.json # Dépendances et scripts
├── .gitignore # Fichiers à ignorer par Git
├── README.md # Documentation du projet

# 📋 Fonctionnalités principales

✅ Gestion des élèves, classes et inscriptions avec SQLite
✅ Communication sécurisée entre Electron et la base via IPC
✅ Architecture bien séparée avec Preload.js pour la sécurité
✅ Gestion efficace des transactions SQL

# 🛠 Technologies utilisées

Electron Forge ⚡ (Framework Electron)
SQLite3 🗄️ (Base de données légère et rapide)
Node.js 🚀 (Backend JS)
JavaScript 📜 (Langage principal)
Vite.js ⚡ (Optimisation du bundling)
TailwindCSS 🎨 (Stylisation UI, si utilisé)

# 📌 À venir

🚀 Interface utilisateur améliorée
🚀 Optimisation des performances SQL
🚀 Support multi-plateforme (Windows, Linux, Mac)
🚀 Intégration d’une API REST pour la synchronisation des données

# 📝 Licence

Ce projet est sous licence MIT.
✍️ Fait par Marie Edmond DOSSA HEGNON (ABOKA JR) 🚀

---

✅ **Lisible**  
✅ **Structuré**  
✅ **Facile à copier et utiliser**
