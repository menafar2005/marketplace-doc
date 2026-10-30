<?php
// state.php: ساختن state پیش از فرستادن ادمین به نصب. بررسی آن در callback.php انجام می‌شود.

function create_install_state(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    $state = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '='); // تصادفی و غیرقابل‌حدس
    $_SESSION['install_state'] = $state; // تا callback در session کاربر می‌ماند
    return $state;
}
