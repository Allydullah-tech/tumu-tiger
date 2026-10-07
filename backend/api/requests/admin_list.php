<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
require_role('admin');

$status = trim($_GET['status'] ?? '');
$type   = trim($_GET['type'] ?? '');

$sql = "SELECT r.*, u.email as user_email FROM requests r JOIN users u ON u.id = r.user_id WHERE 1=1";
$params = [];
if ($status !== '') { $sql .= " AND r.status = ?"; $params[] = $status; }
if ($type !== '')   { $sql .= " AND r.type = ?"; $params[] = $type; }
$sql .= " ORDER BY r.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$requests = array_map(function ($r) {
    $out = public_request($r);
    $out['user_email'] = $r['user_email'];
    return $out;
}, $rows);

json_out(['success' => true, 'requests' => $requests]);
