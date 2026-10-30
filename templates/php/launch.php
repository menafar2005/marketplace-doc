<?php
// launch.php: مسیر اجرا. دیدار هر بار که کاربر اکستنشن را باز می‌کند این آدرس را با ?launchCode= صدا می‌زند.
require_once __DIR__ . '/didar.php';

// ۱. launchCode ← Runtime Token + Runtime Context (فقط backend)
$run = exchange_launch_code($_GET['launchCode'] ?? null);
if (!$run) {
    text_response(401, 'این اجرا معتبر نیست؛ اکستنشن را دوباره از دیدار باز کن.');
}
$token = $run['accessToken'];
$context = $run['context'];

// ۲. فقط به context اعتماد کن: کاربر کجاست و روی کدام رکوردها کار می‌کند
if (($context['entityType'] ?? null) !== 'deal' || empty($context['entityIds'])) {
    text_response(400, 'این اکستنشن فقط روی معامله کار می‌کند.');
}

// ۳. داده‌ی دیدار با همان token، فقط برای رکوردهای همین اجرا
try {
    $deal = didar_api($token, 'GET', '/api/v1/deals/' . rawurlencode($context['entityIds'][0]));
} catch (DidarError $err) {
    error_log(sprintf('didar api failed: %d %s trace=%s', $err->status, $err->errorCode ?? '-', $err->traceId ?? '-'));
    text_response($err->status === 403 ? 403 : 502, 'دسترسی به این معامله ممکن نشد.');
}
text_response(200, 'معامله: ' . $deal['Title']);
