<?php
/**
 * TUMU TIGER (Backend) — CORS na Majibu ya JSON
 *
 * The frontend is a separate static app (HTML/CSS/JS) that talks to this
 * PHP API over fetch(). This file makes cross-origin requests with cookies
 * work during local development, and is harmless when frontend + backend
 * are deployed on the same domain in production.
 */

if (session_status() === PHP_SESSION_NONE) {
    // Cookie must be readable across /frontend and /backend paths.
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [];
if (defined('ALLOWED_ORIGINS')) {
    $allowed = array_map('trim', explode(',', ALLOWED_ORIGINS));
}
if ($origin !== '' && (in_array($origin, $allowed, true) || $allowed === [''])) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($message, $code = 400, $extra = []) {
    json_out(array_merge(['success' => false, 'error' => $message], $extra), $code);
}

/** Reads JSON body OR regular form-encoded / multipart POST, whichever is present. */
function request_body() {
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ct, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}
