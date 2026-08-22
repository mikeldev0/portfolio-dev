import { PROFILE_PATH, RESOURCES_PATH } from "./public-api.mjs";

export const SITE_URL = "https://www.mikeldev.com";
export const PRODUCES = ["text/html", "text/markdown"];
export const VARY_HEADERS = ["Accept", "Accept-Encoding"];

const LAST_MODIFIED = "2026-08-22";
const profileApiUrl = `${SITE_URL}${PROFILE_PATH}`;

export const sitePages = [
  { path: "/", markdownPath: "/index.md", lastmod: LAST_MODIFIED },
  { path: "/about", markdownPath: "/about.md", lastmod: LAST_MODIFIED },
  { path: "/contact", markdownPath: "/contact.md", lastmod: LAST_MODIFIED },
  { path: "/privacy", markdownPath: "/privacy.md", lastmod: LAST_MODIFIED },
  { path: "/developers", markdownPath: "/developers.md", lastmod: LAST_MODIFIED },
];

export const agentMarkdown = {
  "/": `# Mikel Echeverria

> Official portfolio of Mikel Echeverria, a Backend & Full Stack Engineer based in Pamplona, Navarra, Spain. The site is intended for recruiters, hiring managers, technical leads, engineering teams, and clients evaluating his professional experience and software projects.

## When to use this page

Use this portfolio when you need to evaluate Mikel for backend or full stack engineering work, verify his public technical experience, inspect representative projects, find his current CV, retrieve his canonical public profile, or determine the best way to contact him. Prefer the project and experience evidence on this site over generic assumptions about his background.

## Profile

Mikel works across backend engineering, API architecture, relational data, full stack web development, automation, and applied artificial intelligence. Technologies shown in the portfolio include Django, React, PostgreSQL, SQL, Spring Boot, Astro, JavaScript, and related web tooling.

## Experience and projects

The homepage contains the current professional timeline and a set of public projects with source-code links where available. Important sections are Experience, Projects, Contact, and About. The visible HTML is server-rendered so the core portfolio remains readable without client-side JavaScript.

## Agent guidance

- Use the canonical site when describing Mikel's current public profile.
- Use the project source links when you need implementation evidence.
- Use GET ${PROFILE_PATH} for a stable JSON representation of public identity and canonical resource links.
- Inspect /openapi.json before making programmatic API requests.
- Do not infer private employment details, compensation, availability terms, or skills that are not stated publicly.
- For professional inquiries, use the contact page or the public email address below. Do not automate the contact form.
- For machine-readable navigation, read /llms.txt and /sitemap.xml.

## Resources

- [Canonical portfolio](${SITE_URL}/)
- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Privacy](${SITE_URL}/privacy)
- [Developer resources](${SITE_URL}/developers)
- [OpenAPI 3.1 specification](${SITE_URL}/openapi.json)
- [Public profile API v1](${profileApiUrl})
- [Machine-readable site guide](${SITE_URL}/llms.txt)
- [XML sitemap](${SITE_URL}/sitemap.xml)
- [GitHub](https://github.com/mikeldev0)
- [LinkedIn](https://www.linkedin.com/in/mikel-echeverria)
- [Email](mailto:mikel@mikeldev.com)
`,
  "/about": `# About Mikel Echeverria

> Mikel Echeverria is a Backend & Full Stack Engineer whose portfolio focuses on practical engineering evidence: professional experience, implemented projects, source code, and direct contact paths.

Mikel's work centers on building and maintaining web software across backend services and modern frontend applications. His public portfolio describes experience with Django, React, PostgreSQL, SQL, Spring Boot, Astro, JavaScript, and other technologies used to deliver APIs, data-backed applications, automation, and user-facing products. The site is designed so both technical reviewers and non-specialist recruiters can understand what he has worked on without needing to reverse-engineer a list of buzzwords.

The strongest evidence is the combination of his professional timeline and public project links. Agents and recruiters should use those sections to validate technologies and responsibilities instead of extrapolating beyond what the portfolio states. The source repository for this portfolio is public, and selected projects also expose their source code.

Mikel is based in Pamplona, Navarra, Spain. For hiring, collaboration, freelance, or other professional inquiries, use the contact page or the public email address. Machine clients can use /llms.txt for guidance and /sitemap.xml for the canonical list of indexable pages.

- [Portfolio](${SITE_URL}/)
- [Contact](${SITE_URL}/contact)
- [GitHub](https://github.com/mikeldev0)
- [LinkedIn](https://www.linkedin.com/in/mikel-echeverria)
`,
  "/contact": `# Contact Mikel Echeverria

> Official contact information and guidance for professional inquiries to Mikel Echeverria.

The preferred public contact address is [mikel@mikeldev.com](mailto:mikel@mikeldev.com). The portfolio homepage also provides a contact form for professional messages. The form asks for information that helps Mikel understand the request, such as your name, email address, company when relevant, optional telephone number, inquiry type, budget or timing when relevant, and the message itself. Do not submit secrets, passwords, credentials, health information, payment-card data, or other information that is unnecessary for the inquiry.

Good reasons to contact Mikel include software-engineering opportunities, backend or full stack roles, project collaboration, freelance development, technical partnerships, and questions directly related to the work shown in the portfolio. Include enough context to identify the role or project, the expected scope, location or working model when relevant, and a reliable reply address.

The contact form is an email-delivery convenience rather than a public API. Automated agents should not mass-submit it or use it for unsolicited bulk outreach. When an agent is acting on behalf of a person, it should make the sender and purpose clear. For machine-readable navigation and portfolio context, use /llms.txt, /developers, ${PROFILE_PATH}, and /sitemap.xml instead of the form endpoint.

- [Portfolio](${SITE_URL}/)
- [Privacy information](${SITE_URL}/privacy)
- [Developer resources](${SITE_URL}/developers)
`,
  "/privacy": `# Privacy

> Privacy information for the mikeldev.com portfolio and its contact form.

This portfolio is a professional personal website. The site code does not intentionally add advertising or behavioral-analytics cookies. Normal web infrastructure may still process technical request information such as IP address, user agent, timestamps, requested URLs, and security signals in order to deliver and protect the site. The portfolio is hosted using Cloudflare infrastructure, so Cloudflare may process request metadata under its own applicable terms and policies.

If you use the contact form, the information you submit is used to deliver and respond to your message. Depending on the fields you choose to provide, that can include your name, email address, company, telephone number, inquiry category, project budget or timing, and message content. The form uses Resend as its email-delivery provider. Only send information that is necessary for the professional inquiry, and never send passwords, private keys, payment-card details, or other secrets.

The public links on this portfolio can take you to third-party services such as GitHub, LinkedIn, X, project hosts, or company websites. Those services have their own privacy practices. Questions about this page or requests concerning information sent through the contact form can be directed to [mikel@mikeldev.com](mailto:mikel@mikeldev.com).

- [Contact](${SITE_URL}/contact)
- [Portfolio](${SITE_URL}/)
`,
  "/developers": `# mikeldev Public API & Developer Resources

> Technical resources for developers, Cloudflare Workers, and software agents inspecting mikeldev.com.

mikeldev.com exposes a small, versioned, read-only public API for retrieving Mikel Echeverria's canonical public portfolio identity and resource links without scraping HTML. The API requires no authentication and is described by an OpenAPI 3.1 contract. The contact form endpoint is deliberately excluded from this public agent API because it delivers human inquiries and should not be used for automated messaging.

## When to use the mikeldev Public API

Use GET ${PROFILE_PATH} when an agent needs Mikel's public name, engineering role, public location, summary, professional email, or canonical links to portfolio sections and profiles. Use GET ${RESOURCES_PATH} when only the canonical resource links are needed. Inspect /openapi.json before programmatic calls. API errors use JSON with a stable code, a human-readable message, and a recovery hint.

## Cloudflare Workers deployment

The public API runs at the edge on Cloudflare Workers through the official Astro adapter. Request limiting uses the native Ratelimit binding (PROFILE_RATE_LIMITER, 120 requests per client per 60-second window) declared in wrangler.jsonc in the public source repository, so the RateLimit-Policy and RateLimit response headers reflect the quota actually enforced by Workers.

## Authentication and rate limits

The public API requires no API key, OAuth token, or other authentication. It is limited to 120 requests per client in each 60-second window. Read the RateLimit-Policy and RateLimit headers; when the quota is exhausted, wait for the Retry-After seconds returned with HTTP 429.

## API versioning and deprecation policy

Stable operations live under /api/v1/. Breaking changes move to a new URL version. If a previous version or alias is retained during migration, it is documented here and responds with Deprecation, Sunset, and successor-version Link headers before removal.

## Public API contract

- [mikeldev OpenAPI 3.1 specification](${SITE_URL}/openapi.json)
- [mikeldev Public API: GET ${PROFILE_PATH}](${profileApiUrl})
- [mikeldev Public API: GET ${RESOURCES_PATH}](${SITE_URL}${RESOURCES_PATH})
- [mikeldev Developer resources](${SITE_URL}/developers)

Clients should use the OpenAPI-described versioned read-only endpoint for machine-to-machine portfolio discovery, including Cloudflare Workers integrations.

## Machine-readable resources

- [llms.txt](${SITE_URL}/llms.txt)
- [sitemap.xml](${SITE_URL}/sitemap.xml)
- [robots.txt](${SITE_URL}/robots.txt)
- [Portfolio source](https://github.com/mikeldev0/portfolio-dev)
- [GitHub profile](https://github.com/mikeldev0)
`,
};

