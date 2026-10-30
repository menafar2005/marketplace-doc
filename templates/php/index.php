<?php
// index.php: همه‌ی مسیرها کنار هم. اجرا (توسعه): php -S 0.0.0.0:3000 index.php
// در Nginx یا Apache همین نگاشت را با rewrite بساز، یا هر فایل را مستقیم روی مسیر خودش بگذار.
$routes = [
    '/didar/callback' => 'callback.php',   // مسیر نصب ← Callback URL
    '/didar/launch' => 'launch.php',       // مسیر اجرا
    '/didar/invoice' => 'invoice.php',     // Links
    '/didar/note-form' => 'note-form.php', // JSON modal
    '/didar/panel' => 'panel.php',         // Custom panel / Custom modal
    '/didar/settings' => 'settings.php',   // App settings (Custom UI)
];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (!isset($routes[$path])) {
    http_response_code(404);
    exit;
}
require __DIR__ . '/' . $routes[$path];
