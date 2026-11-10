<?php
// note-form.php: endpoint اکستنشن JSON modal. آدرسی که به این فایل می‌رسد را در فیلد API endpoint ثبت کن.
// دیدار این endpoint را با POST و بدنه‌ی JSON صدا می‌زند: event برابر extension.load (باز شدن فرم، اگر loadOnOpen روشن باشد)
// یا extension.submit (ثبت فرم). فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در values.noteText می‌رسد.
require_once __DIR__ . '/didar.php';

// درخواست با fetch مرورگر از داخل دیدار می‌آید (POST با بدنه‌ی JSON)، پس CORS فقط برای origin دقیق دیدار
header('Access-Control-Allow-Origin: ' . DIDAR_ORIGIN);
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function reply(array $body): never
{
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode($body, JSON_UNESCAPED_UNICODE));
}

$body = json_decode(file_get_contents('php://input') ?: 'null', true) ?? [];
$event = $body['event'] ?? null;

// باز شدن فرم: مقدارهای اولیه‌ی فیلدها را با همان keyها برگردان
if ($event === 'extension.load') {
    reply(['ok' => true, 'data' => ['values' => ['noteText' => '']]]);
}
if ($event !== 'extension.submit') {
    reply(['ok' => false, 'message' => 'درخواست ناشناخته است.']);
}

// values ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن؛ خطا کنار همان فیلد نمایش داده می‌شود
$noteText = $body['values']['noteText'] ?? null;
$noteText = is_string($noteText) ? trim($noteText) : '';
if ($noteText === '' || mb_strlen($noteText) > 2000) {
    reply(['ok' => false, 'message' => 'بعضی از مقادیر معتبر نیستند.',
        'errors' => ['noteText' => 'متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد.']]);
}

// رکوردها را فقط از Runtime Context بخوان، نه از context بدنه که مرورگر فرستاده
$run = exchange_launch_code($_GET['launchCode'] ?? null);
if (!$run) {
    reply(['ok' => false, 'message' => 'این اجرا معتبر نیست؛ فرم را دوباره باز کن.']);
}
$context = $run['context'];
if (($context['entityType'] ?? null) !== 'deal') {
    reply(['ok' => false, 'message' => 'این فرم فقط روی معامله کار می‌کند.']);
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
    reply(['ok' => false, 'message' => 'ثبت یادداشت ناموفق بود.']);
}
$count = count($context['entityIds']);
reply(['ok' => true, 'message' => "یادداشت روی $count معامله ثبت شد.", 'close' => true]);
