<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_role('admin');

$id = (int)($_POST['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
$stmt->execute([$id]);
$movie = $stmt->fetch();
if (!$movie) json_error('Filamu haikupatikana.', 404);

$title = trim($_POST['title'] ?? '');
$genre = trim($_POST['genre'] ?? '');
$year  = trim($_POST['release_year'] ?? '');
$desc  = trim($_POST['description'] ?? '');
$status = ($_POST['status'] ?? 'available') === 'not_available' ? 'not_available' : 'available';

if ($title === '') json_error('Tafadhali jaza jina la filamu.', 422);

$coverName = handle_cover_upload('cover_image');
if ($coverName === false) json_error('Kifuniko cha filamu si sahihi. Tumia JPG, PNG au WEBP isiyozidi 6MB.', 422);

if ($coverName) {
    delete_cover($movie['cover_image']);
    $upd = $pdo->prepare("UPDATE movies SET title=?, genre=?, release_year=?, description=?, status=?, cover_image=? WHERE id=?");
    $upd->execute([$title, $genre, $year, $desc, $status, $coverName, $id]);
} else {
    $upd = $pdo->prepare("UPDATE movies SET title=?, genre=?, release_year=?, description=?, status=? WHERE id=?");
    $upd->execute([$title, $genre, $year, $desc, $status, $id]);
}

$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
$stmt->execute([$id]);
json_out(['success' => true, 'movie' => public_movie($stmt->fetch())]);
