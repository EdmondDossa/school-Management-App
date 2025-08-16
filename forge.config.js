// forge.config.cjs
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path");

// Changez le répertoire de sortie vers un dossier externe (pas un sous-dossier)
const OUT_DIR = path.resolve(__dirname, "..", "electron_builds");
// Ou utilisez un chemin absolu vers un autre disque/répertoire
// const OUT_DIR = "D:\\electron-builds";

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  packagerConfig: {
    asar: true,
    icon: "./resources/images/icons/icon",
    tmpdir: false,
    overwrite: true,
    out: OUT_DIR,
  },

  rebuildConfig: {},

  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        // .ico requis ici
        setupIcon: "./resources/images/icons/icon.ico",
        // Optionnel :
        // noMsi: true,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"], // macOS
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: "./resources/images/icons/icon.png", // Linux
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: "./resources/images/icons/icon.png", // Linux
        },
      },
    },
  ],

  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: { owner: "EdmondDossa", name: "school-Management-App" },
        draft: true,
        prerelease: false,
      },
    },
  ],

  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        build: [
          {
            entry: "src/main.js",
            config: "vite.main.config.mjs",
            target: "main",
          },
          {
            entry: "src/preload.js",
            config: "vite.preload.config.mjs",
            target: "preload",
          },
        ],
        renderer: [{ name: "main_window", config: "vite.renderer.config.mjs" }],
      },
    },

    // Fuses
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
