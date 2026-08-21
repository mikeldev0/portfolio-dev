import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  AGENT_GUIDE_PATH,
  AI_CATALOG_MEDIA_TYPE,
  AI_CATALOG_PATH,
  API_CATALOG_MEDIA_TYPE,
  API_CATALOG_PATH,
  REPOSITORY_INSTRUCTIONS_URL,
  agentGuideMarkdown,
  aiCatalogForOrigin,
  apiCatalogForOrigin,
} from "../src/lib/agent-discovery.mjs";
import { OPENAPI_MEDIA_TYPE, PROFILE_PATH } from "../src/lib/public-api.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("AI Catalog is valid, typed and resolves artifacts against the current host", () => {
  const catalog = aiCatalogForOrigin("https://preview.example/anything");
  assert.equal(AI_CATALOG_PATH, "/.well-known/ai-catalog.json");
  assert.equal(AI_CATALOG_MEDIA_TYPE, "application/ai-catalog+json");
  assert.equal(catalog.specVersion, "1.0");
  assert.equal(catalog.host.identifier, "mikeldev.com");
  assert.equal(catalog.host.documentationUrl, "https://preview.example/developers");
  assert.ok(catalog.entries.length >= 2);
  assert.ok(catalog.entries.every((entry) => /^urn:air:mikeldev\.com:/.test(entry.identifier)));
  assert.ok(catalog.entries.every((entry) => entry.url.startsWith("https://preview.example/")));
  assert.equal(catalog.entries[0].type, OPENAPI_MEDIA_TYPE);
});

test("RFC 9727 API catalog bookmarks the live endpoint and its descriptions", () => {
  const catalog = apiCatalogForOrigin("https://preview.example/openapi.json");
  assert.equal(API_CATALOG_PATH, "/.well-known/api-catalog");
  assert.match(API_CATALOG_MEDIA_TYPE, /application\/linkset\+json/);
  assert.match(API_CATALOG_MEDIA_TYPE, /rfc9727/);
  assert.equal(catalog.linkset[0].anchor, `https://preview.example${API_CATALOG_PATH}`);
  assert.equal(catalog.linkset[0].item[0].href, `https://preview.example${PROFILE_PATH}`);
  assert.equal(catalog.linkset[1].anchor, `https://preview.example${PROFILE_PATH}`);
  assert.equal(catalog.linkset[1]["service-desc"][0].href, "https://preview.example/openapi.json");
  assert.equal(catalog.linkset[1]["service-desc"][0].type, OPENAPI_MEDIA_TYPE);
});

test("agent guidance exposes only real portfolio capabilities and source instructions", () => {
  assert.equal(AGENT_GUIDE_PATH, "/agents.md");
  assert.ok(agentGuideMarkdown.length > 900);
  assert.match(agentGuideMarkdown, /GET \/api\/v1\/profile/);
  assert.match(agentGuideMarkdown, /No authentication is required/);
  assert.match(agentGuideMarkdown, /RateLimit-Policy/);
  assert.match(agentGuideMarkdown, /Do not automate bulk contact-form submissions/);
  assert.match(agentGuideMarkdown, new RegExp(REPOSITORY_INSTRUCTIONS_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("entry points link agents to standard discovery resources", async () => {
  const [middleware, llms, developers, openApiRoute, profileRoute] = await Promise.all([
    readFile(path.join(root, "src/middleware.ts"), "utf8"),
    readFile(path.join(root, "public/llms.txt"), "utf8"),
    readFile(path.join(root, "src/pages/developers.astro"), "utf8"),
    readFile(path.join(root, "src/pages/openapi.json.ts"), "utf8"),
    readFile(path.join(root, "src/pages/api/v1/profile.ts"), "utf8"),
  ]);

  for (const source of [middleware, llms, developers]) {
    assert.match(source, /\.well-known\/api-catalog/);
    assert.match(source, /agents\.md/);
  }
  assert.match(llms, /\.well-known\/ai-catalog\.json/);
  assert.match(llms, /AGENTS\.md/);
  assert.match(developers, /AGENTS\.md/);
  assert.match(openApiRoute, /OPENAPI_MEDIA_TYPE/);
  assert.match(openApiRoute, /api-catalog/);
  assert.match(profileRoute, /api-catalog/);
});
