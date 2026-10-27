// JS سمت مرورگر (کپی کد، تب‌ها، جستجو، تم، TOC). بدون وابستگی.
export const clientJs = `
(function () {
  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () {}); }
  }

  // کپی کد
  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".copy");
    if (b) { var pre = b.closest(".code").querySelector("pre"); copy(pre.innerText, b); }
  });

  // کپی صفحه به Markdown
  var cm = $("#copy-md");
  if (cm) cm.addEventListener("click", function () {
    fetch(cm.getAttribute("data-src")).then(function (r) { return r.text(); }).then(function (t) {
      var old = cm.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { cm.textContent = "کپی شد"; setTimeout(function () { cm.textContent = old; }, 1500); });
    });
  });

  // تب‌های اتصال MCP
  $all(".tabs").forEach(function (tabs) {
    var btns = $all("[role=tab]", tabs);
    function pick(id) {
      btns.forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-tab") === id)); });
      $all("[role=tabpanel]", tabs).forEach(function (p) { p.hidden = p.id !== "panel-" + id; });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-tab")); }); });
  });

  // تم
  var themeBtn = $("#theme");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var root = doc.documentElement;
    var cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // سایدبار جمع‌شونده روی موبایل
  var det = $(".sidebar details");
  if (det && matchMedia("(max-width: 900px)").matches) det.open = false;

  // جستجو
  var q = $("#q"), box = $("#results"), timer, seq = 0;
  function render(items) {
    box.innerHTML = "";
    if (!items.length) { var d = doc.createElement("div"); d.className = "empty"; d.textContent = "نتیجه‌ای پیدا نشد."; box.appendChild(d); }
    items.forEach(function (it) {
      var a = doc.createElement("a"); a.href = it.url;
      var s = doc.createElement("strong"); s.textContent = it.page + (it.heading && it.heading !== it.page ? " › " + it.heading : "");
      var p = doc.createElement("span"); p.textContent = it.snippet;
      a.appendChild(s); a.appendChild(p); box.appendChild(a);
    });
    box.hidden = false;
  }
  if (q) {
    q.addEventListener("input", function () {
      clearTimeout(timer);
      var v = q.value.trim();
      if (v.length < 2) { box.hidden = true; return; }
      timer = setTimeout(function () {
        var my = ++seq;
        fetch("/search?q=" + encodeURIComponent(v) + "&limit=8").then(function (r) { return r.json(); }).then(function (j) { if (my === seq) render(j.results || []); }).catch(function () {});
      }, 180);
    });
    doc.addEventListener("click", function (e) { if (!e.target.closest(".search")) box.hidden = true; });
    doc.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); q.focus(); q.select(); }
      if (e.key === "Escape") { box.hidden = true; }
    });
  }

  // TOC فعال
  var links = $all(".toc a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove("on"); });
          map[en.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "0px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = doc.getElementById(id); if (h) io.observe(h); });
    links[0].classList.add("on");
  }
})();
`;
