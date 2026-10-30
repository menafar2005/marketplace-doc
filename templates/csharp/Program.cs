// Program.cs: همه‌ی مسیرها کنار هم (.NET 8، پروژه‌ی `dotnet new web`). اجرا: dotnet run
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<DidarClient>();
builder.Services.AddSingleton<Store>();
// session سایت خودت (برای state نصب)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(o =>
{
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.Cookie.IsEssential = true;
});

var app = builder.Build();
app.UseSession();

app.MapInstall();    // مسیر نصب ← Callback URL
app.MapLaunch();     // مسیر اجرا
app.MapLink();       // Links
app.MapJsonModal();  // JSON modal
app.MapCustomUi();   // Custom panel / Custom modal
app.MapSettings();   // App settings (Custom UI)

app.Run();
