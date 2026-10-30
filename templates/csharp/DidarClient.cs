// DidarClient.cs: کلاینت کوچک مارکت‌پلیس دیدار که بقیه‌ی تمپلیت‌ها از آن استفاده می‌کنند (.NET 8).
// تنظیمات: DIDAR_CLIENT_ID و DIDAR_CLIENT_SECRET (متغیر محیطی یا secret store؛ فقط روی سرور).
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

public record RuntimeRun(string AccessToken, int ExpiresInSeconds, JsonNode Context);

public class DidarException(int status, string? code, string? traceId) : Exception($"Didar API {status} {code}")
{
    public int Status => status;       // HTTP status
    public string? Code => code;       // error.code، مثل PROXY_ACCESS_DENIED
    public string? TraceId => traceId; // برای پشتیبانی log کن
}

public class DidarClient(HttpClient http, IConfiguration config, ILogger<DidarClient> log)
{
    public const string DidarOrigin = "https://app.didar.me";
    const string Marketplace = "https://marketplace.didar.me";

    // مهم: تنظیمات پیش‌فرض System.Net.Http.Json نام‌ها را camelCase می‌کند.
    // این options نام فیلدها را دقیقاً همان‌طور که نوشته شده می‌فرستد (Code، Activity، launchCode و...).
    static readonly JsonSerializerOptions Exact = new();

    // launchCode → Runtime Token و Runtime Context؛ در خطا null
    public async Task<RuntimeRun?> ExchangeLaunchCodeAsync(string? launchCode)
    {
        if (string.IsNullOrEmpty(launchCode)) return null;
        var (status, body) = await SendAsync(HttpMethod.Post, $"{Marketplace}/api/v1/runtime/token", null,
            new { launchCode, clientId = config["DIDAR_CLIENT_ID"], clientSecret = config["DIDAR_CLIENT_SECRET"] });
        if (status is < 200 or >= 300 || body?["succeeded"]?.GetValue<bool>() != true)
        {
            log.LogError("launch exchange failed: {Status} {Code} trace={Trace}",
                status, (string?)body?["error"]?["code"], (string?)body?["meta"]?["traceId"]);
            return null;
        }
        var data = body!["data"]!;
        return new RuntimeRun((string)data["accessToken"]!, (int)data["expiresInSeconds"]!, data["context"]!);
    }

    // درخواست به API داده‌ی دیدار با Runtime Token؛ data.Response را برمی‌گرداند
    public async Task<JsonNode?> ApiAsync(string accessToken, HttpMethod method, string path, object? payload = null)
    {
        var (status, body) = await SendAsync(method, Marketplace + path, accessToken, payload);
        if (status is < 200 or >= 300 || body?["succeeded"]?.GetValue<bool>() != true)
            throw new DidarException(status, (string?)body?["error"]?["code"], (string?)body?["meta"]?["traceId"]);
        return body!["data"]?["Response"];
    }

    public async Task<(int Status, JsonNode? Body)> SendAsync(HttpMethod method, string url, string? bearer, object? payload)
    {
        using var req = new HttpRequestMessage(method, url);
        if (bearer is not null) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        if (payload is not null)
            req.Content = new StringContent(JsonSerializer.Serialize(payload, Exact), Encoding.UTF8, "application/json");
        else
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var res = await http.SendAsync(req);
        var text = await res.Content.ReadAsStringAsync();
        JsonNode? body = null;
        try { body = JsonNode.Parse(text); } catch (JsonException) { }
        return ((int)res.StatusCode, body);
    }
}

public static class Web
{
    public static IResult Text(int status, string message) =>
        Results.Content(message, "text/plain; charset=utf-8", statusCode: status);

    public static IResult Html(string html) => Results.Content(html, "text/html; charset=utf-8");

    public static string E(string? s) => System.Net.WebUtility.HtmlEncode(s ?? "");
}
