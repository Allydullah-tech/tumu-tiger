<?php
/**
 * TUMU TIGER — Faili la Mfano la Mipangilio (Config template)
 *
 * This file is NOT used directly. backend/install.php generates the real
 * backend/config/config.php automatically once you complete setup.
 * Keep this template only as a reference / for manual installs.
 */
define('DB_HOST', 'localhost');
define('DB_PORT', '3307'); // e.g. 3306 is MySQL's default — set to whatever your server uses (3307 here)
define('DB_NAME', 'tumutiger');
define('DB_USER', 'root');
define('DB_PASS', '');
define('SITE_NAME', 'TUMU TIGER');

// Comma-separated list of frontend origins allowed to call this API with
// credentials (cookies) during local development, e.g. when the frontend
// is served from a different port than the backend.
// In production, deploy frontend + backend under the SAME domain and this
// is not needed.
define('ALLOWED_ORIGINS', 'http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000');
