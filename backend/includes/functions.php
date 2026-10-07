<?php
/**
 * TUMU TIGER (Backend) — Vitendaji vya Msaada
 */

function generate_tracking_code() {
    return 'TT-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
}

function public_movie(array $m) {
    return [
        'id'           => (int)$m['id'],
        'title'        => $m['title'],
        'genre'        => $m['genre'],
        'release_year' => $m['release_year'],
        'description'  => $m['description'],
        'cover_url'    => $m['cover_image'] ? cover_url($m['cover_image']) : null,
        'status'       => $m['status'],
        'created_at'   => $m['created_at'],
    ];
}

function cover_url($filename) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // backend/uploads/covers is served as a static folder alongside the API
    $scriptDir = str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME']))); // .../backend/api -> .../backend
    // Fallback: build path relative to the backend root regardless of which api/ subfolder we're in
    $backendPath = preg_replace('#/api(/.*)?$#', '', $_SERVER['SCRIPT_NAME']);
    return $scheme . $host . $backendPath . '/uploads/covers/' . rawurlencode($filename);
}

function public_request(array $r) {
    return [
        'id'             => (int)$r['id'],
        'tracking_code'  => $r['tracking_code'],
        'type'           => $r['type'],
        'movie_id'       => $r['movie_id'] ? (int)$r['movie_id'] : null,
        'movie_title'    => $r['movie_title'],
        'customer_name'  => $r['customer_name'],
        'customer_phone' => $r['customer_phone'],
        'message'        => $r['message'],
        'status'         => $r['status'],
        'admin_reply'    => $r['admin_reply'],
        'price'          => isset($r['price']) && $r['price'] !== null ? (float)$r['price'] : null,
        'payment_status' => $r['payment_status'] ?? 'not_required',
        'payment_name'   => $r['payment_name'] ?? null,
        'payment_phone'  => $r['payment_phone'] ?? null,
        'created_at'     => $r['created_at'],
        'updated_at'     => $r['updated_at'] ?? null,
    ];
}

/** Handle a cover-image upload from $_FILES, returns stored filename, null (no file) or false (invalid). */
function handle_cover_upload($fileField = 'cover_image') {
    if (empty($_FILES[$fileField]) || $_FILES[$fileField]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($_FILES[$fileField]['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    $allowed = ['jpg' => true, 'jpeg' => true, 'png' => true, 'webp' => true];
    $ext = strtolower(pathinfo($_FILES[$fileField]['name'], PATHINFO_EXTENSION));
    if (!isset($allowed[$ext])) return false;
    if ($_FILES[$fileField]['size'] > 6 * 1024 * 1024) return false;

    $destDir = __DIR__ . '/../uploads/covers/';
    if (!is_dir($destDir)) mkdir($destDir, 0755, true);

    $newName = uniqid('cover_', true) . '.' . $ext;
    if (!move_uploaded_file($_FILES[$fileField]['tmp_name'], $destDir . $newName)) return false;
    return $newName;
}

function delete_cover($filename) {
    if (!$filename) return;
    $path = __DIR__ . '/../uploads/covers/' . $filename;
    if (file_exists($path)) @unlink($path);
}
