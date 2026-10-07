<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_role('admin'); // only an existing admin can create another admin

$b = request_body();
$fullName = trim($b['full_name'] ?? '');
$email    = trim($b['email'] ?? '');
$phone    = trim($b['phone'] ?? '');
$password = $b['password'] ?? '';
$confirm  = $b['confirm_password'] ?? '';
$secQ     = $b['security_question'] ?? '';
$secQCustom = trim($b['security_question_custom'] ?? '');
$secA     = trim($b['security_answer'] ?? '');
if ($secQ === 'custom' && $secQCustom !== '') $secQ = $secQCustom;

$errors = [];
if ($fullName === '' || $email === '' || $phone === '') $errors[] = 'Tafadhali jaza jina, barua pepe na namba ya simu.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Barua pepe si sahihi.';
if (strlen($password) < 6) $errors[] = 'Nenosiri linapaswa kuwa na angalau herufi/namba 6.';
if ($password !== $confirm) $errors[] = 'Nenosiri na uthibitisho wake havifanani.';
if ($secQ === '' || $secA === '') $errors[] = 'Tafadhali chagua swali la usalama na jibu lake.';

if ($errors) json_error(implode(' ', $errors), 422, ['errors' => $errors]);

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) json_error('Barua pepe hii tayari ipo kwenye mfumo.', 409);

$hash = password_hash($password, PASSWORD_DEFAULT);
$ansHash = password_hash(strtolower($secA), PASSWORD_DEFAULT);
$ins = $pdo->prepare("INSERT INTO users (role, full_name, email, phone, password, security_question, security_answer) VALUES ('admin', ?, ?, ?, ?, ?, ?)");
$ins->execute([$fullName, $email, $phone, $hash, $secQ, $ansHash]);

json_out(['success' => true]);
