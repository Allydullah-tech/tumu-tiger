<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
$user = require_role('customer');

$stmt = $pdo->prepare("SELECT COUNT(*) c FROM requests WHERE user_id = ?");
$stmt->execute([$user['id']]);
$total = $stmt->fetch()['c'];

$stmt = $pdo->prepare("SELECT COUNT(*) c FROM requests WHERE user_id = ? AND status = 'pending'");
$stmt->execute([$user['id']]);
$pending = $stmt->fetch()['c'];

$stmt = $pdo->prepare("SELECT COUNT(*) c FROM requests WHERE user_id = ? AND status = 'available'");
$stmt->execute([$user['id']]);
$available = $stmt->fetch()['c'];

$stmt = $pdo->prepare("SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
$stmt->execute([$user['id']]);
$recent = array_map('public_request', $stmt->fetchAll());

$latest = array_map('public_movie', $pdo->query("SELECT * FROM movies WHERE status='available' ORDER BY created_at DESC LIMIT 4")->fetchAll());

json_out([
    'success' => true,
    'stats' => ['total_requests' => (int)$total, 'pending_requests' => (int)$pending, 'available_requests' => (int)$available],
    'recent_requests' => $recent,
    'latest_movies' => $latest,
]);
