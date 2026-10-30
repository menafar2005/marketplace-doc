<?php
// callback.php: مسیر نصب. آدرسی که به این فایل می‌رسد را در Developer Hub در فیلد Callback URL ثبت کن:
// https://your-app.example.com/didar/callback
require_once __DIR__ . '/didar.php';
require_once __DIR__ . '/store.php';

const COMPLETE_INSTALLATION = 'https://app.didar.me/api/MarketplaceInstall/CompleteInstallation';

$code = $_GET['code'] ?? null;
if (!$code) {
    text_response(400, 'کد نصب در درخواست نیست.');
}

// اگر پیش از نصب state ساخته‌ای، همین‌جا با مقدار session مقایسه کن (صفحه‌ی «پارامتر state»).
session_start();
$expected = $_SESSION['install_state'] ?? null;
unset($_SESSION['install_state']); // یک‌بارمصرف
if ($expected && !hash_equals($expected, (string) ($_GET['state'] ?? ''))) {
    text_response(400, 'درخواست نصب معتبر نیست.');
}

// code + credentialهای پلاگین ← CompleteInstallation (نام فیلدها PascalCase)
[$status, $body] = didar_http('POST', COMPLETE_INSTALLATION, [], [
    'Code' => $code,
    'ClientId' => getenv('DIDAR_CLIENT_ID'),
    'ClientSecret' => getenv('DIDAR_CLIENT_SECRET'),
]);
$result = $body['Response'] ?? [];
if ($status < 200 || $status >= 300 || empty($result['Succeeded'])) {
    error_log(sprintf('install failed: %d %s trace=%s', $status, json_encode($result['Error'] ?? null), $result['Meta']['TraceId'] ?? '-'));
    text_response(502, 'نصب کامل نشد. دوباره از لینک نصب امتحان کن.');
}

$d = $result['Data'];
save_installation([
    'bizDomainId' => $d['BizDomainId'], // کلید اصلی هر نصب
    'installationId' => $d['InstallationId'],
    'appPublicId' => $d['AppPublicId'],
    'scopes' => $d['Scopes'],
    'apiKey' => encrypt_secret($d['ApiKey']), // فقط رمزگذاری‌شده
    'installedAt' => $d['InstalledAt'],
]);

// اینجا ادمین را به قدم بعدی در سیستم خودت ببر (ساخت حساب، ورود یا تنظیمات).
text_response(200, 'نصب کامل شد. می‌توانی به دیدار برگردی.');
