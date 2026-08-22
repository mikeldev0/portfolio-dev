import { OPENAPI_MEDIA_TYPE, PROFILE_PATH, RESOURCES_PATH } from "./public-api.mjs";

export const AGENT_GUIDE_PATH = "/agents.md";
export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json";
export const API_CATALOG_PATH = "/.well-known/api-catalog";
export const AI_CATALOG_MEDIA_TYPE = "application/ai-catalog+json";
export const API_CATALOG_MEDIA_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
export const REPOSITORY_INSTRUCTIONS_URL =
  "https://github.com/mikeldev0/portfolio-dev/blob/main/AGENTS.md";

function originFor(value) {
  return new URL(value).origin;
}

export function aiCatalogForOrigin(value) {
  const origin = originFor(value);
  return {
    specVersion: "1.0",
    host: {
      displayName: "mikeldev",
      identifier: "mikeldev.com",
      documentationUrl: `${origin}/developers`,
    },
    entries: [
      {
        identifier: "urn:air:mikeldev.com:api:portfolio-profile",
        displayName: "mikeldev Portfolio API",
        type: OPENAPI_MEDIA_TYPE,
        url: `${origin}/openapi.json`,
        description:
          "OpenAPI 3.1 contract for the versioned, read-only public portfolio profile API.",
        tags: ["portfolio", "profile", "openapi", "developer"],
      },
      {
        identifier: "urn:air:mikeldev.com:docs:agent-guidance",
        displayName: "mikeldev Agent Guidance",
        type: "text/markdown",
        url: `${origin}${AGENT_GUIDE_PATH}`,
        description:
          "Machine-readable guidance for agents evaluating or integrating with the public portfolio.",
        tags: ["portfolio", "agents", "documentation"],
      },
    ],
  };
}

export function apiCatalogForOrigin(value) {
  const origin = originFor(value);
  return {
    linkset: [
      {
        anchor: `${origin}${API_CATALOG_PATH}`,
        item: [{ href: `${origin}${PROFILE_PATH}` }, { href: `${origin}${RESOURCES_PATH}` }],
      },
      {
        anchor: `${origin}${PROFILE_PATH}`,
        "service-desc": [
          {
            href: `${origin}/openapi.json`,
            type: OPENAPI_MEDIA_TYPE,
          },
        ],
        "service-doc": [
          {
            href: `${origin}/developers`,
            type: "text/html",
          },
        ],
      },
      {
        anchor: `${origin}${RESOURCES_PATH}`,
        "service-desc": [
          {
            href: `${origin}/openapi.json`,
            type: OPENAPI_MEDIA_TYPE,
          },
        ],
      },
    ],
  };
}

export const agentGuideMarkdown = `# mikeldev Agent Guidance

> Machine-readable guidance for software agents using mikeldev.com, the official portfolio of Mikel Echeverria.

## Preferred machine interfaces

- Read /llms.txt for the site map and evidence-selection guidance.
- Use GET /api/v1/profile for the canonical public professional identity and resource links. No authentication is required.
- Use GET /api/v1/resources for only the canonical portfolio and social resource links. No authentication is required.
- Inspect /openapi.json before programmatic API calls.
- Discover the public API through /.well-known/api-catalog (RFC 9727).
- Discover machine-oriented artifacts through /.well-known/ai-catalog.json.
- Use Markdown page representations when you need content without presentation markup.

## Safe use

Treat the portfolio as public professional evidence. Do not infer private employment details, compensation, availability, credentials, or skills that are not stated publicly. The contact form is for human professional inquiries and is deliberately excluded from the public agent API. Do not automate bulk contact-form submissions.

The public profile API is read-only and rate-limited. Respect RateLimit-Policy and Retry-After response headers. API errors are JSON objects with stable machine-readable codes and recovery hints.

## Developer and source resources

- Developer documentation: /developers
- OpenAPI 3.1: /openapi.json
- Public profile API: /api/v1/profile
- API catalog: /.well-known/api-catalog
- AI catalog: /.well-known/ai-catalog.json
- Sitemap: /sitemap.xml
- Repository: https://github.com/mikeldev0/portfolio-dev
- Repository agent instructions: ${REPOSITORY_INSTRUCTIONS_URL}
`;
