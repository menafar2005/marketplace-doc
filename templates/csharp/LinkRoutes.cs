// LinkRoutes.cs: اکستنشن Links. این آدرس را در فیلد URL اکستنشن ثبت کن.
// دیدار صفحه را با ?launchCode= باز می‌کند؛ در صفحه‌های لیست، entityIds چند شناسه دارد.
using System.Text;

public static class LinkRoutes
{
    public static void MapLink(this WebApplication app) =>
        app.MapGet("/didar/invoice", async (string? launchCode, DidarClient didar) =>
        {
            var run = await didar.ExchangeLaunchCodeAsync(launchCode);
            if (run is null) return Web.Text(401, "این لینک منقضی شده؛ دوباره از دیدار باز کن.");
            if ((string?)run.Context["entityType"] != "deal") return Web.Text(400, "فقط برای معامله.");

            // همه‌ی رکوردهای انتخاب‌شده، فقط از context
            var items = new StringBuilder();
            var ids = run.Context["entityIds"]!.AsArray();
            foreach (var id in ids)
            {
                var deal = await didar.ApiAsync(run.AccessToken, HttpMethod.Get, $"/api/v1/deals/{(string)id!}");
                items.Append($"<li>{Web.E((string?)deal?["Title"])}: {Web.E(deal?["Price"]?.ToString())}</li>");
            }

            // token را به مرورگر نفرست. اگر کاربر در این صفحه کار بیشتری می‌کند، session کوتاه خودت را بساز.
            return Web.Html($"""
                <!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>پیش‌فاکتور</title>
                <h1>پیش‌فاکتور برای {ids.Count} معامله</h1><ul>{items}</ul></html>
                """);
        });
}
