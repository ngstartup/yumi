import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { isNative } from '@/native/platform';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Élément #root introuvable');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// PWA — enregistrement du service worker en production uniquement.
// Dans l'application empaquetée, les fichiers sont déjà sur l'appareil : le
// service worker n'apporterait rien et intercepterait inutilement chaque
// navigation de la WebView.
if ('serviceWorker' in navigator && import.meta.env.PROD && !__SINGLE_FILE__ && !isNative()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* l'app fonctionne sans SW ; seul le cache hors ligne est perdu */
    });
  });
}
