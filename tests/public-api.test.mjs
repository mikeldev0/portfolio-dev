import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  API_VERSION,
  PROFILE_PATH,
  apiErrorResponse,
  jsonResponse,
  openApiDocument,
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
  assert.equal(profileGet.responses["200"].content["application/json"].schema.properties.data.type, "object");
  assert.equal(
    profileGet.responses["405"].content["application/json"].schema.$ref,
    "#/components/schemas/ErrorResponse"
  );
});

test("JSON API responses and errors are machine-readable and actionable", async () => {
  const success = jsonResponse({ ok: true }, { method: "GET" });
  assert.equal(success.status, 200);
  assert.match(success.headers.get("Content-Type"), /application\/json/);
  assert.equal(success.headers.get("Access-Control-Allow-Origin"), "*");
  assert.deepEqual(await success.json(), { ok: true });

  const error = apiErrorResponse({ status: 404, code: "not_found", message: "Missing", hint: "Read /openapi.json" });
  assert.equal(error.status, 404);
  assert.equal(error.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await error.json(), { ok: false, error: { code: "not_found", message: "Missing", hint: "Read /openapi.json" } });
});

test("API and developer discovery are wired into public routes", async () => {
  const [profileRoute, legacyRoute, openApiRoute, middleware, layout, footer, developers, llms] = await Promise.all([
    readFile(path.join(root, "src/pages/api/v1/profile.ts"), "utf8"),
    readFile(path.join(root, "src/pages/api/profile.ts"), "utf8"),
    readFile(path.join(root, "src/pages/openapi.json.ts"), "utf8"),
    readFile(path.join(root, "src/middleware.ts"), "utf8"),
    readFile(path.join(root, "src/layouts/Layout.astro"), "utf8"),
    readFile(path.join(root, "src/components/Footer.astro"), "utf8"),
    readFile(path.join(root, "src/pages/developers.astro"), "utf8"),
    readFile(path.join(root, "public/llms.txt"), "utf8"),
  ]);

  assert.match(profileRoute, /export const GET/);
  assert.match(profileRoute, /method_not_allowed/);
  assert.match(legacyRoute, /Deprecation: "@\d+"/);
  assert.match(legacyRoute, /Sunset/);
  assert.match(openApiRoute, /openApiDocument/);
  assert.match(middleware, /apiNotFound/);
  assert.match(middleware, /service-desc/);
  assert.match(layout, /rel="service-desc"/);
  assert.match(footer, /href="\/developers"/);
  assert.match(developers, /GET \/api\/v1\/profile/);
  assert.match(developers, /Deprecation/);
  assert.match(developers, /Sunset/);
  assert.doesNotMatch(developers, /MCP/i);
  assert.match(llms, /## When to use this site/);
  assert.match(llms, /\/openapi\.json/);
  assert.match(llms, /\/api\/v1\/profile/);
  assert.doesNotMatch(llms, /MCP/i);
});
