<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$phone = trim($_GET['phone'] ?? '');
if ($phone === '') json_error('Tafadhali weka namba ya simu.', 422);

// Match on the last 9 digits so it doesn't matter whether the customer typed
// 0628828678, 628828678, or +255628828678 — all resolve to the same number.
$digits = preg_replace('/\D+/', '', $phone);
$last9 = substr($digits, -9);
if ($last9 === '' || strlen($last9) < 6) {
    json_error('Namba ya simu si sahihi.', 422);
}

$stmt = $pdo->prepare("SELECT * FROM requests
    WHERE REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '+', '') LIKE ?
    ORDER BY created_at DESC LIMIT 30");
$stmt->execute(['%' . $last9]);
$rows = $stmt->fetchAll();

if (!$rows) json_error('Hatukupata maombi yoyote yenye namba hiyo.', 404);

json_out(['success' => true, 'requests' => array_map('public_request', $rows)]);
