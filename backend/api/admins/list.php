<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
require_role('admin');

$rows = $pdo->query("SELECT id, full_name, email, phone, created_at FROM users WHERE role = 'admin' ORDER BY created_at ASC")->fetchAll();

json_out(['success' => true, 'admins' => $rows]);
