const fs = require('node:fs/promises');
const path = require('node:path');
const { withDangerousMod } = require('@expo/config-plugins');

module.exports = function withBundledWebApp(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const webBundle = path.join(projectRoot, 'dist-mobile');
      const indexFile = path.join(webBundle, 'index.html');

      try {
        await fs.access(indexFile);
      } catch {
        throw new Error('Mobile web bundle is missing. Run "npm run build:mobile" before "npx expo prebuild".');
      }

      const assetsDirectory = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets');
      const destination = path.join(assetsDirectory, 'webapp');
      await fs.mkdir(assetsDirectory, { recursive: true });
      await fs.rm(destination, { recursive: true, force: true });
      await fs.cp(webBundle, destination, { recursive: true });

      return modConfig;
    },
  ]);
};
