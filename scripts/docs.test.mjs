import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
execSync("node scripts/build.mjs", { cwd: root, stdio: "ignore" });
const { default: worker } = await import("../src/worker.js");
const { pages, spec } = await import("../src/generated/content.js");

const ORIGIN = "https://docs.test";
const get = (p) => worker.fetch(new Request(ORIGIN + p));
const rpc = async (method, params, id = 1) => {
  const r = await worker.fetch(new Request(ORIGIN + "/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) }));
  return { status: r.status, body: r.status === 202 ? null : await r.json() };
};
const call = async (name, args = {}) => {
  const { body } = await rpc("tools/call", { name, arguments: args });
  return body.result;
};

test("every page renders and has a markdown twin", async () => {
  for (const p of pages) {
    const html = await get("/" + p.slug);
    assert.equal(html.status, 200, p.slug);
    assert.match(await html.text(), /<h1>/);
    assert.equal((await get(`/${p.slug}.md`)).status, 200, p.slug);
  }
  assert.equal((await get("/")).status, 200);
  assert.equal((await get("/nope")).status, 404);
});

test("internal links point at existing pages", () => {
  const slugs = new Set(pages.map((p) => p.slug));
  for (const p of pages) {
    for (const m of p.md.matchAll(/\]\(\/([\w-]+)(?:#[\w-]+)?\)/g)) assert.ok(slugs.has(m[1]), `${p.slug} -> /${m[1]}`);
  }
});

test("every endpoint has unique id, path and sample request/response JSON", () => {
  const ids = new Set();
  for (const g of spec.groups) {
    for (const e of g.endpoints) {
      assert.ok(!ids.has(e.id), e.id);
      ids.add(e.id);
      assert.ok(e.path.startsWith("/api/"), e.path);
      assert.doesNotThrow(() => JSON.parse(e.response), e.id);
      const m = /--data-raw '([\s\S]*)'$/.exec(e.request);
      if (m) assert.doesNotThrow(() => JSON.parse(m[1]), e.id);
      for (const name of (e.path.match(/\{(\w+)\}/g) || []).map((x) => x.slice(1, -1))) {
        assert.ok(e.params.some((p) => p.name === name && p.in === "path"), `${e.id} path param ${name}`);
      }
    }
  }
});

test("MCP handshake, tools and notifications", async () => {
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.equal(init.body.result.protocolVersion, "2025-06-18");
  assert.ok(init.body.result.capabilities.tools);
  const note = await worker.fetch(new Request(ORIGIN + "/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) }));
  assert.equal(note.status, 202);
  const list = await rpc("tools/list");
  const names = list.body.result.tools.map((t) => t.name);
  for (const n of ["search_docs", "get_page", "list_pages", "get_plugin_anatomy", "get_api_spec", "list_scopes", "list_extensions", "list_error_codes", "scaffold_plugin", "validate_plugin"]) assert.ok(names.includes(n), n);
  assert.equal((await rpc("nope")).body.error.code, -32601);
  assert.equal((await worker.fetch(new Request(ORIGIN + "/mcp"))).status, 405);
});

test("search_docs finds launch code docs", async () => {
  const r = await call("search_docs", { query: "launch code منقضی" });
  assert.match(r.content[0].text, /runtime-token|api-auth|errors|test-environment/);
});

test("get_api_spec resolves by id, by method+path with real ids, and by query", async () => {
  const byId = JSON.parse((await call("get_api_spec", { id: "deal-update" })).content[0].text);
  assert.equal(byId.method, "PUT");
  assert.ok(byId.params.find((p) => p.name === "Deal.PipelineStageId" && p.required));
  const byPath = JSON.parse((await call("get_api_spec", { method: "PUT", path: "/api/v1/contacts/persons/abc-123" })).content[0].text);
  assert.equal(byPath.id, "person-update");
  const byQuery = JSON.parse((await call("get_api_spec", { query: "ساخت یادداشت" })).content[0].text);
  assert.equal(byQuery.id, "note-create");
});

test("validate_plugin flags known violations", async () => {
  const bad = JSON.parse((await call("validate_plugin", { config: { callbackUrl: "http://x.test/cb", scopes: ["deals", "oops"], extensions: [{ contentType: "Json", location: 2, entityType: "person", endpointUrl: "https://x.test/l", corsAllowOrigin: "*" }], secretInFrontend: true } })).content[0].text);
  assert.equal(bad.valid, false);
  const rules = bad.errors.map((e) => e.rule);
  for (const r of ["callbackUrl-https", "scope-unknown", "entityType", "cors-wildcard", "secret-frontend"]) assert.ok(rules.includes(r), r);
  const good = JSON.parse((await call("validate_plugin", { config: { callbackUrl: "https://x.test/cb", usesStateParam: true, scopes: ["deals"], extensions: [{ contentType: "Json", surfaceType: "Modal", location: 2, entityType: "deal", endpointUrl: "https://x.test/l", corsAllowOrigin: "https://app.didar.me" }] } })).content[0].text);
  assert.equal(good.valid, true, JSON.stringify(good));
});

test("scaffold_plugin returns parseable files", async () => {
  const out = JSON.parse((await call("scaffold_plugin", { name: "Meet Plugin", scopes: ["deals"], extension: "json" })).content[0].text);
  assert.equal(out.name, "meet-plugin");
  for (const f of out.files) if (f.path.endsWith(".js")) assert.doesNotThrow(() => new Function(f.content.replace(/^import .*$/gm, "").replace(/^export /gm, "")), f.path);
  JSON.parse(out.files.find((f) => f.path === "package.json").content);
});

test("multi-language samples are generated for every endpoint", async () => {
  const { samplesFor } = await import("./lib/samples.mjs");
  for (const g of spec.groups) {
    for (const e of g.endpoints) {
      const s = samplesFor(e);
      assert.deepEqual(s.map((x) => x.label), ["cURL", "Python", "JavaScript", "TypeScript", "Go", "PHP", "Ruby", "Java", "C#"], e.id);
      const js = s.find((x) => x.label === "JavaScript").code;
      assert.doesNotThrow(() => new Function(`return (async () => {${js}})`), e.id);
      if (e.auth === "client") assert.ok(s.every((x) => !x.code.includes("RUNTIME_ACCESS_TOKEN") && /client_?secret/i.test(x.code)), e.id);
      else assert.ok(s.every((x) => x.code.includes("RUNTIME_ACCESS_TOKEN")), e.id);
    }
  }
});

test("curl samples are formatted like the Didar docs (multi-line, --data-raw)", () => {
  for (const g of spec.groups) {
    for (const e of g.endpoints) {
      assert.ok(e.request.startsWith("curl --location"), e.id);
      assert.ok(!/--data-raw '\{.*\}'$/.test(e.request) || e.request.includes("\n  "), `${e.id} body should be pretty printed`);
    }
  }
});

test("parameter descriptions come verbatim from the Didar docs (no shortening)", async () => {
  const { readFileSync } = await import("node:fs");
  const dealSnap = JSON.parse(readFileSync(join(root, "spec/didar/Update-Deal.json"), "utf8"));
  const ep = spec.groups.flatMap((g) => g.endpoints).find((e) => e.id === "deal-update");
  const bodyParams = ep.params.filter((p) => p.in === "body");
  assert.equal(bodyParams.length, dealSnap.params.length);
  for (const p of dealSnap.params) {
    const mine = bodyParams.find((x) => x.name === p.name);
    assert.equal(mine.description, p.description, p.name);
    assert.deepEqual(mine.sections, p.sections, p.name);
  }
  const html = await (await get("/api-deals")).text();
  assert.match(html, /وابستگی‌ها/);
  assert.match(html, /<details class="children"/);
  assert.match(html, /class="ep-copy"/);
});

test("code tabs render on API pages and the MCP page with ChatGPT and Codex", async () => {
  const api = await (await get("/api-deals")).text();
  assert.match(api, /class="cb-tab"[^>]*data-label="Python"/);
  const mcp = await (await get("/build-with-mcp")).text();
  for (const l of ["Claude Code", "Claude", "ChatGPT", "Codex", "Cursor", "VS Code"]) assert.match(mcp, new RegExp(`data-label="${l}"`), l);
  assert.match(mcp, /https:\/\/docs\.test\/mcp/);
});

test("header has no GitHub or llms.txt links", async () => {
  const home = await (await get("/")).text();
  const header = /<header class="topbar">[\s\S]*?<\/header>/.exec(home)[0];
  assert.doesNotMatch(header, /github|llms\.txt/i);
});

test("marketplace install and token endpoints are in the API reference", async () => {
  const auth = spec.groups.find((g) => g.id === "marketplace");
  assert.deepEqual(auth.endpoints.map((e) => e.id), ["complete-installation", "runtime-token"]);
  const html = await (await get("/api-auth")).text();
  assert.match(html, /https:\/\/app\.didar\.me\/api\/MarketplaceInstall\/CompleteInstallation/);
  assert.match(html, /https:\/\/marketplace\.didar\.me\/api\/v1\/runtime\/token/);
  assert.match(html, /فیلدهای پاسخ/);
  const tok = JSON.parse((await call("get_api_spec", { method: "POST", path: "/api/v1/runtime/token" })).content[0].text);
  assert.equal(tok.id, "runtime-token");
  assert.equal(tok.url, "https://marketplace.didar.me/api/v1/runtime/token");
  assert.doesNotMatch(tok.auth, /Bearer <Runtime Token>/);
  const inst = JSON.parse((await call("get_api_spec", { id: "complete-installation" })).content[0].text);
  assert.equal(inst.url, "https://app.didar.me/api/MarketplaceInstall/CompleteInstallation");
});

test("old page slugs redirect to their new home", async () => {
  for (const [from, to] of [["/quick-start", "/tutorial-first-app"], ["/introduction", "/getting-started"], ["/launch", "/runtime-token"], ["/security-errors.md", "/errors.md"], ["/glossary", "/about-the-marketplace#glossary"], ["/extensions", "/app-extensions"]]) {
    const r = await get(from);
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get("location"), to, from);
  }
});

test("every page in the sidebar exists and every page is in the sidebar", async () => {
  const html = await (await get("/getting-started")).text();
  for (const s of ["getting-started", "creating-an-app", "test-environment", "build-with-mcp", "about-the-marketplace", "app-installation-flows", "developer-hub", "registering-an-app", "client-id-and-client-secret", "app-extensions", "link-actions", "json-modals", "json-panels", "custom-ui-extensions", "custom-modals", "custom-panels", "app-settings", "authentication", "installation-authorization", "runtime-token", "scopes", "state-parameter", "tutorial-first-app", "security"]) {
    assert.match(html, new RegExp(`href="/${s}"`), s);
  }
  const api = await (await get("/api-concepts")).text();
  for (const s of ["api-concepts", "api-requests", "api-responses", "errors", "api-auth", "api-app-endpoints", "api-basic", "api-deals", "api-cases", "api-contacts", "api-activities"]) {
    assert.match(api, new RegExp(`href="/${s}"`), s);
  }
});

test("every page is reachable from the sidebar", async () => {
  const navHtml = (await (await get("/getting-started")).text()) + (await (await get("/api-concepts")).text());
  for (const p of pages) assert.match(navHtml, new RegExp(`href="/${p.slug}"`), p.slug);
});

test("screenshots exist in public/ and diagrams are inline only in HTML", async () => {
  const { existsSync } = await import("node:fs");
  let images = 0, diagrams = 0;
  for (const p of pages) {
    for (const m of p.md.matchAll(/!\[[^\]]*\]\((\/images\/[^ )]+)/g)) {
      images++;
      assert.ok(existsSync(join(root, "public", m[1])), `${p.slug}: missing ${m[1]}`);
    }
    assert.doesNotMatch(p.md, /<svg|<!--DIAGRAM/, `${p.slug}: diagram leaked into markdown`);
    diagrams += (p.html.match(/<figure class="diagram"><svg/g) || []).length;
  }
  assert.ok(images >= 10, `images: ${images}`);
  assert.ok(diagrams >= 6, `diagrams: ${diagrams}`);
  const html = await (await get("/installation-authorization")).text();
  assert.match(html, /<figure class="diagram"><svg[^>]*role="img"/);
});
