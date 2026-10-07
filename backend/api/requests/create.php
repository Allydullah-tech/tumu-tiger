<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
$user = require_role('customer');

$b = request_body();
$type  = ($b['type'] ?? 'order') === 'inquiry' ? 'inquiry' : 'order';
$movieId = !empty($b['movie_id']) ? (int)$b['movie_id'] : null;
$movieTitle = trim($b['movie_title'] ?? '');
$name  = trim($b['customer_name'] ?? '');
$phone = trim($b['customer_phone'] ?? '');
$msg   = trim($b['message'] ?? '');

if ($movieTitle === '' || $name === '' || $phone === '') {
    json_error('Tafadhali jaza jina la filamu, jina lako na namba ya simu.', 422);
}

// If linked to a catalog movie, confirm it exists and use its title
if ($movieId) {
    $stmt = $pdo->prepare("SELECT title FROM movies WHERE id = ?");
    $stmt->execute([$movieId]);
    $m = $stmt->fetch();
    if (!$m) json_error('Filamu iliyochaguliwa haikupatikana.', 404);
    $movieTitle = $m['title'];
}

$code = generate_tracking_code();
$ins = $pdo->prepare("INSERT INTO requests (tracking_code, user_id, type, movie_id, movie_title, customer_name, customer_phone, message, status) VALUES (?,?,?,?,?,?,?,?,'pending')");
$ins->execute([$code, $user['id'], $type, $movieId, $movieTitle, $name, $phone, $msg]);
$id = $pdo->lastInsertId();

$stmt = $pdo->prepare("SELECT * FROM requests WHERE id = ?");
$stmt->execute([$id]);

json_out(['success' => true, 'request' => public_request($stmt->fetch())]);