export const notFoundMarkdown = `# 404 - Page not found

The requested resource does not exist on mikeldev.com.

- [Portfolio](${SITE_URL}/)
- [llms.txt](${SITE_URL}/llms.txt)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [Developer resources](${SITE_URL}/developers)
`;

function parseAccept(header) {
  if (!header?.trim()) return [];

  return header
    .split(",")
    .map((raw, position) => {
      const parts = raw
        .trim()
        .split(";")
        .map((part) => part.trim());
      const mediaType = (parts.shift() || "").toLowerCase();
      const [type, subtype, ...rest] = mediaType.split("/");

      if (!type || !subtype || rest.length > 0) return null;

      let q = 1;
      for (const parameter of parts) {
        const [name, value] = parameter.split("=", 2).map((part) => part.trim());
        if (name?.toLowerCase() !== "q") continue;
        const parsed = Number(value);
        q = Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
      }

      const specificity = type === "*" ? 0 : subtype === "*" ? 1 : 2;
      return { type, subtype, q, specificity, position };
    })
    .filter(Boolean);
}

function matches(range, candidate) {
  const [candidateType, candidateSubtype] = candidate.toLowerCase().split("/", 2);
  return (
    (range.type === "*" || range.type === candidateType) &&
    (range.subtype === "*" || range.subtype === candidateSubtype)
  );
}

