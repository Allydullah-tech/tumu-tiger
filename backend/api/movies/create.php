<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
$admin = require_role('admin');

$title = trim($_POST['title'] ?? '');
$genre = trim($_POST['genre'] ?? '');
$year  = trim($_POST['release_year'] ?? '');
$desc  = trim($_POST['description'] ?? '');
$status = ($_POST['status'] ?? 'available') === 'not_available' ? 'not_available' : 'available';

if ($title === '') json_error('Tafadhali jaza jina la filamu.', 422);

$coverName = handle_cover_upload('cover_image');
if ($coverName === false) json_error('Kifuniko cha filamu si sahihi. Tumia JPG, PNG au WEBP isiyozidi 6MB.', 422);

$ins = $pdo->prepare("INSERT INTO movies (title, genre, release_year, description, cover_image, status, added_by) VALUES (?,?,?,?,?,?,?)");
$ins->execute([$title, $genre, $year, $desc, $coverName, $status, $admin['id']]);
$id = $pdo->lastInsertId();

$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
$stmt->execute([$id]);
$movie = $stmt->fetch();

json_out(['success' => true, 'movie' => public_movie($movie)]);
