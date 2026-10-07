<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

$user = require_role('admin');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT security_question FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    json_out(['success' => true, 'security_question' => $row['security_question']]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = request_body();
$secQ = $b['security_question'] ?? '';
$secQCustom = trim($b['security_question_custom'] ?? '');
$secA = trim($b['security_answer'] ?? '');
if ($secQ === 'custom' && $secQCustom !== '') $secQ = $secQCustom;

if ($secQ === '' || $secA === '') json_error('Tafadhali chagua swali na jaza jibu.', 422);

$ansHash = password_hash(strtolower($secA), PASSWORD_DEFAULT);
$pdo->prepare("UPDATE users SET security_question = ?, security_answer = ? WHERE id = ?")
    ->execute([$secQ, $ansHash, $user['id']]);

json_out(['success' => true, 'security_question' => $secQ]);