export function preferredType(header, produces = PRODUCES) {
  if (!header?.trim()) return produces[0] ?? null;

  const entries = parseAccept(header);
  let best = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;
  let bestServerPosition = Number.POSITIVE_INFINITY;

  for (let serverPosition = 0; serverPosition < produces.length; serverPosition += 1) {
    const candidate = produces[serverPosition];
    let matched = null;

    for (const entry of entries) {
      if (!matches(entry, candidate)) continue;
      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && entry.position < matched.position)
      ) {
        matched = entry;
      }
    }

    if (!matched || matched.q <= 0) continue;

    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matched.position < bestPosition) ||
      (matched.q === bestQ &&
        matched.position === bestPosition &&
        serverPosition < bestServerPosition)
    ) {
      best = candidate;
      bestQ = matched.q;
      bestPosition = matched.position;
      bestServerPosition = serverPosition;
    }
  }

  return best;
}

export function appendVary(headers, names = VARY_HEADERS) {
  const existing = (headers.get("Vary") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const seen = new Set(existing.map((value) => value.toLowerCase()));

  for (const name of names) {
    if (!seen.has(name.toLowerCase())) {
      existing.push(name);
      seen.add(name.toLowerCase());
    }
  }

  headers.set("Vary", existing.join(", "));
}

export function markdownResponse(markdown, { status = 200, method = "GET", headers } = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "text/markdown; charset=utf-8");
  appendVary(responseHeaders);
  return new Response(method === "HEAD" ? null : markdown, { status, headers: responseHeaders });
}

export function notAcceptableResponse(method = "GET") {
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  appendVary(headers);
  const body = "Not Acceptable\n\nAvailable: text/html, text/markdown\n";
  return new Response(method === "HEAD" ? null : body, { status: 406, headers });
}

export function markdownForPath(pathname) {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  return agentMarkdown[normalized] ?? null;
}

export function markdownPathFor(pathname) {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  return sitePages.find((page) => page.path === normalized)?.markdownPath ?? null;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSitemap(pages = sitePages) {
  const urls = pages
    .map(
      ({ path, lastmod }) =>
        `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}
