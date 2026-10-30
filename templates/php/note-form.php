<?php
// note-form.php: endpoint اکستنشن JSON modal. آدرسی که به این فایل می‌رسد را در فیلد API endpoint ثبت کن.
// فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در context.payload.noteText می‌رسد.
require_once __DIR__ . '/didar.php';

// submit فرم با fetch مرورگر از داخل دیدار می‌آید، پس CORS فقط برای origin دقیق دیدار
header('Access-Control-Allow-Origin: ' . DIDAR_ORIGIN);
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function reply(bool $succeeded, string $message, ?array $data = null): never
{
    header('Content-Type: application/json; charset=utf-8');
    $body = ['succeeded' => $succeeded, 'message' => $message];
    if ($data !== null) {
        $body['data'] = $data;
    }
    exit(json_encode($body, JSON_UNESCAPED_UNICODE));
}

$run = exchange_launch_code($_GET['launchCode'] ?? null);
if (!$run) {
    reply(false, 'این اجرا معتبر نیست؛ فرم را دوباره باز کن.');
}
$context = $run['context'];
if (($context['entityType'] ?? null) !== 'deal') {
    reply(false, 'این فرم فقط روی معامله کار می‌کند.');
}

// payload ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن
$noteText = $context['payload']['noteText'] ?? null;
$noteText = is_string($noteText) ? trim($noteText) : '';
if ($noteText === '' || mb_strlen($noteText) > 2000) {
    reply(false, 'متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد.');
}

// روی همه‌ی معامله‌های این اجرا (در لیست ممکن است چند معامله انتخاب شده باشد)
try {
    foreach ($context['entityIds'] as $dealId) {
        didar_api($run['accessToken'], 'POST', '/api/v1/notes', ['Activity' => [
            'ActivityTypeId' => '00000000-0000-0000-0000-000000000000', // یادداشت: GUID خالی
            'IsDone' => true,
            'DealId' => $dealId,
            'ResultNote' => $noteText,
        ]]);
    }
} catch (DidarError $err) {
    error_log(sprintf('note create failed: %d %s trace=%s', $err->status, $err->errorCode ?? '-', $err->traceId ?? '-'));
    reply(false, 'ثبت یادداشت ناموفق بود.');
}
$count = count($context['entityIds']);
reply(true, "یادداشت روی $count معامله ثبت شد.", ['count' => $count]);
