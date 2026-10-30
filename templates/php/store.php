<?php
// store.php: جای ذخیره‌ی نصب‌ها و تنظیمات. این نسخه فقط برای توسعه است و در یک فایل JSON نگه می‌دارد؛
// در محیط واقعی دیتابیس خودت را جایگزین کن و ApiKey را با یک کلید واقعی رمزگذاری کن.

const STORE_FILE = __DIR__ . '/store.json';

function store_read(): array
{
    $data = is_file(STORE_FILE) ? json_decode((string) file_get_contents(STORE_FILE), true) : null;
    return is_array($data) ? $data : ['installations' => [], 'settings' => []];
}

function store_write(array $data): void
{
    file_put_contents(STORE_FILE, json_encode($data, JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function save_installation(array $inst): void
{
    $data = store_read();
    $data['installations'][$inst['bizDomainId']] = $inst;
    store_write($data);
}

function load_settings(string $bizDomainId): array
{
    return store_read()['settings'][$bizDomainId] ?? [];
}

function save_settings(string $bizDomainId, array $value): void
{
    $data = store_read();
    $data['settings'][$bizDomainId] = $value;
    store_write($data);
}

function encrypt_secret(string $secret): string
{
    // جایگزین کن: مثلاً sodium_crypto_secretbox با کلیدی که در secret manager است
    return 'encrypted:' . base64_encode($secret);
}
