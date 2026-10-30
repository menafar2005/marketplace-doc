<?php
// panel.php: صفحه‌ای که داخل iframe دیدار باز می‌شود (Custom panel یا Custom modal).
// آدرسی که به این فایل می‌رسد را در فیلد Iframe URL ثبت کن. صفحه یک دکمه دارد که روی همان معامله یادداشت ثبت می‌کند.
require_once __DIR__ . '/didar.php';

// session کوتاه همین اجرا، فقط سمت سرور. token هیچ‌وقت به مرورگر نمی‌رود.
// iframe روی origin دیگری است: کوکی session باید SameSite=None و Secure باشد.
session_name('didar_run');
session_set_cookie_params(['httponly' => true, 'secure' => true, 'samesite' => 'None']);
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $run = $_SESSION['run'] ?? null;
    if (!$run || $run['expiresAt'] < time()) {
        text_response(401, 'زمان این اجرا تمام شده؛ صفحه‌ی دیدار را دوباره باز کن.');
    }
    $text = trim((string) ($_POST['text'] ?? ''));
    if ($text === '' || mb_strlen($text) > 2000) {
        text_response(400, 'متن یادداشت معتبر نیست.');
    }
    didar_api($run['accessToken'], 'POST', '/api/v1/notes', ['Activity' => [
        'ActivityTypeId' => '00000000-0000-0000-0000-000000000000',
        'IsDone' => true,
        'DealId' => $run['context']['entityIds'][0],
        'ResultNote' => $text,
    ]]);
    text_response(200, 'یادداشت ثبت شد.');
}

$run = exchange_launch_code($_GET['launchCode'] ?? null);
if (!$run) {
    text_response(401, 'این اجرا منقضی شده؛ صفحه‌ی دیدار را دوباره باز کن.');
}
if (($run['context']['entityType'] ?? null) !== 'deal') {
    text_response(400, 'فقط برای معامله.');
}
session_regenerate_id(true);
$_SESSION['run'] = [
    'accessToken' => $run['accessToken'],
    'context' => $run['context'],
    'expiresAt' => time() + (int) $run['expiresInSeconds'],
];

$deal = didar_api($run['accessToken'], 'GET', '/api/v1/deals/' . rawurlencode($run['context']['entityIds'][0]));
header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">
<style>body{font-family:sans-serif;margin:12px;color-scheme:light dark}</style>
<p><strong><?= e($deal['Title']) ?></strong></p>
<form method="post"><textarea name="text" maxlength="2000" required></textarea>
<button>ثبت یادداشت</button></form></html>
