<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = request_body();
$email = trim($b['email'] ?? '');

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$u = $stmt->fetch();

if (!$u || empty($u['security_question'])) {
    json_error('Hatukuweza kupata swali la usalama kwa barua pepe hiyo. Wasiliana na msimamizi mkuu.', 404);
}

$_SESSION['reset_user_id'] = $u['id'];
unset($_SESSION['reset_verified']);

json_out(['success' => true, 'security_question' => $u['security_question']]);
