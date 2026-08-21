import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  agentMarkdown,
  appendVary,
  buildSitemap,
  markdownForPath,
  markdownPathFor,
  markdownResponse,
  notAcceptableResponse,
  preferredType,
  sitePages,
} from "../src/lib/agent-readiness.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("content negotiation honors media-type preference and q-values", () => {
  assert.equal(preferredType(null), "text/html");
  assert.equal(preferredType("*/*"), "text/html");
  assert.equal(preferredType("text/markdown"), "text/markdown");
  assert.equal(preferredType("text/html, text/markdown;q=0.8"), "text/html");
  assert.equal(preferredType("text/markdown, text/html;q=0.8"), "text/markdown");
  assert.equal(preferredType("text/markdown;q=0, */*;q=1"), "text/html");
  assert.equal(preferredType("text/html;q=0, text/markdown;q=0"), null);
  assert.equal(preferredType("application/pdf"), null);
});

test("Vary preserves existing values and adds negotiation/cache dimensions once", () => {
  const headers = new Headers({ Vary: "Origin, Accept-Encoding" });
  appendVary(headers);
  appendVary(headers);
  assert.equal(headers.get("Vary"), "Origin, Accept-Encoding, Accept");
});

test("Markdown and 406 responses expose protocol-correct status and headers", async () => {
  const markdown = markdownResponse("# Hello", { status: 404 });
  assert.equal(markdown.status, 404);
  assert.equal(markdown.headers.get("Content-Type"), "text/markdown; charset=utf-8");
  assert.equal(markdown.headers.get("Vary"), "Accept, Accept-Encoding");
  assert.equal(await markdown.text(), "# Hello");

  const head = markdownResponse("# Hello", { method: "HEAD" });
  assert.equal(await head.text(), "");

  const unacceptable = notAcceptableResponse();
  assert.equal(unacceptable.status, 406);
  assert.match(await unacceptable.text(), /Available: text\/html, text\/markdown/);
});

test("every canonical content page has a substantial Markdown representation and sibling", () => {
  for (const page of sitePages) {
    const markdown = markdownForPath(page.path);
    assert.ok(markdown, `${page.path} is missing Markdown`);
    assert.ok(markdown.startsWith("# "), `${page.path} needs an H1`);
    assert.ok(markdown.length >= 500, `${page.path} Markdown is too thin`);
    assert.equal(markdownPathFor(page.path), page.markdownPath);
  }

  assert.equal(Object.keys(agentMarkdown).length, sitePages.length);
});

test("sitemap contains every indexable canonical URL with lastmod", () => {
  const sitemap = buildSitemap();
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);

  for (const page of sitePages) {
    assert.ok(sitemap.includes(`<loc>https://www.mikeldev.com${page.path}</loc>`));
    assert.ok(sitemap.includes(`<lastmod>${page.lastmod}</lastmod>`));
  }
});

test("llms.txt follows the v2 shape and points agents at Markdown resources", async () => {
  const llms = await readFile(path.join(root, "public/llms.txt"), "utf8");
  const lines = llms.split(/\r?\n/);
  assert.match(lines[0], /^# [^#]/);
  assert.ok(lines.some((line) => line.startsWith("> ")), "llms.txt needs a summary blockquote");
  assert.match(llms, /## Core profile/);
  assert.match(llms, /https:\/\/www\.mikeldev\.com\/index\.md/);
  assert.match(llms, /## Developer resources/);
  assert.match(llms, /when evaluating Mikel/i);
});

test("robots.txt explicitly allows the audited and major agent crawler tokens", async () => {
  const robots = await readFile(path.join(root, "public/robots.txt"), "utf8");
  for (const agent of [
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "Google-Extended",
    "DeepSeekBot",
    "ora-agent",
  ]) {
    assert.match(robots, new RegExp(`User-agent: ${agent.replace("-", "\\-")}\\nAllow: /`));
  }
  assert.match(robots, /Sitemap: https:\/\/www\.mikeldev\.com\/sitemap\.xml/);
});

test("trust anchors and developer resources are real server-rendered routes", async () => {
  for (const route of ["about", "contact", "privacy", "developers"]) {
    const source = await readFile(path.join(root, `src/pages/${route}.astro`), "utf8");
    assert.match(source, /<h1/);
    assert.ok(source.length > 1500, `${route}.astro is unexpectedly thin`);
    assert.match(source, new RegExp(`canonicalPath="/${route}"`));
    assert.match(source, new RegExp(`markdownPath="/${route}\\.md"`));
  }
});

test("custom 404 keeps a real 404 status and points crawlers to recovery resources", async () => {
  const source = await readFile(path.join(root, "src/pages/404.astro"), "utf8");
  assert.match(source, /Astro\.response\.status = 404/);
  assert.match(source, /robots="noindex, follow"/);
  assert.match(source, /href="\/llms\.txt"/);
  assert.match(source, /href="\/sitemap\.xml"/);
});

test("layout exposes canonical metadata, Markdown discovery and complete identity schema", async () => {
  const layout = await readFile(path.join(root, "src/layouts/Layout.astro"), "utf8");
  assert.match(layout, /<html lang="es"/);
  assert.match(layout, /rel="canonical"/);
  assert.match(layout, /rel="alternate" type="text\/markdown"/);
  assert.match(layout, /rel="describedby" href="\/llms\.txt"/);
  assert.match(layout, /property="og:image"/);
  assert.match(layout, /property="og:type"/);
  assert.match(layout, /"@type": "Organization"/);
  assert.match(layout, /contactPoint/);
  assert.match(layout, /"@type": "PostalAddress"/);
  assert.match(layout, /"@type": "Person"/);
  assert.match(layout, /"@type": "WebSite"/);
});
