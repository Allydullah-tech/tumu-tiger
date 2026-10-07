/**
 * TUMU TIGER — Frontend Config
 * Auto-detects where /frontend/ and /backend/ live relative to the current
 * page, so the same static files work whether deployed at the domain root
 * or inside a subfolder (e.g. https://example.com/tumutiger/frontend/...).
 */
const TT = (function () {
  const path = window.location.pathname;
  const idx = path.indexOf('/frontend/');
  const projectRoot = idx !== -1 ? path.substring(0, idx) : '';

  return {
    API_BASE: projectRoot + '/backend/api',
    FRONTEND_BASE: projectRoot + '/frontend',
  };
})();
