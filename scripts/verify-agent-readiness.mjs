const baseUrl = (process.env.BASE_URL || "https://www.mikeldev.com").replace(/\/$/, "");
const crawlerUserAgents = ["ChatGPT-User", "ClaudeBot", "Google-Extended", "ora-agent", "DeepSeekBot"];
const profilePath = "/api/v1/profile";
const apiCatalogPath = "/.well-known/api-catalog";
const aiCatalogPath = "/.well-known/ai-catalog.json";

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
  check(response.status === 200 && body.includes("Mikel Echeverria"), `crawler reachability ${userAgent}`, `HTTP ${response.status}`);
}

const htmlResponse = await request("/", { headers: { Accept: "text/html" } });
const html = await htmlResponse.text();
const rawText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
check(htmlResponse.status === 200, "HTML homepage status", `HTTP ${htmlResponse.status}`);
check(htmlResponse.headers.get("content-type")?.includes("text/html"), "HTML content type");
check((htmlResponse.headers.get("vary") || "").toLowerCase().includes("accept"), "HTML Vary includes Accept");
check(/<h1[\s>]/i.test(html), "raw HTML contains H1");
check(rawText.length >= 500, "raw HTML contains at least 500 text characters", `${rawText.length} chars`);
check((htmlResponse.headers.get("link") || "").includes("service-desc"), "HTML advertises OpenAPI service description");
check((htmlResponse.headers.get("link") || "").includes("api-catalog"), "HTML advertises RFC 9727 API catalog");

const markdownResponse = await request("/", { headers: { Accept: "text/markdown" } });
const markdown = await markdownResponse.text();
check(markdownResponse.status === 200, "Markdown homepage status", `HTTP ${markdownResponse.status}`);
check(markdownResponse.headers.get("content-type")?.includes("text/markdown"), "Markdown content type");
check((markdownResponse.headers.get("vary") || "").toLowerCase().includes("accept"), "Markdown Vary includes Accept");
check(markdown.startsWith("# Mikel Echeverria"), "Markdown homepage body");

const rejected = await request("/", { headers: { Accept: "application/pdf" } });
check(rejected.status === 406, "unsupported representation returns 406", `HTTP ${rejected.status}`);

const missingHtml = await request("/agent-readiness-probe-not-found", { headers: { Accept: "text/html" } });
check(missingHtml.status === 404, "HTML missing path returns 404", `HTTP ${missingHtml.status}`);

const missingMarkdown = await request("/agent-readiness-probe-not-found", { headers: { Accept: "text/markdown" } });
const missingBody = await missingMarkdown.text();
check(missingMarkdown.status === 404, "Markdown missing path returns 404", `HTTP ${missingMarkdown.status}`);
check(missingMarkdown.headers.get("content-type")?.includes("text/markdown"), "Markdown 404 content type");
check(/llms\.txt/.test(missingBody) && /sitemap\.xml/.test(missingBody), "Markdown 404 recovery links");

const openApiResponse = await request("/openapi.json", { headers: { Accept: "application/json" } });
const openApi = await openApiResponse.json();
check(openApiResponse.status === 200, "OpenAPI status", `HTTP ${openApiResponse.status}`);
check(openApiResponse.headers.get("content-type")?.includes("application/vnd.oai.openapi+json"), "OpenAPI media type");
check(openApi.openapi === "3.1.0", "OpenAPI version");
check(openApi.servers?.[0]?.url === new URL(baseUrl).origin, "OpenAPI resolves operations against current host");
check(Boolean(openApi.paths?.[profilePath]?.get?.operationId), "OpenAPI versioned profile operationId");
check(openApi.paths?.[profilePath]?.get?.responses?.["200"]?.content?.["application/json"]?.schema?.type === "object", "OpenAPI operation declares typed response schema");
check(openApi.paths?.[profilePath]?.get?.responses?.["429"]?.content?.["application/json"]?.schema?.type === "object", "OpenAPI documents typed rate-limit error");
check(openApi.paths?.[profilePath]?.get?.["x-ai-function"]?.parameters?.type === "object", "OpenAPI operation exposes function-calling descriptor");

