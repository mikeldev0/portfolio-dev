import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  PROFILE_RATE_LIMIT,
  PROFILE_RATE_LIMIT_POLICY,
  PROFILE_RATE_LIMIT_WINDOW,
  profileRateLimitHeaders,
  profileRateLimitKey,
} from "../src/lib/api-rate-limit.mjs";
import {
  API_VERSION,
  PROFILE_PATH,
  apiErrorResponse,
  jsonResponse,
  openApiDocument,
  openApiDocumentForOrigin,
  publicProfile,
} from "../src/lib/public-api.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("public profile exposes only canonical public portfolio data", () => {
  assert.equal(API_VERSION, "v1");
  assert.equal(PROFILE_PATH, "/api/v1/profile");
  assert.equal(publicProfile.name, "Mikel Echeverria");
  assert.equal(publicProfile.alternateName, "mikeldev");
  assert.equal(publicProfile.url, "https://www.mikeldev.com/");
  assert.equal(publicProfile.resources.openapi, "https://www.mikeldev.com/openapi.json");
});

test("OpenAPI contract is versioned, typed, described and function-calling friendly", () => {
  assert.equal(openApiDocument.openapi, "3.1.0");
  assert.equal(openApiDocument.servers[0].url, "/");
  assert.match(openApiDocument.info.title, /mikeldev/i);
  assert.match(openApiDocument.info.description, /\/api\/v1\//);
  assert.match(openApiDocument.info.description, /Deprecation/);
  assert.match(openApiDocument.info.description, /Sunset/);

  const operations = Object.values(openApiDocument.paths).flatMap((pathItem) =>
    Object.values(pathItem).filter((operation) => operation && typeof operation === "object")
  );
  const operationIds = operations.map((operation) => operation.operationId).filter(Boolean);
  assert.equal(operationIds.length, operations.length);
  assert.equal(new Set(operationIds).size, operationIds.length);

  for (const operation of operations) {
    assert.ok(operation.description?.length > 30);
    assert.ok(Object.keys(operation.responses ?? {}).length > 0);
  }

  const profileGet = openApiDocument.paths[PROFILE_PATH].get;
  assert.equal(profileGet.operationId, "getPortfolioProfileV1");
  assert.equal(profileGet.responses["200"].content["application/json"].schema.type, "object");
  assert.equal(
    profileGet.responses["200"].content["application/json"].schema.properties.data.type,
    "object"
  );
  assert.equal(profileGet.responses["405"].content["application/json"].schema.type, "object");
  assert.equal(profileGet.responses["429"].content["application/json"].schema.type, "object");
  assert.equal(profileGet["x-ai-function"].parameters.type, "object");
  assert.deepEqual(profileGet["x-ai-function"].parameters.properties, {});
  assert.equal(openApiDocument.components.schemas.ProfileResponse.type, "object");
  assert.equal(openApiDocument.components.schemas.ProfileResponse.properties.data.type, "object");
  assert.equal(
    profileGet.responses["200"].headers["RateLimit-Policy"].schema.example,
    PROFILE_RATE_LIMIT_POLICY
  );
});

test("OpenAPI runtime document resolves endpoints against the current host", () => {
  const preview = openApiDocumentForOrigin("https://preview.example/openapi.json");
  assert.equal(preview.servers[0].url, "https://preview.example");
  assert.equal(preview.externalDocs.url, "https://preview.example/developers");
  assert.equal(preview.paths[PROFILE_PATH].get.operationId, "getPortfolioProfileV1");
});

test("profile rate-limit metadata matches the enforced Cloudflare quota", () => {
  assert.equal(PROFILE_RATE_LIMIT, 120);
  assert.equal(PROFILE_RATE_LIMIT_WINDOW, 60);
  assert.equal(PROFILE_RATE_LIMIT_POLICY, '"profile";q=120;w=60');
  assert.equal(
    profileRateLimitKey(
      new Request("https://example.com", { headers: { "CF-Connecting-IP": "203.0.113.7" } })
    ),
    "profile:203.0.113.7"
  );

  const normal = profileRateLimitHeaders();
  assert.equal(normal["RateLimit-Policy"], PROFILE_RATE_LIMIT_POLICY);
  assert.equal(normal.RateLimit, '"profile";r=120;t=60');
  assert.equal(normal["X-RateLimit-Limit"], "120");
  assert.equal(normal["X-RateLimit-Remaining"], "120");

  const limited = profileRateLimitHeaders({ limited: true });
  assert.equal(limited.RateLimit, '"profile";r=0;t=60');
  assert.equal(limited["Retry-After"], "60");
  assert.equal(limited["X-RateLimit-Remaining"], "0");
});

test("JSON API responses and errors are machine-readable and actionable", async () => {
  const success = jsonResponse({ ok: true }, { method: "GET" });
  assert.equal(success.status, 200);
  assert.match(success.headers.get("Content-Type"), /application\/json/);
  assert.equal(success.headers.get("Access-Control-Allow-Origin"), "*");
  assert.deepEqual(await success.json(), { ok: true });

  const error = apiErrorResponse({
    status: 404,
    code: "not_found",
    message: "Missing",
    hint: "Read /openapi.json",
  });
  assert.equal(error.status, 404);
  assert.equal(error.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await error.json(), {
    ok: false,
    error: { code: "not_found", message: "Missing", hint: "Read /openapi.json" },
  });
});

test("API and developer discovery are wired into public routes", async () => {
  const [
    profileRoute,
    legacyRoute,
    openApiRoute,
    middleware,
    layout,
    footer,
    developers,
    llms,
    wrangler,
  ] = await Promise.all([
    readFile(path.join(root, "src/pages/api/v1/profile.ts"), "utf8"),
    readFile(path.join(root, "src/pages/api/profile.ts"), "utf8"),
    readFile(path.join(root, "src/pages/openapi.json.ts"), "utf8"),
    readFile(path.join(root, "src/middleware.ts"), "utf8"),
    readFile(path.join(root, "src/layouts/Layout.astro"), "utf8"),
    readFile(path.join(root, "src/components/Footer.astro"), "utf8"),
    readFile(path.join(root, "src/pages/developers.astro"), "utf8"),
    readFile(path.join(root, "public/llms.txt"), "utf8"),
    readFile(path.join(root, "wrangler.jsonc"), "utf8"),
  ]);

  assert.match(profileRoute, /export const GET/);
  assert.match(profileRoute, /PROFILE_RATE_LIMITER/);
  assert.match(profileRoute, /rate_limit_exceeded/);
  assert.match(profileRoute, /method_not_allowed/);
  assert.match(legacyRoute, /Deprecation: "@\d+"/);
  assert.match(legacyRoute, /Sunset/);
  assert.match(openApiRoute, /openApiDocumentForOrigin/);
  assert.match(openApiRoute, /new URL\(request\.url\)\.origin/);
  assert.match(middleware, /apiNotFound/);
  assert.match(middleware, /service-desc/);
  assert.match(layout, /rel="service-desc"/);
  assert.match(footer, /href="\/developers"/);
  assert.match(developers, /GET \/api\/v1\/profile/);
  assert.match(developers, /RateLimit-Policy/);
  assert.match(developers, /Retry-After/);
  assert.match(developers, /Deprecation/);
  assert.match(developers, /Sunset/);
  assert.doesNotMatch(developers, /MCP/i);
  assert.match(llms, /## When to use this site/);
  assert.match(llms, /\/openapi\.json/);
  assert.match(llms, /\/api\/v1\/profile/);
  assert.doesNotMatch(llms, /MCP/i);
  assert.match(wrangler, /PROFILE_RATE_LIMITER/);
  assert.match(wrangler, /"limit": 120/);
  assert.match(wrangler, /"period": 60/);
});
