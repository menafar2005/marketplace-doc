// CustomUiRoutes.cs: صفحه‌ای که داخل iframe دیدار باز می‌شود (Custom panel یا Custom modal).
// این آدرس را در فیلد Iframe URL ثبت کن. صفحه یک دکمه دارد که روی همان معامله یادداشت ثبت می‌کند.
using System.Collections.Concurrent;
using System.Security.Cryptography;

public static class CustomUiRoutes
{
    // session کوتاه همین اجرا، فقط سمت سرور. token هیچ‌وقت به مرورگر نمی‌رود.
    static readonly ConcurrentDictionary<string, (RuntimeRun Run, DateTimeOffset ExpiresAt)> Runs = new();
    const string Cookie = "didar_run";

    public static void MapCustomUi(this WebApplication app)
    {
        app.MapGet("/didar/panel", async (string? launchCode, HttpResponse res, DidarClient didar) =>
        {
            var run = await didar.ExchangeLaunchCodeAsync(launchCode);
            if (run is null) return Web.Text(401, "این اجرا منقضی شده؛ صفحه‌ی دیدار را دوباره باز کن.");
            if ((string?)run.Context["entityType"] != "deal") return Web.Text(400, "فقط برای معامله.");

            var sessionId = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
            var ttl = TimeSpan.FromSeconds(run.ExpiresInSeconds);
            Runs[sessionId] = (run, DateTimeOffset.UtcNow + ttl);
            // iframe روی origin دیگری است: SameSite=None و Secure لازم است
            res.Cookies.Append(Cookie, sessionId, new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None, MaxAge = ttl });

            var dealId = (string)run.Context["entityIds"]![0]!;
            var deal = await didar.ApiAsync(run.AccessToken, HttpMethod.Get, $"/api/v1/deals/{dealId}");
            return Web.Html($$"""
                <!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">
                <style>body{font-family:sans-serif;margin:12px;color-scheme:light dark}</style>
                <p><strong>{{Web.E((string?)deal?["Title"])}}</strong></p>
                <form method="post" action="/didar/panel/note"><textarea name="text" maxlength="2000" required></textarea>
                <button>ثبت یادداشت</button></form></html>
                """);
        });

        app.MapPost("/didar/panel/note", async (HttpRequest req, DidarClient didar) =>
        {
            if (!Runs.TryGetValue(req.Cookies[Cookie] ?? "", out var s) || s.ExpiresAt < DateTimeOffset.UtcNow)
                return Web.Text(401, "زمان این اجرا تمام شده؛ صفحه‌ی دیدار را دوباره باز کن.");
            var form = await req.ReadFormAsync();
            var text = form["text"].ToString().Trim();
            if (text.Length is 0 or > 2000) return Web.Text(400, "متن یادداشت معتبر نیست.");

            await didar.ApiAsync(s.Run.AccessToken, HttpMethod.Post, "/api/v1/notes", new
            {
                Activity = new { ActivityTypeId = "00000000-0000-0000-0000-000000000000", IsDone = true, DealId = (string)s.Run.Context["entityIds"]![0]!, ResultNote = text },
            });
            return Web.Text(200, "یادداشت ثبت شد.");
        });
    }
}
