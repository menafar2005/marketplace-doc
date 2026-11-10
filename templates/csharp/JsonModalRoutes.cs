// JsonModalRoutes.cs: endpoint اکستنشن JSON modal. این آدرس را در فیلد API endpoint ثبت کن.
// دیدار این endpoint را با POST و بدنه‌ی JSON صدا می‌زند: event برابر extension.load (باز شدن فرم، اگر loadOnOpen روشن باشد)
// یا extension.submit (ثبت فرم). فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در values.noteText می‌رسد.
using System.Text.Json.Nodes;

public static class JsonModalRoutes
{
    const string Endpoint = "/didar/note-form";
    const string NoteType = "00000000-0000-0000-0000-000000000000"; // یادداشت: GUID خالی

    // درخواست با fetch مرورگر از داخل دیدار می‌آید (POST با بدنه‌ی JSON)، پس CORS فقط برای origin دقیق دیدار
    static void AllowDidar(HttpResponse res)
    {
        res.Headers["Access-Control-Allow-Origin"] = DidarClient.DidarOrigin;
        res.Headers["Vary"] = "Origin";
        res.Headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
        res.Headers["Access-Control-Allow-Headers"] = "Content-Type";
    }

    static IResult Fail(string message, object? errors = null) =>
        Results.Json(errors is null ? (object)new { ok = false, message } : new { ok = false, message, errors });

    public static void MapJsonModal(this WebApplication app)
    {
        app.MapMethods(Endpoint, ["OPTIONS"], (HttpResponse res) =>
        {
            AllowDidar(res);
            return Results.NoContent();
        });

        app.MapPost(Endpoint, async (string? launchCode, JsonObject? body, HttpResponse res, DidarClient didar, ILogger<DidarClient> log) =>
        {
            AllowDidar(res);
            var ev = (string?)body?["event"];

            // باز شدن فرم: مقدارهای اولیه‌ی فیلدها را با همان keyها برگردان
            if (ev == "extension.load") return Results.Json(new { ok = true, data = new { values = new { noteText = "" } } });
            if (ev != "extension.submit") return Fail("درخواست ناشناخته است.");

            // values ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن؛ خطا کنار همان فیلد نمایش داده می‌شود
            var noteText = body?["values"]?["noteText"] is JsonValue v && v.TryGetValue<string>(out var s) ? s.Trim() : "";
            if (noteText.Length is 0 or > 2000)
                return Fail("بعضی از مقادیر معتبر نیستند.", new { noteText = "متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد." });

            // رکوردها را فقط از Runtime Context بخوان، نه از context بدنه که مرورگر فرستاده
            var run = await didar.ExchangeLaunchCodeAsync(launchCode);
            if (run is null) return Fail("این اجرا معتبر نیست؛ فرم را دوباره باز کن.");
            if ((string?)run.Context["entityType"] != "deal") return Fail("این فرم فقط روی معامله کار می‌کند.");

            // روی همه‌ی معامله‌های این اجرا (در لیست ممکن است چند معامله انتخاب شده باشد)
            var ids = run.Context["entityIds"]!.AsArray();
            try
            {
                foreach (var id in ids)
                    await didar.ApiAsync(run.AccessToken, HttpMethod.Post, "/api/v1/notes", new
                    {
                        Activity = new { ActivityTypeId = NoteType, IsDone = true, DealId = (string)id!, ResultNote = noteText },
                    });
            }
            catch (DidarException e)
            {
                log.LogError("note create failed: {Status} {Code} trace={Trace}", e.Status, e.Code, e.TraceId);
                return Fail("ثبت یادداشت ناموفق بود.");
            }
            return Results.Json(new { ok = true, message = $"یادداشت روی {ids.Count} معامله ثبت شد.", close = true });
        });
    }
}
