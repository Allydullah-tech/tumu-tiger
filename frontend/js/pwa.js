/**
 * TUMU TIGER — PWA install + service worker registration.
 * Include this on every page (after config.js). Safe no-op in browsers
 * without service worker / install-prompt support.
 */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register(TT.FRONTEND_BASE + '/sw.js', { scope: TT.FRONTEND_BASE + '/' })
        .catch(function (err) {
          console.warn('TUMU TIGER: service worker registration failed', err);
        });
    });
  }

  let deferredPrompt = null;

  function showInstallButton() {
    if (document.getElementById('pwaInstallBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.type = 'button';
    btn.innerHTML = '📲 Sakinisha App';
    btn.setAttribute('aria-label', 'Sakinisha TUMU TIGER kama App');
    Object.assign(btn.style, {
      position: 'fixed',
      right: '14px',
      bottom: '14px',
      zIndex: '200',
      padding: '10px 16px',
      borderRadius: '999px',
      border: 'none',
      fontWeight: '700',
      fontSize: '.8rem',
      color: '#FFFFFF',
      background: 'linear-gradient(135deg, #1F8A56, #0B5E38)',
      boxShadow: '0 6px 18px -6px rgba(31,138,86,.55)',
      cursor: 'pointer',
    });
    btn.addEventListener('click', async function () {
      btn.style.display = 'none';
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
    document.body.appendChild(btn);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.remove();
  });
})();
