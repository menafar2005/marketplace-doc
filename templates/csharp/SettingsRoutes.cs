// SettingsRoutes.cs: صفحه‌ی تنظیمات پلاگین (App settings از نوع Custom UI). این آدرس را در Iframe URL ثبت کن.
// تنظیمات با شناسه‌ی BizDomain ذخیره می‌شوند که از API گرفته می‌شود، نه از query.
using System.Collections.Concurrent;
using System.Security.Cryptography;

public static class SettingsRoutes
{
    static readonly ConcurrentDictionary<string, (string BizDomainId, string Csrf, DateTimeOffset ExpiresAt)> Sessions = new();
    const string Cookie = "didar_settings";

    public static void MapSettings(this WebApplication app)
    {
        app.MapGet("/didar/settings", async (string? launchCode, HttpResponse res, DidarClient didar, Store store) =>
        {
            var run = await didar.ExchangeLaunchCodeAsync(launchCode);
            if (run is null || (string?)run.Context["target"] != "settings_page") return Web.Text(401, "دوباره از دیدار باز کن.");

            // tenant را از خود دیدار بپرس (scope اطلاعات پایه همیشه فعال است)
            var biz = await didar.ApiAsync(run.AccessToken, HttpMethod.Get, "/api/v1/proxy/biz-domain/info");
            var bizDomainId = (string)biz!["Id"]!;
            var sessionId = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
            var csrf = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
            Sessions[sessionId] = (bizDomainId, csrf, DateTimeOffset.UtcNow.AddMinutes(15));
            res.Cookies.Append(Cookie, sessionId, new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None, MaxAge = TimeSpan.FromMinutes(15) });

            var current = store.LoadSettings(bizDomainId);
            return Web.Html($"""
                <!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">
                <h1>تنظیمات برای {Web.E((string?)biz["Title"])}</h1>
                <form method="post" action="/didar/settings">
                <input type="hidden" name="csrf" value="{csrf}">
                <label>کلید API سرویس جلسه <input name="meetingApiKey" value="{Web.E(current.GetValueOrDefault("meetingApiKey"))}"></label>
                <button>ذخیره</button></form></html>
                """);
        });

        app.MapPost("/didar/settings", async (HttpRequest req, Store store) =>
        {
            var form = await req.ReadFormAsync();
            if (!Sessions.TryGetValue(req.Cookies[Cookie] ?? "", out var s) || s.ExpiresAt < DateTimeOffset.UtcNow || form["csrf"].ToString() != s.Csrf)
                return Web.Text(403, "دوباره از دیدار باز کن.");
            var key = form["meetingApiKey"].ToString();
            store.SaveSettings(s.BizDomainId, new() { ["meetingApiKey"] = key[..Math.Min(key.Length, 200)] });
            return Web.Text(200, "ذخیره شد.");
        });
    }
}
