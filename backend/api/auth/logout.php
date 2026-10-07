<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';

logout_user();
json_out(['success' => true]);
