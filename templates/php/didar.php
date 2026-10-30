<?php
// didar.php: کلاینت کوچک مارکت‌پلیس دیدار که بقیه‌ی تمپلیت‌ها از آن استفاده می‌کنند.
// متغیرهای محیطی: DIDAR_CLIENT_ID و DIDAR_CLIENT_SECRET (فقط روی سرور). نیاز به افزونه‌ی curl.

const DIDAR_ORIGIN = 'https://app.didar.me';
const DIDAR_MARKETPLACE = 'https://marketplace.didar.me';

final class DidarError extends RuntimeException
{
    public function __construct(public int $status, public ?string $errorCode, public ?string $traceId)
    {
        parent::__construct(trim("Didar API $status " . ($errorCode ?? '')));
    }
}

/** یک درخواست HTTP با بدنه‌ی JSON؛ [status, body] برمی‌گرداند. */
function didar_http(string $method, string $url, array $headers, ?array $payload = null): array
{
    $ch = curl_init($url);
    $opts = [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15];
    if ($payload !== null) {
        $headers[] = 'Content-Type: application/json';
        $opts[CURLOPT_POSTFIELDS] = json_encode($payload, JSON_UNESCAPED_UNICODE);
    } else {
        $headers[] = 'Accept: application/json';
    }
    $opts[CURLOPT_HTTPHEADER] = $headers;
    curl_setopt_array($ch, $opts);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    $body = is_string($raw) ? json_decode($raw, true) : null;
    return [$status, is_array($body) ? $body : []];
}

/** launchCode → ['accessToken', 'tokenType', 'expiresInSeconds', 'context']؛ در خطا null. */
function exchange_launch_code(?string $launchCode): ?array
{
    if (!$launchCode) {
        return null;
    }
    [$status, $body] = didar_http('POST', DIDAR_MARKETPLACE . '/api/v1/runtime/token', [], [
        'launchCode' => $launchCode,
        'clientId' => getenv('DIDAR_CLIENT_ID'),
        'clientSecret' => getenv('DIDAR_CLIENT_SECRET'),
    ]);
    if ($status < 200 || $status >= 300 || empty($body['succeeded'])) {
        error_log(sprintf('launch exchange failed: %d %s trace=%s', $status, $body['error']['code'] ?? '-', $body['meta']['traceId'] ?? '-'));
        return null;
    }
    return $body['data'];
}

/** درخواست به API داده‌ی دیدار با Runtime Token؛ data.Response را برمی‌گرداند. */
function didar_api(string $accessToken, string $method, string $path, ?array $payload = null): mixed
{
    [$status, $body] = didar_http($method, DIDAR_MARKETPLACE . $path, ["Authorization: Bearer $accessToken"], $payload);
    if ($status < 200 || $status >= 300 || empty($body['succeeded'])) {
        throw new DidarError($status, $body['error']['code'] ?? null, $body['meta']['traceId'] ?? null);
    }
    return $body['data']['Response'] ?? null;
}

function e(mixed $s): string
{
    return htmlspecialchars((string) ($s ?? ''), ENT_QUOTES, 'UTF-8');
}

function text_response(int $status, string $message): never
{
    http_response_code($status);
    header('Content-Type: text/plain; charset=utf-8');
    exit($message);
}
