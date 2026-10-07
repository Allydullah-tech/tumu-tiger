<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = request_body();
$fullName = trim($b['full_name'] ?? '');
$email    = trim($b['email'] ?? '');
$phone    = trim($b['phone'] ?? '');
$password = $b['password'] ?? '';
$confirm  = $b['confirm_password'] ?? '';

$errors = [];
if ($fullName === '' || $email === '' || $phone === '') $errors[] = 'Tafadhali jaza taarifa zote muhimu.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Barua pepe si sahihi.';
if (strlen($password) < 6) $errors[] = 'Nenosiri linapaswa kuwa na angalau herufi/namba 6.';
if ($password !== $confirm) $errors[] = 'Nenosiri na uthibitisho wake havifanani.';

if ($errors) json_error(implode(' ', $errors), 422, ['errors' => $errors]);

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_error('Barua pepe hii tayari imesajiliwa. Jaribu kuingia (login).', 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$ins = $pdo->prepare("INSERT INTO users (role, full_name, email, phone, password) VALUES ('customer', ?, ?, ?, ?)");
$ins->execute([$fullName, $email, $phone, $hash]);
$userId = $pdo->lastInsertId();

$user = ['id' => $userId, 'full_name' => $fullName, 'email' => $email, 'phone' => $phone, 'role' => 'customer'];
login_user($user);

json_out(['success' => true, 'user' => current_user()]);
