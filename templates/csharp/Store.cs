// Store.cs: جای ذخیره‌ی نصب‌ها و تنظیمات. این نسخه فقط برای توسعه است و در حافظه نگه می‌دارد؛
// در محیط واقعی دیتابیس خودت را جایگزین کن و ApiKey را با یک کلید واقعی رمزگذاری کن.
using System.Collections.Concurrent;
using System.Text;

public record Installation(string BizDomainId, long InstallationId, string AppPublicId, string[] Scopes, string ApiKeyEncrypted, string InstalledAt);

public class Store
{
    readonly ConcurrentDictionary<string, Installation> installations = new();
    readonly ConcurrentDictionary<string, Dictionary<string, string>> settings = new();

    public void SaveInstallation(Installation inst) => installations[inst.BizDomainId] = inst;
    public Installation? GetInstallation(string bizDomainId) => installations.GetValueOrDefault(bizDomainId);
    public Dictionary<string, string> LoadSettings(string bizDomainId) => settings.GetValueOrDefault(bizDomainId) ?? new();
    public void SaveSettings(string bizDomainId, Dictionary<string, string> value) => settings[bizDomainId] = value;

    // جایگزین کن: مثلاً AES-GCM یا ASP.NET Data Protection با کلیدی که در secret manager است
    public static string Encrypt(string secret) => "encrypted:" + Convert.ToBase64String(Encoding.UTF8.GetBytes(secret));
}
