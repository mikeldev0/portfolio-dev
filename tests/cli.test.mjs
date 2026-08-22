import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_BASE_URL, fetchJson, formatProfile, parseArgs } from "../cli/lib.mjs";

test("argument parsing stays minimal and forgiving", () => {
  assert.deepEqual(parseArgs([]), { command: "help", baseUrl: DEFAULT_BASE_URL, json: false });
  assert.equal(parseArgs(["profile"]).command, "profile");
  assert.equal(parseArgs(["--json", "openapi"]).json, true);
  assert.equal(parseArgs(["-h"]).command, "help");
});

test("fetchJson joins URLs, unwraps envelopes and surfaces API errors", async () => {
  let capturedUrl = "";
  const data = await fetchJson("https://example.com///", "/api/v1/profile", async (url) => {
    capturedUrl = url;
    return Response.json({ ok: true, data: { name: "Mikel Echeverria" } });
  });
  assert.equal(capturedUrl, "https://example.com/api/v1/profile");
  assert.deepEqual(data, { name: "Mikel Echeverria" });

  await assert.rejects(
    fetchJson("https://example.com", "/api/v1/profile", async () =>
      Response.json(
        {
          ok: false,
          error: { code: "rate_limit_exceeded", message: "Quota exhausted.", hint: "Wait 60 s." },
        },
        { status: 429 }
      )
    ),
    /HTTP 429 — Quota exhausted\. Wait 60 s\./
  );
});

test("formatProfile renders a compact human-readable card", () => {
  const text = formatProfile({
    name: "Mikel Echeverria",
    alternateName: "mikeldev",
    role: "Backend & Full Stack Engineer",
    location: { city: "Pamplona", region: "Navarra", country: "ES" },
    email: "mikel@mikeldev.com",
    url: "https://www.mikeldev.com/",
    resources: { github: "https://github.com/mikeldev0" },
  });

  assert.match(text, /Mikel Echeverria \(mikeldev\)/);
  assert.match(text, /Email: mikel@mikeldev\.com/);
  assert.match(text, /github: https:\/\/github\.com\/mikeldev0/);
});
