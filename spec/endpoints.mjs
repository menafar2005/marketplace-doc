// منبع واحد مشخصات endpointهای پروکسی مارکت‌پلیس.
// صفحه‌های مرجع API (HTML / Markdown) و ابزار get_api_spec در MCP هر دو از همین فایل ساخته می‌شوند.
//
// بدنه‌ی endpointهای پروکسی دقیقاً بدنه‌ی OpenAPI دیدار است. توضیح کامل هر پراپرتی (شامل «وابستگی‌ها»،
// «شرایط ارسال»، «مقادیر مجاز»)، قواعد و محدودیت‌ها و نمونه‌ی پاسخ، بدون خلاصه‌سازی از «Didar technical doc»
// گرفته می‌شود: `npm run sync:didar` فایل‌های spec/didar/*.json را از منبع به‌روز می‌کند.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const snap = (page) => JSON.parse(readFileSync(join(here, "didar", `${page}.json`), "utf8"));

const BASE = "https://marketplace.didar.me";
const TOKEN_HEADER = "Authorization: Bearer RUNTIME_ACCESS_TOKEN";
const META = { traceId: "TRACE_ID", timestampUtc: "2026-01-01T00:00:00Z" };

// ---- نمونه‌ی درخواست به قالب Didar: curl --location، headerها بدون تورفتگی، --data-raw مرتب ----
const getCurl = (path) => `curl --location '${BASE}${path}' \\\n--header '${TOKEN_HEADER}' \\\n--header 'Accept: application/json'`;
const sendCurl = (method, path, body) => {
  const pretty = JSON.stringify(typeof body === "string" ? JSON.parse(body) : body, null, 2);
  const flag = method === "POST" ? "" : ` --request ${method}`;
  return `curl --location${flag} '${BASE}${path}' \\\n--header '${TOKEN_HEADER}' \\\n--header 'Content-Type: application/json' \\\n--data-raw '${pretty}'`;
};

// ---- نمونه‌ی پاسخ: envelope استاندارد مارکت‌پلیس، data.Response = پاسخ OpenAPI دیدار ----
const envelope = (response) => JSON.stringify({ succeeded: true, data: { Response: response }, error: null, meta: META }, null, 2);
const didarResponse = (page, fallback) => {
  try {
    const parsed = JSON.parse(snap(page).response);
    return envelope(parsed.Response !== undefined ? parsed.Response : parsed);
  } catch {
    return envelope(JSON.parse(fallback));
  }
};

const NO_BODY = "این endpoint body و query parameter ندارد.";
const path = (name, description) => ({ name, in: "path", type: "string", required: true, description, sections: [] });

/** «POST {{baseURL}}/api/deal/save_v2?apikey=…» → «POST /api/deal/save_v2» */
const didarOp = (doc) => doc.http.replace("{{baseURL}}", "").replace(/\?apikey=.*$/, "");

function build(def) {
  const doc = def.didarPage ? snap(def.didarPage) : null;
  const skip = new Set(def.skipBody || []);
  const params = [
    ...(def.pathParams || []),
    ...(doc ? doc.params.filter((p) => !skip.has(p.name)).map((p) => ({ ...p, in: "body" })) : []),
  ];
  const ep = {
    id: def.id, title: def.title, method: def.method, path: def.path,
    summary: def.summary, scope: def.scope, context: def.context,
    params, bodyNote: params.some((p) => p.in === "body") ? null : def.bodyNote || NO_BODY,
    request: def.body ? sendCurl(def.method, def.path.replace(/\{(\w+)\}/g, def.example || "ID"), def.body) : getCurl(def.path.replace(/\{(\w+)\}/g, def.example || "ID")),
    response: didarResponse(def.didarPage, def.response),
  };
  if (doc) {
    ep.didarPage = doc.page;
    ep.didar = `${doc.title} — ${didarOp(doc)}`;
    ep.didarDoc = {
      source: doc.source, heading: doc.heading, intro: doc.intro, rules: doc.rules, related: doc.related,
      operation: didarOp(doc),
    };
  }
  return ep;
}

