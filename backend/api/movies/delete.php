<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_role('admin');

$b = request_body();
$id = (int)($b['id'] ?? 0);

$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
$stmt->execute([$id]);
$movie = $stmt->fetch();
if (!$movie) json_error('Filamu haikupatikana.', 404);

$pdo->prepare("DELETE FROM movies WHERE id = ?")->execute([$id]);
delete_cover($movie['cover_image']);

json_out(['success' => true]);
