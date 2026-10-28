// نمونه‌ی درخواست چندزبانه برای هر endpoint، ساخته‌شده از خود spec (cURL، Python، JavaScript، TypeScript، Go، PHP، Ruby، Java، C#).
const TOKEN = "RUNTIME_ACCESS_TOKEN";

export function parseRequest(ep) {
  const url = /'(https:[^']+)'/.exec(ep.request)?.[1];
  const raw = /--data-raw '([\s\S]*)'$/.exec(ep.request)?.[1];
  const body = raw ? JSON.parse(raw) : null;
  const auth = ep.auth === "client" ? [] : [["Authorization", `Bearer ${TOKEN}`]];
  const headers = [...auth, body ? ["Content-Type", "application/json"] : ["Accept", "application/json"]];
  return { method: ep.method, url, body, headers };
}

const ind = (n) => "    ".repeat(n);

function toPy(v, d = 0) {
  if (v === null) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return v.length ? `[${v.map((x) => toPy(x, d + 1)).join(", ")}]` : "[]";
  const e = Object.entries(v);
  if (!e.length) return "{}";
  return `{\n${e.map(([k, x]) => `${ind(d + 1)}${JSON.stringify(k)}: ${toPy(x, d + 1)},`).join("\n")}\n${ind(d)}}`;
}
function toPhp(v, d = 0) {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v).replace(/\$/g, "\\$");
  if (Array.isArray(v)) return v.length ? `[${v.map((x) => toPhp(x, d + 1)).join(", ")}]` : "[]";
  const e = Object.entries(v);
  if (!e.length) return "new stdClass()";
  return `[\n${e.map(([k, x]) => `${ind(d + 1)}${JSON.stringify(k)} => ${toPhp(x, d + 1)},`).join("\n")}\n${ind(d)}]`;
}
const pretty = (b, pad = "") => JSON.stringify(b, null, 2).split("\n").map((l, i) => (i ? pad + l : l)).join("\n");

export function samplesFor(ep) {
  const r = parseRequest(ep);
  const { method: M, url: U, body: B, headers: H } = r;
  const hdrObj = (pad, quote = '"') => H.map(([k, v]) => `${pad}${quote}${k}${quote}: ${quote}${v}${quote},`).join("\n");

  const python =
    `import requests\n\nresponse = requests.request(\n    "${M}",\n    "${U}",\n    headers={\n${hdrObj(ind(2))}\n    },\n` +
    (B ? `    json=${toPy(B, 1)},\n` : "") +
    `)\nprint(response.json())`;

  const jsBody = B ? `  body: JSON.stringify(${pretty(B, "  ")}),\n` : "";
  const js =
    `const response = await fetch("${U}", {\n  method: "${M}",\n  headers: {\n${hdrObj("    ")}\n  },\n${jsBody}});\n` +
    `console.log(await response.json());`;
  const ts = js.replace("console.log(await response.json());", "const data: unknown = await response.json();\nconsole.log(data);");

  const goBody = B ? `strings.NewReader(\`${pretty(B)}\`)` : "nil";
  const go =
    `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n${B ? '\t"strings"\n' : ""})\n\nfunc main() {\n` +
    `\treq, _ := http.NewRequest("${M}", "${U}", ${goBody})\n` +
    H.map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`).join("\n") +
    `\n\n\tres, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer res.Body.Close()\n\n\tout, _ := io.ReadAll(res.Body)\n\tfmt.Println(string(out))\n}`;

  const php =
    `<?php\n$ch = curl_init("${U}");\ncurl_setopt_array($ch, [\n    CURLOPT_CUSTOMREQUEST => "${M}",\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_HTTPHEADER => [\n` +
    H.map(([k, v]) => `        "${k}: ${v}",`).join("\n") +
    `\n    ],\n` +
    (B ? `    CURLOPT_POSTFIELDS => json_encode(${toPhp(B, 1)}),\n` : "") +
    `]);\n\necho curl_exec($ch);`;

  const klass = { GET: "Get", POST: "Post", PUT: "Put", PATCH: "Patch", DELETE: "Delete" }[M];
  const ruby =
    `require "net/http"\nrequire "json"\n\nuri = URI("${U}")\nrequest = Net::HTTP::${klass}.new(uri)\n` +
    H.map(([k, v]) => `request["${k}"] = "${v}"`).join("\n") +
    "\n" +
    (B ? `request.body = <<~JSON\n  ${pretty(B, "  ")}\nJSON\n` : "") +
    `\nresponse = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(request) }\nputs response.body`;

  const javaBody = B ? `HttpRequest.BodyPublishers.ofString(${JSON.stringify(JSON.stringify(B))})` : "HttpRequest.BodyPublishers.noBody()";
  const java =
    `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create("${U}"))\n` +
    H.map(([k, v]) => `            .header("${k}", "${v}")`).join("\n") +
    `\n            .method("${M}", ${javaBody})\n            .build();\n\n        HttpResponse<String> response = HttpClient.newHttpClient()\n            .send(request, HttpResponse.BodyHandlers.ofString());\n        System.out.println(response.body());\n    }\n}`;

  const cs =
    `using System.Net.Http;\nusing System.Text;\n\nvar client = new HttpClient();\nvar request = new HttpRequestMessage(new HttpMethod("${M}"), "${U}");\n` +
    (ep.auth === "client" ? "" : `request.Headers.Add("Authorization", "Bearer ${TOKEN}");\n`) +
    (B ? `request.Content = new StringContent("""\n${pretty(B)}\n""", Encoding.UTF8, "application/json");\n` : `request.Headers.Add("Accept", "application/json");\n`) +
    `\nvar response = await client.SendAsync(request);\nConsole.WriteLine(await response.Content.ReadAsStringAsync());`;

  return [
    { label: "cURL", lang: "bash", code: ep.request },
    { label: "Python", lang: "python", code: python },
    { label: "JavaScript", lang: "javascript", code: js },
    { label: "TypeScript", lang: "typescript", code: ts },
    { label: "Go", lang: "go", code: go },
    { label: "PHP", lang: "php", code: php },
    { label: "Ruby", lang: "ruby", code: ruby },
    { label: "Java", lang: "java", code: java },
    { label: "C#", lang: "csharp", code: cs },
  ];
}
