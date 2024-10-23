// serviceWorkerRegistration.js

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

function registerValidSW(swUrl, config) {
  // ...
}

function checkValidServiceWorker(swUrl, config) {
  // ...
}

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Vérification du service worker en localhost
        const checkWorker = checkValidServiceWorker.bind(null, swUrl, config);
        navigator.serviceWorker.ready.then(checkWorker);
      } else {
        // Enregistrement du service worker en production
        const registerWorker = registerValidSW.bind(null, swUrl, config);
        navigator.serviceWorker.register(swUrl).then(registerWorker);
      }
    });
  }
}

export function unregister() {
  // ...
}
