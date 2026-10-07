<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
require_role('admin');

$totalMovies    = $pdo->query("SELECT COUNT(*) c FROM movies")->fetch()['c'];
$totalRequests  = $pdo->query("SELECT COUNT(*) c FROM requests")->fetch()['c'];
$pendingCount   = $pdo->query("SELECT COUNT(*) c FROM requests WHERE status='pending'")->fetch()['c'];
$totalCustomers = $pdo->query("SELECT COUNT(*) c FROM users WHERE role='customer'")->fetch()['c'];
$paymentsToConfirm = $pdo->query("SELECT COUNT(*) c FROM requests WHERE payment_status='payment_submitted'")->fetch()['c'];

$rows = $pdo->query("SELECT r.*, u.email as user_email FROM requests r JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC LIMIT 6")->fetchAll();
$recent = array_map(function ($r) {
    $out = public_request($r);
    $out['user_email'] = $r['user_email'];
    return $out;
}, $rows);

json_out([
    'success' => true,
    'stats' => [
        'total_movies'        => (int)$totalMovies,
        'pending_requests'    => (int)$pendingCount,
        'total_requests'      => (int)$totalRequests,
        'total_customers'     => (int)$totalCustomers,
        'payments_to_confirm' => (int)$paymentsToConfirm,
    ],
    'recent_requests' => $recent,
]);
