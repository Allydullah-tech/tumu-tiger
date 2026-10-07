<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
require_role('admin');

$id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT r.*, u.email as user_email FROM requests r JOIN users u ON u.id = r.user_id WHERE r.id = ?");
$stmt->execute([$id]);
$r = $stmt->fetch();
if (!$r) json_error('Ombi halikupatikana.', 404);

$out = public_request($r);
$out['user_email'] = $r['user_email'];

json_out(['success' => true, 'request' => $out]);
