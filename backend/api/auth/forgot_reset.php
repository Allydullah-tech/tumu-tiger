<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
if (empty($_SESSION['reset_verified']) || empty($_SESSION['reset_user_id'])) {
    json_error('Tafadhali thibitisha jibu la usalama kwanza.', 400);
}

$b = request_body();
$password = $b['password'] ?? '';
$confirm  = $b['confirm_password'] ?? '';

if (strlen($password) < 6) json_error('Nenosiri linapaswa kuwa na angalau herufi/namba 6.', 422);
if ($password !== $confirm) json_error('Nenosiri na uthibitisho wake havifanani.', 422);

$hash = password_hash($password, PASSWORD_DEFAULT);
$upd = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
$upd->execute([$hash, $_SESSION['reset_user_id']]);

unset($_SESSION['reset_user_id'], $_SESSION['reset_verified']);
json_out(['success' => true]);
