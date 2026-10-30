// JsonModalRoutes.cs: endpoint اکستنشن JSON modal. این آدرس را در فیلد API endpoint ثبت کن.
// فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در context.payload.noteText می‌رسد.
using System.Text.Json.Nodes;

public static class JsonModalRoutes
{
    const string Endpoint = "/didar/note-form";
    const string NoteType = "00000000-0000-0000-0000-000000000000"; // یادداشت: GUID خالی

    // submit فرم با fetch مرورگر از داخل دیدار می‌آید، پس CORS فقط برای origin دقیق دیدار
    static void AllowDidar(HttpResponse res)
    {
        res.Headers["Access-Control-Allow-Origin"] = DidarClient.DidarOrigin;
        res.Headers["Vary"] = "Origin";
        res.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
        res.Headers["Access-Control-Allow-Headers"] = "Content-Type";
    }

    static IResult Reply(bool succeeded, string message, object? data = null) =>
        Results.Json(data is null ? (object)new { succeeded, message } : new { succeeded, message, data });

    public static void MapJsonModal(this WebApplication app)
    {
        app.MapMethods(Endpoint, ["OPTIONS"], (HttpResponse res) =>
        {
            AllowDidar(res);
            return Results.NoContent();
        });

        app.MapGet(Endpoint, async (string? launchCode, HttpResponse res, DidarClient didar, ILogger<DidarClient> log) =>
        {
            AllowDidar(res);
            var run = await didar.ExchangeLaunchCodeAsync(launchCode);
            if (run is null) return Reply(false, "این اجرا معتبر نیست؛ فرم را دوباره باز کن.");
            if ((string?)run.Context["entityType"] != "deal") return Reply(false, "این فرم فقط روی معامله کار می‌کند.");

            // payload ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن
            var noteText = run.Context["payload"]?["noteText"] is JsonValue v && v.TryGetValue<string>(out var s) ? s.Trim() : "";
            if (noteText.Length is 0 or > 2000) return Reply(false, "متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد.");

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
                return Reply(false, "ثبت یادداشت ناموفق بود.");
            }
            return Reply(true, $"یادداشت روی {ids.Count} معامله ثبت شد.", new { count = ids.Count });
        });
    }
}
