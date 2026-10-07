<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$total = $pdo->query("SELECT COUNT(*) c FROM movies")->fetch()['c'];
$available = $pdo->query("SELECT COUNT(*) c FROM movies WHERE status='available'")->fetch()['c'];

json_out([
    'success' => true,
    'total_movies'     => (int)$total,
    'available_movies' => (int)$available,
]);
