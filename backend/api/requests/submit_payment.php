<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = request_body();
$code = trim($b['tracking_code'] ?? '');
$payName = trim($b['payment_name'] ?? '');
$payPhone = trim($b['payment_phone'] ?? '');

if ($code === '' || $payName === '' || $payPhone === '') {
    json_error('Tafadhali jaza jina na namba uliyotumia kulipia.', 422);
}

$stmt = $pdo->prepare("SELECT * FROM requests WHERE tracking_code = ?");
$stmt->execute([$code]);
$r = $stmt->fetch();
if (!$r) json_error('Ombi halikupatikana.', 404);

if ($r['payment_status'] === 'not_required') {
    json_error('Ombi hili halihitaji malipo kwa sasa.', 400);
}
if ($r['payment_status'] === 'paid') {
    json_error('Malipo ya ombi hili tayari yamethibitishwa.', 400);
}

$upd = $pdo->prepare("UPDATE requests SET payment_name = ?, payment_phone = ?, payment_status = 'payment_submitted' WHERE id = ?");
$upd->execute([$payName, $payPhone, $r['id']]);

$stmt = $pdo->prepare("SELECT * FROM requests WHERE id = ?");
$stmt->execute([$r['id']]);

json_out(['success' => true, 'request' => public_request($stmt->fetch())]);
