// LaunchRoutes.cs: مسیر اجرا. دیدار هر بار که کاربر اکستنشن را باز می‌کند این آدرس را با ?launchCode= صدا می‌زند.
public static class LaunchRoutes
{
    public static void MapLaunch(this WebApplication app) =>
        app.MapGet("/didar/launch", async (string? launchCode, DidarClient didar, ILogger<DidarClient> log) =>
        {
            // ۱. launchCode ← Runtime Token + Runtime Context (فقط backend)
            var run = await didar.ExchangeLaunchCodeAsync(launchCode);
            if (run is null) return Web.Text(401, "این اجرا معتبر نیست؛ اکستنشن را دوباره از دیدار باز کن.");

            // ۲. فقط به context اعتماد کن: کاربر کجاست و روی کدام رکوردها کار می‌کند
            var ids = run.Context["entityIds"]!.AsArray();
            if ((string?)run.Context["entityType"] != "deal" || ids.Count == 0)
                return Web.Text(400, "این اکستنشن فقط روی معامله کار می‌کند.");

            // ۳. داده‌ی دیدار با همان token، فقط برای رکوردهای همین اجرا
            try
            {
                var deal = await didar.ApiAsync(run.AccessToken, HttpMethod.Get, $"/api/v1/deals/{(string)ids[0]!}");
                return Web.Text(200, $"معامله: {(string?)deal?["Title"]}");
            }
            catch (DidarException e)
            {
                log.LogError("didar api failed: {Status} {Code} trace={Trace}", e.Status, e.Code, e.TraceId);
                return Web.Text(e.Status == 403 ? 403 : 502, "دسترسی به این معامله ممکن نشد.");
            }
        });
}
