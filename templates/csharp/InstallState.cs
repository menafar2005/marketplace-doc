// InstallState.cs: ساختن state پیش از فرستادن ادمین به نصب. بررسی آن در InstallRoutes.cs انجام می‌شود.
// نیاز به session دارد (در Program.cs فعال است).
using System.Security.Cryptography;

public static class InstallState
{
    public static string Create(HttpContext http)
    {
        var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)); // تصادفی و غیرقابل‌حدس
        http.Session.SetString("install_state", state); // تا callback در session کاربر می‌ماند
        return state;
    }
}
