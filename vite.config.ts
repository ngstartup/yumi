import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// `--mode single` produces one self-contained index.html (demo / artifact build).
// Default mode produces a normal PWA-capable static bundle.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  define: {
    __SINGLE_FILE__: JSON.stringify(mode === 'single'),
    // Version affichée dans les réglages et comparée au manifeste de mise à jour.
    __APP_VERSION__: JSON.stringify(pkg.version),
    // Vide en local : les mises à jour à distance restent inactives. Le pipeline
    // de publication renseigne VITE_UPDATE_MANIFEST_URL avec l'adresse du dépôt.
    __UPDATE_MANIFEST_URL__: JSON.stringify(process.env.VITE_UPDATE_MANIFEST_URL ?? ''),
  },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    target: 'es2020',
    cssCodeSplit: mode !== 'single',
    // La démo mono-fichier n'a pas de second fichier où poser les polices :
    // elles y sont embarquées en base64. La build normale les sert à part.
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
    chunkSizeWarningLimit: 1200,
    // La démo mono-fichier ne peut pas charger de chunk séparé : on aplatit.
    rollupOptions: mode === 'single' ? { output: { inlineDynamicImports: true } } : {},
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
