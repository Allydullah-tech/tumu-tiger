<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';

$u = current_user();
json_out(['success' => true, 'user' => $u]);
