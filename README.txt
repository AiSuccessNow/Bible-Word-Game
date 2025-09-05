Final Support Pack for "Fun Bible Word Game" (v2025.09.05.1517)
=========================================================

Files:
- manifest.webmanifest
- sw.js
- offline.html
- icons/icon-192.png, icons/icon-512.png, icons/apple-touch-icon-180.png
- favicon.png, favicon.ico

Steps:
1) Place these at your site root (same folder as index.html).
2) In <head>, keep <link rel="manifest" href="manifest.webmanifest">.
3) Register the service worker before </body> if not already present:
   <script>
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
     }
   </script>
4) If you add assets (images/sounds/fonts), list them in PRECACHE_ASSETS and redeploy.