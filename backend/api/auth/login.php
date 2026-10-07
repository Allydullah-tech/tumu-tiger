<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = request_body();
$email    = trim($b['email'] ?? '');
$password = $b['password'] ?? '';

if ($email === '' || $password === '') {
    json_error('Tafadhali jaza barua pepe na nenosiri.', 422);
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$u = $stmt->fetch();

if (!$u || !password_verify($password, $u['password'])) {
    json_error('Barua pepe au nenosiri si sahihi.', 401);
}

login_user($u);
json_out(['success' => true, 'user' => current_user()]);
