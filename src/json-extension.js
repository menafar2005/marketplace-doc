// اعتبارسنجی «ساختار اکستنشن جیسون دیدار نسخه‌ی ۱» برای ابزار MCP «validate_json_extension».
// قواعد همان فایل spec/json-extension/didar-json-extension.schema.json است، بدون وابستگی به کتابخانه‌ی JSON Schema.

const ROOT_KEYS = new Set(["schemaVersion", "layout", "title", "description", "loadOnOpen", "sections", "submit"]);
const SECTION_KEYS = new Set(["id", "title", "description", "items"]);
const SUBMIT_KEYS = new Set(["label", "closeOnSuccess", "successMessage"]);
const OPTION_KEYS = new Set(["label", "value"]);
const ITEM_KEYS = new Set([
  "type", "key", "label", "text", "url", "placeholder", "helpText", "required", "readOnly", "defaultValue",
  "min", "max", "minLength", "maxLength", "options", "variant",
]);
const INPUT_TYPES = ["text", "textarea", "number", "date", "select", "radio", "checkbox"];
const ITEM_TYPES = [...INPUT_TYPES, "value", "link", "message", "divider"];
const NEEDS_KEY = new Set([...INPUT_TYPES, "value"]);
const VARIANTS = ["info", "success", "warning", "error"];
const LANGS = ["fa", "en", "ar"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function validateJsonExtension(doc, origin = "") {
  const errors = [];
  const add = (path, message) => errors.push({ path, message });
  const docs = `${origin}/json-extension-schema`;

  const unknown = (obj, allowed, path) => {
    for (const k of Object.keys(obj)) if (!allowed.has(k)) add(`${path}.${k}`, `ویژگی «${k}» در این سطح تعریف نشده و مجاز نیست.`);
  };
  const text = (v, path, { nonEmpty = false } = {}) => {
    if (typeof v === "string") {
      if (nonEmpty && v.length === 0) add(path, "متن نباید خالی باشد.");
      return;
    }
    if (!isObj(v)) return add(path, "باید رشته یا شیء سه‌زبانه با کلیدهای fa، en یا ar باشد.");
    const keys = Object.keys(v);
    if (!keys.length) add(path, "شیء سه‌زبانه دست‌کم یکی از کلیدهای fa، en یا ar را لازم دارد.");
    for (const k of keys) {
      if (!LANGS.includes(k)) add(`${path}.${k}`, "شیء سه‌زبانه فقط کلیدهای fa، en و ar را می‌پذیرد.");
      else if (typeof v[k] !== "string") add(`${path}.${k}`, "مقدار هر زبان باید رشته باشد.");
    }
    if (nonEmpty && !LANGS.some((l) => typeof v[l] === "string" && v[l].length > 0)) add(path, "دست‌کم یک زبان باید مقدار غیرخالی داشته باشد.");
  };

  if (!isObj(doc)) {
    add("$", "ساختار باید یک شیء JSON باشد.");
    return { valid: false, errors, docs };
  }
  unknown(doc, ROOT_KEYS, "$");
  if (doc.schemaVersion !== 1) add("$.schemaVersion", "الزامی است و در نسخه‌ی فعلی باید دقیقاً 1 باشد.");
  if (!["form", "details"].includes(doc.layout)) add("$.layout", "الزامی است و باید form یا details باشد.");
  if (doc.title !== undefined) text(doc.title, "$.title", { nonEmpty: true });
  if (doc.description !== undefined) text(doc.description, "$.description");
  if (doc.loadOnOpen !== undefined && typeof doc.loadOnOpen !== "boolean") add("$.loadOnOpen", "باید boolean باشد.");

  if (doc.submit !== undefined) {
    if (!isObj(doc.submit)) add("$.submit", "باید شیء باشد.");
    else {
      unknown(doc.submit, SUBMIT_KEYS, "$.submit");
      if (doc.submit.label !== undefined) text(doc.submit.label, "$.submit.label", { nonEmpty: true });
      if (doc.submit.closeOnSuccess !== undefined && typeof doc.submit.closeOnSuccess !== "boolean") add("$.submit.closeOnSuccess", "باید boolean باشد.");
      if (doc.submit.successMessage !== undefined) text(doc.submit.successMessage, "$.submit.successMessage");
    }
  }

  const sectionIds = new Set();
  const keys = new Set();
  if (!Array.isArray(doc.sections)) add("$.sections", "الزامی است و باید آرایه باشد.");
  else {
    if (doc.sections.length < 1 || doc.sections.length > 20) add("$.sections", "باید بین ۱ تا ۲۰ بخش داشته باشد.");
    doc.sections.forEach((sec, i) => {
      const sp = `$.sections[${i}]`;
      if (!isObj(sec)) return add(sp, "هر بخش باید شیء باشد.");
      unknown(sec, SECTION_KEYS, sp);
      if (typeof sec.id !== "string" || !sec.id) add(`${sp}.id`, "الزامی است و باید رشته‌ی غیرخالی باشد.");
      else if (sectionIds.has(sec.id)) add(`${sp}.id`, `شناسه‌ی بخش «${sec.id}» تکراری است؛ باید یکتا باشد.`);
      else sectionIds.add(sec.id);
      if (sec.title !== undefined) text(sec.title, `${sp}.title`, { nonEmpty: true });
      if (sec.description !== undefined) text(sec.description, `${sp}.description`);
      if (!Array.isArray(sec.items)) return add(`${sp}.items`, "الزامی است و باید آرایه باشد.");
      if (sec.items.length < 1 || sec.items.length > 50) add(`${sp}.items`, "هر بخش باید بین ۱ تا ۵۰ آیتم داشته باشد.");
      sec.items.forEach((it, j) => {
        const ip = `${sp}.items[${j}]`;
        if (!isObj(it)) return add(ip, "هر آیتم باید شیء باشد.");
        unknown(it, ITEM_KEYS, ip);
        if (!ITEM_TYPES.includes(it.type)) return add(`${ip}.type`, `الزامی است و باید یکی از ${ITEM_TYPES.join("، ")} باشد.`);
        if (it.key !== undefined && (typeof it.key !== "string" || !it.key)) add(`${ip}.key`, "باید رشته‌ی غیرخالی باشد.");
        if (NEEDS_KEY.has(it.type) && it.key === undefined) add(`${ip}.key`, `برای نوع ${it.type} الزامی است.`);
        if (typeof it.key === "string" && it.key) {
          if (keys.has(it.key)) add(`${ip}.key`, `کلید «${it.key}» تکراری است؛ باید در کل ساختار یکتا باشد.`);
          keys.add(it.key);
        }
        for (const f of ["label", "placeholder", "helpText"]) if (it[f] !== undefined) text(it[f], `${ip}.${f}`);
        if (it.type === "message") {
          if (it.text === undefined) add(`${ip}.text`, "برای message الزامی است.");
          else text(it.text, `${ip}.text`, { nonEmpty: true });
        } else if (it.text !== undefined) text(it.text, `${ip}.text`);
        if (it.type === "link" && it.url === undefined) add(`${ip}.url`, "برای link الزامی است.");
        if (it.url !== undefined && (typeof it.url !== "string" || !/^https?:\/\//.test(it.url))) add(`${ip}.url`, "فقط آدرسی که با http:// یا https:// شروع شود پذیرفته می‌شود.");
        for (const f of ["required", "readOnly"]) if (it[f] !== undefined && typeof it[f] !== "boolean") add(`${ip}.${f}`, "باید boolean باشد.");
        for (const f of ["min", "max"]) if (it[f] !== undefined && typeof it[f] !== "number") add(`${ip}.${f}`, "باید عدد باشد.");
        for (const f of ["minLength", "maxLength"]) if (it[f] !== undefined && !(Number.isInteger(it[f]) && it[f] >= 0)) add(`${ip}.${f}`, "باید عدد صحیح صفر یا بزرگ‌تر باشد.");
        if (it.variant !== undefined && !VARIANTS.includes(it.variant)) add(`${ip}.variant`, `باید یکی از ${VARIANTS.join("، ")} باشد.`);
        if ((it.type === "select" || it.type === "radio") && it.options === undefined) add(`${ip}.options`, `برای ${it.type} الزامی است.`);
        if (it.options !== undefined) {
          if (!Array.isArray(it.options) || it.options.length < 1) add(`${ip}.options`, "باید آرایه‌ای با دست‌کم یک گزینه باشد.");
          else it.options.forEach((op, k) => {
            const opp = `${ip}.options[${k}]`;
            if (!isObj(op)) return add(opp, "هر گزینه باید شیء باشد.");
            unknown(op, OPTION_KEYS, opp);
            if (op.label === undefined) add(`${opp}.label`, "الزامی است.");
            else text(op.label, `${opp}.label`, { nonEmpty: true });
            if (!["string", "number", "boolean"].includes(typeof op.value)) add(`${opp}.value`, "الزامی است و باید رشته، عدد یا boolean باشد.");
          });
        }
      });
    });
  }

  const warnings = [];
  if (doc.layout === "form" && doc.submit === undefined) warnings.push("فرم (layout: form) بدون submit است؛ متن و رفتار دکمه‌ی ثبت پیش‌فرض دیدار می‌ماند.");
  if (doc.layout === "details" && doc.submit !== undefined) warnings.push("submit برای layout: details کاربردی ندارد.");
  const hasValueItems = Array.isArray(doc.sections) && doc.sections.some((s) => Array.isArray(s?.items) && s.items.some((it) => it?.type === "value"));
  if (hasValueItems && doc.loadOnOpen !== true) warnings.push("آیتم value مقدارش را از پاسخ extension.load می‌گیرد؛ loadOnOpen را true بگذار تا دیدار داده را بگیرد.");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    keys: [...keys],
    docs,
    note: "این چک قواعد «ساختار اکستنشن جیسون دیدار نسخه‌ی ۱» را می‌سنجد؛ اعتبارسنجی values در backend همچنان لازم است.",
  };
}
