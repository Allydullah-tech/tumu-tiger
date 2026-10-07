<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
if (empty($_SESSION['reset_user_id'])) json_error('Anza upya mchakato wa kurejesha nenosiri.', 400);

$b = request_body();
$answer = strtolower(trim($b['security_answer'] ?? ''));

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_SESSION['reset_user_id']]);
$u = $stmt->fetch();

if (!$u || !password_verify($answer, $u['security_answer'])) {
    json_error('Jibu si sahihi. Jaribu tena.', 401);
}

$_SESSION['reset_verified'] = true;
json_out(['success' => true]);
