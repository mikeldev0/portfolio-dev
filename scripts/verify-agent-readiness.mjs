const baseUrl = (process.env.BASE_URL || "https://www.mikeldev.com").replace(/\/$/, "");
const crawlerUserAgents = [
  "ChatGPT-User",
  "ClaudeBot",
  "Google-Extended",
  "ora-agent",
  "DeepSeekBot",
];

let failures = 0;

function check(condition, label, detail = "") {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }

  failures += 1;
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

async function request(path, init = {}) {
  return fetch(`${baseUrl}${path}`, { redirect: "follow", ...init });
}

for (const userAgent of crawlerUserAgents) {
  const response = await request("/", { headers: { "User-Agent": userAgent } });
  const body = await response.text();
  check(
    response.status === 200 && body.includes("Mikel Echeverria"),
    `crawler reachability ${userAgent}`,
    `HTTP ${response.status}`,
  );
}

const htmlResponse = await request("/", { headers: { Accept: "text/html" } });
const html = await htmlResponse.text();
const rawText = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
check(htmlResponse.status === 200, "HTML homepage status", `HTTP ${htmlResponse.status}`);
check(htmlResponse.headers.get("content-type")?.includes("text/html"), "HTML content type");
check((htmlResponse.headers.get("vary") || "").toLowerCase().includes("accept"), "HTML Vary includes Accept");
check(/<h1[\s>]/i.test(html), "raw HTML contains H1");
check(rawText.length >= 500, "raw HTML contains at least 500 text characters", `${rawText.length} chars`);
check((htmlResponse.headers.get("link") || "").includes("service-desc"), "HTML advertises OpenAPI service description");

const markdownResponse = await request("/", { headers: { Accept: "text/markdown" } });
const markdown = await markdownResponse.text();
check(markdownResponse.status === 200, "Markdown homepage status", `HTTP ${markdownResponse.status}`);
check(markdownResponse.headers.get("content-type")?.includes("text/markdown"), "Markdown content type");
check(
  (markdownResponse.headers.get("vary") || "").toLowerCase().includes("accept"),
  "Markdown Vary includes Accept",
);
check(markdown.startsWith("# Mikel Echeverria"), "Markdown homepage body");

const rejected = await request("/", { headers: { Accept: "application/pdf" } });
check(rejected.status === 406, "unsupported representation returns 406", `HTTP ${rejected.status}`);

const missingHtml = await request("/agent-readiness-probe-not-found", {
  headers: { Accept: "text/html" },
});
check(missingHtml.status === 404, "HTML missing path returns 404", `HTTP ${missingHtml.status}`);

const missingMarkdown = await request("/agent-readiness-probe-not-found", {
  headers: { Accept: "text/markdown" },
});
const missingBody = await missingMarkdown.text();
check(
  missingMarkdown.status === 404,
  "Markdown missing path returns 404",
  `HTTP ${missingMarkdown.status}`,
);
check(
  missingMarkdown.headers.get("content-type")?.includes("text/markdown"),
  "Markdown 404 content type",
);
check(/llms\.txt/.test(missingBody) && /sitemap\.xml/.test(missingBody), "Markdown 404 recovery links");

const openApiResponse = await request("/openapi.json", { headers: { Accept: "application/json" } });
const openApi = await openApiResponse.json();
check(openApiResponse.status === 200, "OpenAPI status", `HTTP ${openApiResponse.status}`);
check(openApi.openapi === "3.1.0", "OpenAPI version");
check(Boolean(openApi.paths?.["/api/profile"]?.get?.operationId), "OpenAPI profile operationId");

const profileResponse = await request("/api/profile", { headers: { Accept: "application/json" } });
const profile = await profileResponse.json();
check(profileResponse.status === 200, "public profile API status", `HTTP ${profileResponse.status}`);
check(profileResponse.headers.get("content-type")?.includes("application/json"), "public profile API content type");
check(profile?.ok === true && profile?.data?.name === "Mikel Echeverria", "public profile API payload");

const missingApiResponse = await request("/api/agent-readiness-probe-not-found", {
  headers: { Accept: "application/json" },
});
const missingApi = await missingApiResponse.json();
check(missingApiResponse.status === 404, "missing API route returns 404", `HTTP ${missingApiResponse.status}`);
check(missingApiResponse.headers.get("content-type")?.includes("application/json"), "missing API route content type");
check(
  missingApi?.ok === false && missingApi?.error?.code === "not_found" && Boolean(missingApi?.error?.hint),
  "missing API route structured error",
);

for (const path of [
  "/llms.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/about",
  "/contact",
  "/privacy",
  "/developers",
  "/index.md",
  "/about.md",
  "/contact.md",
  "/privacy.md",
  "/developers.md",
  "/openapi.json",
  "/api/profile",
]) {
  const response = await request(path);
  check(response.status === 200, `public endpoint ${path}`, `HTTP ${response.status}`);
}

if (failures > 0) {
  console.error(`\n${failures} agent-readiness verification(s) failed for ${baseUrl}.`);
  process.exit(1);
}

console.log(`\nAll agent-readiness verifications passed for ${baseUrl}.`);
