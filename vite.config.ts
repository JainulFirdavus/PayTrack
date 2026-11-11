import { readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function inlineMobileAssets(): Plugin {
  return {
    name: 'inline-mobile-assets',
    async writeBundle(options) {
      if (!options.dir) {
        this.error('Could not determine the mobile build output directory.');
      }

      const outputDirectory = path.resolve(options.dir);
      const htmlPath = path.join(outputDirectory, 'index.html');
      const html = await readFile(htmlPath, 'utf8');
      const scriptTag = /<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/;
      const scriptMatch = html.match(scriptTag);

      if (!scriptMatch) {
        this.error('Could not find the mobile JavaScript reference in index.html.');
      }

      const scriptPath = path.join(
        outputDirectory,
        scriptMatch[1].replace(/^(?:\.\/|\/)+/, ''),
      );
      const script = (await readFile(scriptPath, 'utf8')).replace(
        /<\/script/gi,
        (match) => `<${String.fromCharCode(92)}${match.slice(1)}`,
      );
      let inlineHtml = html.replace(
        scriptTag,
        () => `<script type="module">${script}</script>`,
      );
      await unlink(scriptPath);

      const styleLink = /<link\b[^>]*href="([^"]+\.css)"[^>]*>/g;
      const styleMatches = [...inlineHtml.matchAll(styleLink)];

      for (const styleMatch of styleMatches) {
        const stylePath = path.join(
          outputDirectory,
          styleMatch[1].replace(/^(?:\.\/|\/)+/, ''),
        );
        const styles = await readFile(stylePath, 'utf8');
        inlineHtml = inlineHtml.replace(styleMatch[0], () => `<style>${styles}</style>`);
        await unlink(stylePath);
      }

      await writeFile(htmlPath, inlineHtml);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'mobile' ? [inlineMobileAssets()] : [])],
  server: { host: '0.0.0.0' },
  ...(mode === 'mobile' && {
    build: {
      rollupOptions: {
        output: {
          codeSplitting: false,
        },
      },
    },
  }),
}));
