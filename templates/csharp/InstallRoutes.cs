// InstallRoutes.cs: مسیر نصب. همین آدرس را در Developer Hub در فیلد Callback URL ثبت کن:
// https://your-app.example.com/didar/callback
public static class InstallRoutes
{
    const string CompleteInstallation = "https://app.didar.me/api/MarketplaceInstall/CompleteInstallation";

    public static void MapInstall(this WebApplication app) =>
        app.MapGet("/didar/callback", async (HttpContext http, DidarClient didar, Store store, IConfiguration config, ILogger<DidarClient> log) =>
        {
            var code = http.Request.Query["code"].ToString();
            if (string.IsNullOrEmpty(code)) return Web.Text(400, "کد نصب در درخواست نیست.");

            // اگر پیش از نصب state ساخته‌ای، همین‌جا با مقدار session مقایسه کن (صفحه‌ی «پارامتر state»).
            var expected = http.Session.GetString("install_state");
            http.Session.Remove("install_state"); // یک‌بارمصرف
            if (expected is not null && http.Request.Query["state"].ToString() != expected)
                return Web.Text(400, "درخواست نصب معتبر نیست.");

            // code + credentialهای پلاگین ← CompleteInstallation (نام فیلدها PascalCase)
            var (status, body) = await didar.SendAsync(HttpMethod.Post, CompleteInstallation, null,
                new { Code = code, ClientId = config["DIDAR_CLIENT_ID"], ClientSecret = config["DIDAR_CLIENT_SECRET"] });
            var result = body?["Response"];
            if (status is < 200 or >= 300 || result?["Succeeded"]?.GetValue<bool>() != true)
            {
                log.LogError("install failed: {Status} {Error} trace={Trace}",
                    status, result?["Error"]?.ToJsonString(), (string?)result?["Meta"]?["TraceId"]);
                return Web.Text(502, "نصب کامل نشد. دوباره از لینک نصب امتحان کن.");
            }

            var d = result!["Data"]!;
            store.SaveInstallation(new Installation(
                BizDomainId: (string)d["BizDomainId"]!,           // کلید اصلی هر نصب
                InstallationId: (long)d["InstallationId"]!,
                AppPublicId: (string)d["AppPublicId"]!,
                Scopes: d["Scopes"]!.AsArray().Select(s => (string)s!).ToArray(),
                ApiKeyEncrypted: Store.Encrypt((string)d["ApiKey"]!), // فقط رمزگذاری‌شده
                InstalledAt: (string)d["InstalledAt"]!));

            // اینجا ادمین را به قدم بعدی در سیستم خودت ببر (ساخت حساب، ورود یا تنظیمات).
            return Web.Text(200, "نصب کامل شد. می‌توانی به دیدار برگردی.");
        });
}
