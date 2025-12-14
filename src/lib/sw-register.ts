// Service Worker registration utility
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported in this browser');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered successfully:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[SW] New version activated');
              // Optionally notify user about update
              window.dispatchEvent(
                new CustomEvent('sw-updated', {
                  detail: { registration },
                })
              );
            }
          });
        });
      })
      .catch((error) => {
        console.log('[SW] Registration failed:', error);
      });
  });
}
