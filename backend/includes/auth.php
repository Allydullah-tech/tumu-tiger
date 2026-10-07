<?php
/**
 * TUMU TIGER (Backend) — Usimamizi wa Kuingia (Session auth helpers)
 * Requires cors.php (session already started) to be included first.
 */

function current_user() {
    return $_SESSION['user'] ?? null;
}

function login_user(array $row) {
    $_SESSION['user'] = [
        'id'        => (int)$row['id'],
        'full_name' => $row['full_name'],
        'email'     => $row['email'],
        'phone'     => $row['phone'],
        'role'      => $row['role'],
    ];
}

function logout_user() {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/** Ends the request with a 401/403 JSON error if not authorized. */
function require_role($role = null) {
    $u = current_user();
    if (!$u) {
        json_error('Tafadhali ingia kwanza (unauthenticated).', 401, ['code' => 'AUTH_REQUIRED']);
    }
    if ($role !== null && $u['role'] !== $role) {
        json_error('Huna ruhusa ya kufanya hili.', 403, ['code' => 'FORBIDDEN']);
    }
    return $u;
}
