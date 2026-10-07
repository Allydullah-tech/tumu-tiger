<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$code = trim($_GET['code'] ?? '');
if ($code === '') json_error('Tafadhali weka msimbo wa ufuatiliaji.', 422);

$stmt = $pdo->prepare("SELECT * FROM requests WHERE tracking_code = ?");
$stmt->execute([$code]);
$r = $stmt->fetch();

if (!$r) json_error('Hatukupata ombi lenye msimbo huo.', 404);

json_out(['success' => true, 'request' => public_request($r)]);
