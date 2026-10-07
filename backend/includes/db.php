<?php
/**
 * TUMU TIGER (Backend) — Muunganisho wa Database
 */

if (!file_exists(__DIR__ . '/../config/config.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error'   => 'Mfumo bado haujasakinishwa. Tembelea /backend/install.php kwanza.',
        'code'    => 'NOT_INSTALLED',
    ]);
    exit;
}

require_once __DIR__ . '/../config/config.php';

// DB_PORT falls back to 3306 automatically if an older config.php doesn't define it.
$dbPort = defined('DB_PORT') ? DB_PORT : 3306;

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . $dbPort . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Imeshindwa kuunganisha na hifadhidata.']);
    exit;
}
