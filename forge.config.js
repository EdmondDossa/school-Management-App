// forge.config.cjs
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const fs = require("node:fs");
const path = require("node:path");
/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  outDir: "../electons_build",
  packagerConfig: {
    out: "../electons_build/__pack",
    asar: false, // Important pour les modules natifs
    asarUnpack: ["**/*.node"],
    icon: "./resources/images/icons/school_manager",
    tmpdir: false,
    overwrite: true,
    extraResource: ["./migrations"],
  },

  rebuildConfig: {},

  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        authors: "ABOKAJR and Prosper",
        description: "App for managing schools",
        setupIcon: "./resources/images/icons/school_manager.ico",
        name: "SchoolManager",
        exe: "school-manager.exe",
        setupExe: "SchoolManagerSetup.exe",
        noMsi: true,
        setupMsi: false,
        remoteReleases: false,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: "./resources/images/icons/school_manager.png",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: "./resources/images/icons/school_manager.png",
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
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false, // Changé à false car asar: false
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
  hooks: {
    prePackage: async (
      forgeConfig,
      buildPath,
      electronVersion,
      platform,
      arch
    ) => {
      const outDir = path.resolve(__dirname, "../electons_build");
      try {
        fs.rmSync(outDir, { recursive: true, force: true });
      } catch {}
    },
  },
};
