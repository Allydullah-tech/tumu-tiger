<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
$user = require_role();

$b = request_body();
$fullName = trim($b['full_name'] ?? '');
$phone    = trim($b['phone'] ?? '');

if ($fullName === '' || $phone === '') json_error('Jina na namba ya simu havipaswi kuwa tupu.', 422);

$upd = $pdo->prepare("UPDATE users SET full_name = ?, phone = ? WHERE id = ?");
$upd->execute([$fullName, $phone, $user['id']]);

$_SESSION['user']['full_name'] = $fullName;
$_SESSION['user']['phone'] = $phone;

json_out(['success' => true, 'user' => current_user()]);
