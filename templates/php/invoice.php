<?php
// invoice.php: اکستنشن Links. آدرسی که به این فایل می‌رسد را در فیلد URL اکستنشن ثبت کن.
// دیدار صفحه را با ?launchCode= باز می‌کند؛ در صفحه‌های لیست، entityIds چند شناسه دارد.
require_once __DIR__ . '/didar.php';

$run = exchange_launch_code($_GET['launchCode'] ?? null);
if (!$run) {
    text_response(401, 'این لینک منقضی شده؛ دوباره از دیدار باز کن.');
}
$context = $run['context'];
if (($context['entityType'] ?? null) !== 'deal') {
    text_response(400, 'فقط برای معامله.');
}

// همه‌ی رکوردهای انتخاب‌شده، فقط از context
$deals = array_map(
    fn (string $id) => didar_api($run['accessToken'], 'GET', '/api/v1/deals/' . rawurlencode($id)),
    $context['entityIds']
);

// token را به مرورگر نفرست. اگر کاربر در این صفحه کار بیشتری می‌کند، session کوتاه خودت را بساز.
header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>پیش‌فاکتور</title>
<h1>پیش‌فاکتور برای <?= count($deals) ?> معامله</h1>
<ul><?php foreach ($deals as $d): ?><li><?= e($d['Title']) ?>: <?= e($d['Price'] ?? '') ?></li><?php endforeach ?></ul></html>