// شناسه‌ی route: برای GET توضیح از پراپرتی `Id` دیدار گرفته می‌شود
const idFromDidar = (page, name, extra) => {
  const id = snap(page).params.find((p) => p.name === "Id");
  return { ...path(name, id.description), sections: id.sections, extra };
};

const basic = (def) => build({ scope: { read: "basicinfo" }, ...def });

export const groups = [
  {
    id: "basic", page: "api-basic", title: "اطلاعات پایه", entity: "اطلاعات پایه دیدار",
    intro:
      "این endpointها اطلاعات مرجع BizDomain، کاربران، pipelineها، stageها، labelها، انواع فعالیت و دلایل شکست را از طریق پروکسی امن مارکت‌پلیس ارائه می‌کنند. همه‌ی آن‌ها به Runtime Bearer Token و scope «basicinfo» نیاز دارند و بدون body و query parameter هستند.",
    endpoints: [
      basic({ id: "biz-domain-info", title: "اطلاعات BizDomain", method: "GET", path: "/api/v1/proxy/biz-domain/info",
        summary: "اطلاعات BizDomain نصب‌شده را برمی‌گرداند.",
        response: `{ "Id": "BIZ_DOMAIN_ID", "Title": "Sample Business", "Name": "Sample Business", "IsActive": true }` }),
      basic({ id: "activity-types", title: "انواع فعالیت", method: "GET", path: "/api/v1/proxy/activity-types", didarPage: "Activity-Type",
        summary: "انواع فعالیت قابل‌استفاده در فعالیت‌ها را برمی‌گرداند. شناسه‌ی هر مورد برای Activity.ActivityTypeId استفاده می‌شود.", response: "[]" }),
      basic({ id: "lost-reasons", title: "دلایل شکست معامله", method: "GET", path: "/api/v1/proxy/lost-reasons", didarPage: "Lost-Reasons",
        summary: "دلایل شکست یا از دست رفتن معامله را برمی‌گرداند.", response: "[]" }),
      basic({ id: "pipelines-deals", title: "Pipelineهای معامله", method: "GET", path: "/api/v1/proxy/pipelines/deals", didarPage: "List-Deal-Pipelines",
        summary: "pipelineهای معامله را با stageهایشان برمی‌گرداند. خروجی هر pipeline شامل Id، Title و Stages[] است.", response: "[]" }),
      basic({ id: "pipelines-cases", title: "Pipelineهای پرونده", method: "GET", path: "/api/v1/proxy/pipelines/cases", didarPage: "List-Case-Pipelines",
        summary: "همان خروجی pipelineها، برای پرونده‌ها.", response: "[]" }),
      basic({ id: "pipeline-stages-deals", title: "Stageهای معامله", method: "GET", path: "/api/v1/proxy/pipeline-stages/deals",
        summary: "Stages[] همه‌ی pipelineهای معامله را flatten می‌کند و PipelineId و PipelineTitle را به هر مورد اضافه می‌کند.",
        response: `[ { "Id": "STAGE_ID", "Title": "New", "Index": 1, "IsDeleted": false, "PipelineId": "PIPELINE_ID", "PipelineTitle": "Sales pipeline" } ]` }),
      basic({ id: "pipeline-stages-cases", title: "Stageهای پرونده", method: "GET", path: "/api/v1/proxy/pipeline-stages/cases",
        summary: "همان خروجی flatten شده‌ی stageها، برای پرونده‌ها.",
        response: `[ { "Id": "STAGE_ID", "Title": "New", "Index": 1, "IsDeleted": false, "PipelineId": "PIPELINE_ID", "PipelineTitle": "Support pipeline" } ]` }),
      basic({ id: "labels-deals", title: "Labelهای معامله", method: "GET", path: "/api/v1/proxy/labels/deals", didarPage: "Deal-Labels",
        summary: "فهرست labelهای مرتبط با معامله را برمی‌گرداند.", response: "[]" }),
      basic({ id: "labels-cases", title: "Labelهای پرونده", method: "GET", path: "/api/v1/proxy/labels/cases", didarPage: "Case-Labels",
        summary: "فهرست labelهای مرتبط با پرونده را برمی‌گرداند.", response: "[]" }),
      basic({ id: "users", title: "کاربران", method: "GET", path: "/api/v1/proxy/users", didarPage: "User-List",
        summary: "کاربران BizDomain را برای تخصیص مسئول و نمایش نام‌ها برمی‌گرداند.", response: "[]" }),
    ],
  },
  {
    id: "deals", page: "api-deals", title: "معامله", entity: "معامله (Deal)",
    intro: "خواندن و ویرایش معامله. هر دو endpoint فقط زمانی مجازند که Runtime Context از نوع deal باشد و شناسه‌ی route در entityIds وجود داشته باشد.",
    endpoints: [
      build({ id: "deal-get", title: "دریافت معامله", method: "GET", path: "/api/v1/deals/{dealId}", example: "704e1533-cb4b-42d7-895d-ef71ff32ba5b",
        didarPage: "Get-Deal-By-Id", skipBody: ["Id"],
        summary: "اطلاعات معامله را در data.Response برمی‌گرداند.",
        scope: { read: "deals یا deals.fullaccess" }, context: "context باید از نوع deal باشد و dealId در entityIds وجود داشته باشد.",
        pathParams: [idFromDidar("Get-Deal-By-Id", "dealId")],
        bodyNote: "این endpoint body ندارد. شناسه از route خوانده می‌شود (معادل فیلد Id در بدنه‌ی API دیدار).", response: "{}" }),
      build({ id: "deal-update", title: "ویرایش معامله", method: "PUT", path: "/api/v1/deals/{dealId}", example: "704e1533-cb4b-42d7-895d-ef71ff32ba5b",
        didarPage: "Update-Deal",
        summary: "فیلدهای معامله را ویرایش می‌کند و نسخه‌ی به‌روزشده را در data.Response برمی‌گرداند. Deal.Id باید با route برابر باشد.",
        scope: { write: "deals.fullaccess" }, context: "context باید از نوع deal باشد و dealId در entityIds وجود داشته باشد.",
        pathParams: [path("dealId", "شناسه‌ی معامله؛ باید با Deal.Id برابر باشد.")],
        body: { Deal: { Id: "704e1533-cb4b-42d7-895d-ef71ff32ba5b", Title: "Enterprise renewal", PersonId: "PERSON_ID", PipelineId: "PIPELINE_ID", PipelineStageId: "STAGE_ID", Price: "120000", LabelIds: ["LABEL_ID"] }, DealItems: [] },
        response: "{}" }),
    ],
  },
  {
    id: "cases", page: "api-cases", title: "پرونده", entity: "پرونده (Case)",
    intro: "خواندن و ویرایش پرونده. context باید از نوع case باشد و شناسه‌ی پرونده در entityIds وجود داشته باشد.",
    endpoints: [
      build({ id: "case-get", title: "دریافت پرونده", method: "GET", path: "/api/v1/cases/{caseId}", example: "11111111-2222-3333-4444-555555555555",
        summary: "اطلاعات پرونده را در data.Response برمی‌گرداند.",
        scope: { read: "cases یا cases.fullaccess" }, context: "context باید از نوع case باشد و caseId در entityIds وجود داشته باشد.",
        pathParams: [path("caseId", "شناسه‌ی پرونده؛ باید در entityIds موجود باشد.")],
        bodyNote: "این endpoint body ندارد. شناسه از route خوانده می‌شود.",
        response: `{ "Id": "11111111-2222-3333-4444-555555555555", "Title": "Implementation case", "Status": "Open", "Person": { "Id": "PERSON_ID", "DisplayName": "Alex Morgan" }, "Company": { "Id": "COMPANY_ID", "Title": "Example Ltd" } }` }),
      build({ id: "case-update", title: "ویرایش پرونده", method: "PUT", path: "/api/v1/cases/{caseId}", example: "11111111-2222-3333-4444-555555555555",
        didarPage: "Update-Case",
        summary: "فیلدهای پرونده را ویرایش می‌کند. Case.Id باید با route برابر باشد و پاسخ، نسخه‌ی به‌روزشده را در data.Response برمی‌گرداند.",
        scope: { write: "cases.fullaccess" }, context: "context باید از نوع case باشد و caseId در entityIds وجود داشته باشد.",
        pathParams: [path("caseId", "شناسه‌ی پرونده؛ باید با Case.Id برابر باشد.")],
        body: { Case: { Id: "11111111-2222-3333-4444-555555555555", Title: "Updated implementation case", PipelineStageId: "STAGE_ID", CaseCategoryId: "00000000-0000-0000-0000-000000000000" } },
        response: "{}" }),
    ],
  },
  {
    id: "contacts", page: "api-contacts", title: "شخص و شرکت", entity: "شخص و شرکت (Contact)",
    intro: "شخص و شرکت هر دو با مدل Contact ذخیره می‌شوند. برای GET بدنه وجود ندارد. برای PUT، Contact.Id باید با route برابر باشد و Type برای شخص Person و برای شرکت Company باشد.",
    endpoints: [
      build({ id: "person-get", title: "دریافت شخص", method: "GET", path: "/api/v1/contacts/persons/{personId}", example: "PERSON_ID",
        didarPage: "Get-Person-By-Id", skipBody: ["Id"],
        summary: "اطلاعات شخص را در data.Response برمی‌گرداند.",
        scope: { read: "contacts یا contacts.fullaccess" }, context: "context باید از نوع person باشد و شناسه‌ی شخص در entityIds وجود داشته باشد.",
        pathParams: [idFromDidar("Get-Person-By-Id", "personId")], bodyNote: NO_BODY, response: "{}" }),
      build({ id: "person-update", title: "ویرایش شخص", method: "PUT", path: "/api/v1/contacts/persons/{personId}", example: "PERSON_ID",
        didarPage: "Update-Person",
        summary: "اطلاعات شخص را ویرایش می‌کند. Contact.Id باید با route برابر و Type برابر Person باشد؛ پاسخ در data.Response برگردانده می‌شود.",
        scope: { write: "contacts.fullaccess" }, context: "context باید از نوع person باشد و شناسه‌ی شخص در entityIds وجود داشته باشد.",
        pathParams: [path("personId", "شناسه‌ی شخص؛ باید با Contact.Id برابر باشد.")],
        body: { Contact: { Id: "PERSON_ID", Type: "Person", FirstName: "Alex", LastName: "Morgan", OwnerId: "USER_ID", MobilePhone: "09120000000", Email: "alex@example.com" } },
        response: "{}" }),
      build({ id: "company-get", title: "دریافت شرکت", method: "GET", path: "/api/v1/contacts/companies/{companyId}", example: "COMPANY_ID",
        didarPage: "Get-Company-By-Id", skipBody: ["Id"],
        summary: "اطلاعات شرکت را در data.Response برمی‌گرداند.",
        scope: { read: "contacts یا contacts.fullaccess" }, context: "context باید از نوع company باشد و شناسه‌ی شرکت در entityIds وجود داشته باشد.",
        pathParams: [idFromDidar("Get-Company-By-Id", "companyId")], bodyNote: NO_BODY, response: "{}" }),
      build({ id: "company-update", title: "ویرایش شرکت", method: "PUT", path: "/api/v1/contacts/companies/{companyId}", example: "COMPANY_ID",
        didarPage: "Update-Company",
        summary: "اطلاعات شرکت را ویرایش می‌کند. همان ساختار شخص با مسیر /companies/{companyId} و Type: Company.",
        scope: { write: "contacts.fullaccess" }, context: "context باید از نوع company باشد و شناسه‌ی شرکت در entityIds وجود داشته باشد.",
        pathParams: [path("companyId", "شناسه‌ی شرکت؛ باید با Contact.Id برابر باشد.")],
        body: { Contact: { Id: "COMPANY_ID", Type: "Company", FirstName: "Example Ltd", OwnerId: "USER_ID", WorkPhone: "02100000000", Email: "info@example.com" } },
        response: "{}" }),
    ],
  },
  {
    id: "activities", page: "api-activities", title: "فعالیت و یادداشت", entity: "فعالیت و یادداشت (Activity / Note)",
    intro: "فعالیت و یادداشت هر دو با مدل Activity کار می‌کنند. یادداشت یک Activity با ActivityTypeId برابر GUID خالی و IsDone برابر true است.",
    endpoints: [
      build({ id: "activity-search", title: "جستجوی فعالیت", method: "POST", path: "/api/v1/activities/search", didarPage: "Search-Activity",
        summary: "فعالیت‌ها را جستجو می‌کند. حداقل یکی از DealId، CaseId یا ContactIds[] الزامی است و همه‌ی associationها باید در context مجاز باشند.",
        scope: { read: "activities یا activities.fullaccess" }, context: "بدنه‌ی درخواست با توجه به Runtime Context بررسی می‌شود.",
        body: { DealId: "DEAL_ID", From: 0, Limit: 20, IsDone: false }, response: "{}" }),
      build({ id: "activity-get", title: "دریافت فعالیت", method: "GET", path: "/api/v1/activities/{activityId}", example: "ACTIVITY_ID",
        didarPage: "Get-Activity-By-Id", skipBody: ["Id"],
        summary: "اطلاعات یک فعالیت را برمی‌گرداند؛ شناسه از route خوانده می‌شود.",
        scope: { read: "activities یا activities.fullaccess" }, context: "context باید از نوع activity باشد و activityId در entityIds وجود داشته باشد.",
        pathParams: [idFromDidar("Get-Activity-By-Id", "activityId")], bodyNote: NO_BODY, response: "{}" }),
      build({ id: "activity-create", title: "ساخت فعالیت", method: "POST", path: "/api/v1/activities", didarPage: "Create-Activity",
        summary: "فعالیت جدید می‌سازد. Activity.Id را ارسال نکنید. حداقل یک association مجاز (DealId، CaseId یا ContactIds[]) لازم است.",
        scope: { write: "activities.fullaccess" }, context: "associationها باید در Runtime Context مجاز باشند.",
        body: { Activity: { ActivityTypeId: "ACTIVITY_TYPE_ID", Title: "Follow-up call", DealId: "DEAL_ID", OwnerId: "USER_ID", IsDone: false, ContactIds: ["PERSON_ID"] } }, response: "{}" }),
      build({ id: "activity-update", title: "ویرایش فعالیت", method: "PUT", path: "/api/v1/activities/{activityId}", example: "ACTIVITY_ID",
        didarPage: "Update-Activity",
        summary: "فعالیت موجود را ویرایش می‌کند. Activity.Id الزامی و برابر route است.",
        scope: { write: "activities.fullaccess" }, context: "associationها باید در Runtime Context مجاز باشند.",
        pathParams: [path("activityId", "شناسه‌ی فعالیت؛ باید با Activity.Id برابر باشد.")],
        body: { Activity: { Id: "ACTIVITY_ID", ActivityTypeId: "ACTIVITY_TYPE_ID", Title: "Updated follow-up call", DealId: "DEAL_ID" } }, response: "{}" }),
      build({ id: "note-create", title: "ساخت یادداشت", method: "POST", path: "/api/v1/notes", didarPage: "Create-Note",
        summary: "یادداشت با مدل Activity ارسال می‌شود. ActivityTypeId باید GUID خالی و IsDone الزامی (true) است. متن یادداشت در ResultNote قرار می‌گیرد.",
        scope: { write: "activities.fullaccess" }, context: "associationها باید در Runtime Context مجاز باشند.",
        body: { Activity: { ActivityTypeId: "00000000-0000-0000-0000-000000000000", IsDone: true, DealId: "DEAL_ID", ResultNote: "Customer requested a follow-up." } }, response: "{}" }),
      build({ id: "note-update", title: "ویرایش یادداشت", method: "PUT", path: "/api/v1/notes/{noteId}", example: "NOTE_ID",
        didarPage: "Update-Note",
        summary: "یادداشت موجود را ویرایش می‌کند؛ Activity.Id برابر route است.",
        scope: { write: "activities.fullaccess" }, context: "associationها باید در Runtime Context مجاز باشند.",
        pathParams: [path("noteId", "شناسه‌ی یادداشت؛ باید با Activity.Id برابر باشد.")],
        body: { Activity: { Id: "NOTE_ID", ActivityTypeId: "00000000-0000-0000-0000-000000000000", IsDone: true, DealId: "DEAL_ID", ResultNote: "Updated note." } }, response: "{}" }),
    ],
  },
];

export const baseUrl = BASE;
