<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$q = trim($_GET['q'] ?? '');
$status = trim($_GET['status'] ?? '');
$limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : null;

$sql = "SELECT * FROM movies WHERE 1=1";
$params = [];
if ($q !== '') { $sql .= " AND (title LIKE ? OR genre LIKE ?)"; $params[] = "%$q%"; $params[] = "%$q%"; }
if ($status !== '') { $sql .= " AND status = ?"; $params[] = $status; }
$sql .= " ORDER BY created_at DESC";
if ($limit !== null) { $sql .= " LIMIT " . $limit; }

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$movies = array_map('public_movie', $stmt->fetchAll());

json_out(['success' => true, 'movies' => $movies]);
