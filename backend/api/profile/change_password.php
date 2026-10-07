<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
$user = require_role();

$b = request_body();
$current = $b['current_password'] ?? '';
$new     = $b['new_password'] ?? '';
$confirm = $b['confirm_password'] ?? '';

$stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$row = $stmt->fetch();

if (!password_verify($current, $row['password'])) json_error('Nenosiri la sasa si sahihi.', 401);
if (strlen($new) < 6) json_error('Nenosiri jipya linapaswa kuwa na angalau herufi/namba 6.', 422);
if ($new !== $confirm) json_error('Nenosiri jipya na uthibitisho wake havifanani.', 422);

$hash = password_hash($new, PASSWORD_DEFAULT);
$pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$hash, $user['id']]);

json_out(['success' => true]);