const apiCatalogResponse = await request(apiCatalogPath, { headers: { Accept: "application/linkset+json" } });
const apiCatalog = await apiCatalogResponse.json();
check(apiCatalogResponse.status === 200, "RFC 9727 API catalog status", `HTTP ${apiCatalogResponse.status}`);
check(apiCatalogResponse.headers.get("content-type")?.includes("application/linkset+json"), "RFC 9727 API catalog media type");
check(apiCatalogResponse.headers.get("content-type")?.includes("rfc9727"), "RFC 9727 API catalog profile");
check(apiCatalog?.linkset?.[0]?.item?.some((item) => item.href === `${new URL(baseUrl).origin}${profilePath}`), "RFC 9727 API catalog exposes profile endpoint");

const aiCatalogResponse = await request(aiCatalogPath, { headers: { Accept: "application/ai-catalog+json" } });
const aiCatalog = await aiCatalogResponse.json();
check(aiCatalogResponse.status === 200, "AI Catalog status", `HTTP ${aiCatalogResponse.status}`);
check(aiCatalogResponse.headers.get("content-type")?.includes("application/ai-catalog+json"), "AI Catalog media type");
check(aiCatalog?.specVersion === "1.0", "AI Catalog spec version");
check(aiCatalog?.entries?.every((entry) => /^urn:air:mikeldev\.com:/.test(entry.identifier)), "AI Catalog domain-anchored entry identifiers");
check(aiCatalog?.entries?.every((entry) => entry.url.startsWith(`${new URL(baseUrl).origin}/`)), "AI Catalog resolves artifacts against current host");

const agentGuideResponse = await request("/agents.md", { headers: { Accept: "text/markdown" } });
const agentGuide = await agentGuideResponse.text();
check(agentGuideResponse.status === 200, "agent discovery file status", `HTTP ${agentGuideResponse.status}`);
check(agentGuideResponse.headers.get("content-type")?.includes("text/markdown"), "agent discovery file media type");
check(agentGuide.includes("GET /api/v1/profile") && agentGuide.includes("/.well-known/api-catalog"), "agent discovery file guidance");

const profileResponse = await request(profilePath, { headers: { Accept: "application/json" } });
const profile = await profileResponse.json();
check(profileResponse.status === 200, "public profile API status", `HTTP ${profileResponse.status}`);
check(profileResponse.headers.get("content-type")?.includes("application/json"), "public profile API content type");
check(Boolean(profileResponse.headers.get("ratelimit-policy")), "public profile API advertises RateLimit-Policy");
check(/^"profile";r=\d+;t=60$/.test(profileResponse.headers.get("ratelimit") || ""), "public profile API advertises RFC RateLimit header");
check(profileResponse.headers.get("x-ratelimit-limit") === "120", "public profile API advertises compatibility quota");
check((profileResponse.headers.get("link") || "").includes("api-catalog"), "public profile API advertises API catalog");
check(profile?.ok === true && profile?.data?.name === "Mikel Echeverria", "public profile API payload");

const legacyResponse = await fetch(`${baseUrl}/api/profile`, { redirect: "manual" });
check(legacyResponse.status === 308, "legacy API route redirects permanently", `HTTP ${legacyResponse.status}`);
check(/^@\d+$/.test(legacyResponse.headers.get("deprecation") || ""), "legacy API route signals RFC deprecation date");
check(Boolean(legacyResponse.headers.get("sunset")), "legacy API route signals sunset date");

const missingApiResponse = await request("/api/v1/agent-readiness-probe-not-found", { headers: { Accept: "application/json" } });
const missingApi = await missingApiResponse.json();
check(missingApiResponse.status === 404, "missing API route returns 404", `HTTP ${missingApiResponse.status}`);
check(missingApiResponse.headers.get("content-type")?.includes("application/json"), "missing API route content type");
check(missingApi?.ok === false && missingApi?.error?.code === "not_found" && Boolean(missingApi?.error?.hint), "missing API route structured error");

for (const path of ["/llms.txt", "/robots.txt", "/sitemap.xml", "/about", "/contact", "/privacy", "/developers", "/agents.md", "/index.md", "/about.md", "/contact.md", "/privacy.md", "/developers.md", "/openapi.json", apiCatalogPath, aiCatalogPath, profilePath]) {
  const response = await request(path);
  check(response.status === 200, `public endpoint ${path}`, `HTTP ${response.status}`);
}

if (failures > 0) {
  console.error(`\n${failures} agent-readiness verification(s) failed for ${baseUrl}.`);
  process.exit(1);
}
console.log(`\nAll agent-readiness verifications passed for ${baseUrl}.`);
