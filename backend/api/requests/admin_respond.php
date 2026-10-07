<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_role('admin');

$b = request_body();
$id = (int)($b['request_id'] ?? 0);
$status = $b['status'] ?? '';
$reply = trim($b['admin_reply'] ?? '');
$priceRaw = array_key_exists('price', $b) ? $b['price'] : null;
$paymentStatus = array_key_exists('payment_status', $b) ? $b['payment_status'] : null;

$validStatuses = ['pending','in_review','available','not_available','replied'];
if (!in_array($status, $validStatuses, true)) json_error('Hali si sahihi.', 422);

$validPaymentStatuses = ['not_required','pending_payment','payment_submitted','paid'];
if ($paymentStatus !== null && $paymentStatus !== '' && !in_array($paymentStatus, $validPaymentStatuses, true)) {
    json_error('Hali ya malipo si sahihi.', 422);
}

$stmt = $pdo->prepare("SELECT * FROM requests WHERE id = ?");
$stmt->execute([$id]);
$existing = $stmt->fetch();
if (!$existing) json_error('Ombi halikupatikana.', 404);

$price = $existing['price'];
$newPaymentStatus = $existing['payment_status'];

// Admin sets/updates a delivery price -> customer now owes payment (unless admin
// is simultaneously setting an explicit payment_status themselves, e.g. marking paid).
if ($priceRaw !== null && trim((string)$priceRaw) !== '') {
    if (!is_numeric($priceRaw) || (float)$priceRaw <= 0) json_error('Bei si sahihi.', 422);
    $price = (float)$priceRaw;
    if ($paymentStatus === null || $paymentStatus === '') {
        $newPaymentStatus = 'pending_payment';
    }
}

// Admin can directly set payment status (e.g. confirming a payment as "paid").
if ($paymentStatus !== null && $paymentStatus !== '') {
    $newPaymentStatus = $paymentStatus;
}

$upd = $pdo->prepare("UPDATE requests SET status = ?, admin_reply = ?, price = ?, payment_status = ? WHERE id = ?");
$upd->execute([$status, $reply, $price, $newPaymentStatus, $id]);

$stmt = $pdo->prepare("SELECT r.*, u.email as user_email FROM requests r JOIN users u ON u.id = r.user_id WHERE r.id = ?");
$stmt->execute([$id]);
$r = $stmt->fetch();
$out = public_request($r);
$out['user_email'] = $r['user_email'];

json_out(['success' => true, 'request' => $out]);
