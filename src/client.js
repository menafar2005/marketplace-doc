// JS سمت مرورگر: تب‌های کد (همگام‌شده در کل صفحه)، کپی، جستجو، تم، TOC فعال. بدون وابستگی.
export const clientJs = `
(function () {
  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- بلوک‌های کد: انتخاب تب برای همه‌ی بلوک‌هایی که همان زبان را دارند ----
  function select(label, root) {
    $all(".cb", root).forEach(function (cb) {
      var has = $all(".cb-tab", cb).some(function (t) { return t.getAttribute("data-label") === label; });
      if (!has) return;
      $all(".cb-tab", cb).forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-label") === label)); });
      $all(".cb-panel", cb).forEach(function (p) { p.hidden = p.getAttribute("data-label") !== label; });
    });
    $all(".hint").forEach(function (h) { h.classList.toggle("on", h.getAttribute("data-for") === label); });
  }
  var saved = store.get("codeTab");
  if (saved) select(saved);
  var firstHint = $(".hint");
  if (firstHint && !$(".hint.on")) { var sel = $(".cb-tab[aria-selected=true]"); if (sel) select(sel.getAttribute("data-label")); }

  doc.addEventListener("click", function (e) {
    var tab = e.target.closest && e.target.closest(".cb-tab");
    if (tab) {
      var label = tab.getAttribute("data-label");
      select(label);
      if ($all(".cb-tab", tab.closest(".cb")).length > 1) store.set("codeTab", label);
      return;
    }
    var epb = e.target.closest && e.target.closest(".ep-copy");
    if (epb && navigator.clipboard) {
      navigator.clipboard.writeText(epb.getAttribute("data-copy")).then(function () {
        epb.classList.add("copied");
        setTimeout(function () { epb.classList.remove("copied"); }, 1500);
      }, function () {});
      return;
    }
    var btn = e.target.closest && e.target.closest(".cb-copy");
    if (btn) {
      var pre = $(".cb-panel:not([hidden])", btn.closest(".cb"));
      if (navigator.clipboard && pre) {
        navigator.clipboard.writeText(pre.innerText).then(function () {
          btn.classList.add("copied");
          setTimeout(function () { btn.classList.remove("copied"); }, 1500);
        }, function () {});
      }
    }
  });

  // ---- کپی صفحه به Markdown ----
  var cm = $("#copy-md");
  if (cm) cm.addEventListener("click", function () {
    var span = $("span", cm), old = span.textContent;
    fetch(cm.getAttribute("data-src")).then(function (r) { return r.text(); }).then(function (t) {
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () {
        span.textContent = "کپی شد";
        setTimeout(function () { span.textContent = old; }, 1500);
      });
    });
  });

  // ---- تم ----
  var themeBtn = $("#theme");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var root = doc.documentElement;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("theme", next);
  });

  // ---- سایدبار جمع‌شونده روی موبایل + آیتم فعال در دید ----
  var det = $(".sidebar details");
  if (det && matchMedia("(max-width: 900px)").matches) det.open = false;
  var cur = $(".nav-list a[aria-current]");
  var sb = $(".sidebar");
  if (cur && sb && sb.scrollHeight > sb.clientHeight) {
    var top = cur.getBoundingClientRect().top - sb.getBoundingClientRect().top;
    if (top > sb.clientHeight - 80) sb.scrollTop = top - 120;
  }

  // ---- جستجو ----
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (det) det.open = true;
        q.focus(); q.select();
      }
      if (e.key === "Escape") { box.hidden = true; }
    });
  }

  // ---- TOC فعال ----
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
    }, { rootMargin: "-60px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = doc.getElementById(id); if (h) io.observe(h); });
    links[0].classList.add("on");
  }
})();
`;
