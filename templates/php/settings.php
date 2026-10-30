<?php
// settings.php: صفحه‌ی تنظیمات پلاگین (App settings از نوع Custom UI). آدرسی که به این فایل می‌رسد را در Iframe URL ثبت کن.
// تنظیمات با شناسه‌ی BizDomain ذخیره می‌شوند که از API گرفته می‌شود، نه از query.
require_once __DIR__ . '/didar.php';
require_once __DIR__ . '/store.php';

session_name('didar_settings');
session_set_cookie_params(['lifetime' => 900, 'httponly' => true, 'secure' => true, 'samesite' => 'None']);
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $s = $_SESSION['settings'] ?? null;
    if (!$s || $s['expiresAt'] < time() || !hash_equals($s['csrf'], (string) ($_POST['csrf'] ?? ''))) {
        text_response(403, 'دوباره از دیدار باز کن.');
    }
    save_settings($s['bizDomainId'], ['meetingApiKey' => mb_substr((string) ($_POST['meetingApiKey'] ?? ''), 0, 200)]);
    text_response(200, 'ذخیره شد.');
}

$run = exchange_launch_code($_GET['launchCode'] ?? null);
if (!$run || ($run['context']['target'] ?? null) !== 'settings_page') {
    text_response(401, 'دوباره از دیدار باز کن.');
}

// tenant را از خود دیدار بپرس (scope اطلاعات پایه همیشه فعال است)
$biz = didar_api($run['accessToken'], 'GET', '/api/v1/proxy/biz-domain/info');
session_regenerate_id(true);
$csrf = bin2hex(random_bytes(24));
$_SESSION['settings'] = ['bizDomainId' => $biz['Id'], 'csrf' => $csrf, 'expiresAt' => time() + 900];

$current = load_settings($biz['Id']);
header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">
<h1>تنظیمات برای <?= e($biz['Title']) ?></h1>
<form method="post">
<input type="hidden" name="csrf" value="<?= e($csrf) ?>">
<label>کلید API سرویس جلسه <input name="meetingApiKey" value="<?= e($current['meetingApiKey'] ?? '') ?>"></label>
<button>ذخیره</button></form></html>
