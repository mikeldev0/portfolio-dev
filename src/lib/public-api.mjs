import {
  PROFILE_RATE_LIMIT,
  PROFILE_RATE_LIMIT_POLICY,
  PROFILE_RATE_LIMIT_WINDOW,
} from "./api-rate-limit.mjs";

export const OPENAPI_MEDIA_TYPE = "application/vnd.oai.openapi+json;version=3.1";
export const API_VERSION = "v1";
export const PROFILE_PATH = `/api/${API_VERSION}/profile`;
export const RESOURCES_PATH = `/api/${API_VERSION}/resources`;
export const LEGACY_PROFILE_PATH = "/api/profile";

export const publicProfile = {
  name: "Mikel Echeverria",
  alternateName: "mikeldev",
  role: "Backend & Full Stack Engineer",
  location: {
    city: "Pamplona",
    region: "Navarra",
    country: "ES",
  },
  summary:
    "Backend and full stack engineer focused on API architecture, scalable web systems, automation, and applied artificial intelligence.",
  url: "https://www.mikeldev.com/",
  email: "mikel@mikeldev.com",
  resources: {
    experience: "https://www.mikeldev.com/#experiencia",
    projects: "https://www.mikeldev.com/#proyectos",
    about: "https://www.mikeldev.com/about",
    contact: "https://www.mikeldev.com/contact",
    developers: "https://www.mikeldev.com/developers",
    openapi: "https://www.mikeldev.com/openapi.json",
    github: "https://github.com/mikeldev0",
    linkedin: "https://www.linkedin.com/in/mikel-echeverria",
    x: "https://x.com/mikelecheve",
  },
};

export function jsonResponse(payload, { status = 200, method = "GET", headers } = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Accept, Content-Type");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set(
    "Cache-Control",
    status >= 400 ? "no-store" : "public, max-age=300, s-maxage=300"
  );

  return new Response(method === "HEAD" ? null : JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
}

export function apiErrorResponse({
  status = 404,
  code = "not_found",
  message = "The requested API resource does not exist.",
  hint = "Inspect /openapi.json for the supported public API surface.",
  method = "GET",
  headers,
} = {}) {
  return jsonResponse(
    {
      ok: false,
      error: { code, message, hint },
    },
    { status, method, headers }
  );
}

const resourceLinksSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "experience",
    "projects",
    "about",
    "contact",
    "developers",
    "openapi",
    "github",
    "linkedin",
    "x",
  ],
  properties: {
    experience: {
      type: "string",
      format: "uri",
      description: "Canonical experience section.",
    },
    projects: { type: "string", format: "uri", description: "Canonical projects section." },
    about: { type: "string", format: "uri", description: "About page." },
    contact: { type: "string", format: "uri", description: "Professional contact page." },
    developers: { type: "string", format: "uri", description: "Developer resources page." },
    openapi: { type: "string", format: "uri", description: "OpenAPI 3.1 specification." },
    github: { type: "string", format: "uri", description: "Public GitHub profile." },
    linkedin: { type: "string", format: "uri", description: "Public LinkedIn profile." },
    x: { type: "string", format: "uri", description: "Public X profile." },
  },
};

const profileResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "data"],
  properties: {
    ok: { type: "boolean", const: true, description: "Whether the request succeeded." },
    data: {
      type: "object",
      additionalProperties: false,
      required: [
        "name",
        "alternateName",
        "role",
        "location",
        "summary",
        "url",
        "email",
        "resources",
      ],
      properties: {
        name: { type: "string", description: "Public professional name." },
        alternateName: { type: "string", description: "Public portfolio brand name." },
        role: { type: "string", description: "Current public engineering role." },
        location: {
          type: "object",
          additionalProperties: false,
          required: ["city", "region", "country"],
          properties: {
            city: { type: "string", description: "Public city." },
            region: { type: "string", description: "Public region." },
            country: { type: "string", description: "ISO 3166-1 alpha-2 country code." },
          },
        },
        summary: { type: "string", description: "Short public professional summary." },
        url: { type: "string", format: "uri", description: "Canonical portfolio URL." },
        email: {
          type: "string",
          format: "email",
          description: "Public professional contact email.",
        },
        resources: resourceLinksSchema,
      },
    },
  },
};

const errorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "error"],
  properties: {
    ok: { type: "boolean", const: false, description: "Whether the request succeeded." },
    error: {
      type: "object",
      additionalProperties: false,
      required: ["code", "message", "hint"],
      properties: {
        code: { type: "string", description: "Stable machine-readable error code." },
        message: { type: "string", description: "Human-readable error description." },
        hint: { type: "string", description: "Actionable recovery guidance for agents." },
      },
    },
  },
};

const resourcesResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "data"],
  properties: {
    ok: { type: "boolean", const: true, description: "Whether the request succeeded." },
    data: {
      type: "object",
      additionalProperties: false,
      required: ["resources"],
      properties: {
        resources: resourceLinksSchema,
      },
    },
  },
};

function successRateLimitHeaders() {
  return {
    "RateLimit-Policy": rateLimitPolicyHeader,
    RateLimit: {
      description: "Current IETF rate-limit field with the advertised quota and reset window.",
      schema: {
        type: "string",
        example: `"profile";r=${PROFILE_RATE_LIMIT};t=${PROFILE_RATE_LIMIT_WINDOW}`,
      },
    },
    "X-RateLimit-Limit": {
      description: "Compatibility header containing the request quota.",
      schema: { type: "integer", example: PROFILE_RATE_LIMIT },
    },
    "X-RateLimit-Remaining": {
      description: "Compatibility header containing the currently advertised quota.",
      schema: { type: "integer", example: PROFILE_RATE_LIMIT },
    },
  };
}

const rateLimitPolicyHeader = {
  description: `Public profile quota: ${PROFILE_RATE_LIMIT} requests per client in each ${PROFILE_RATE_LIMIT_WINDOW}-second window.`,
  schema: { type: "string", example: PROFILE_RATE_LIMIT_POLICY },
};

function jsonErrorContent(code, message, hint) {
  return {
    schema: errorResponseSchema,
    examples: {
      error: {
        value: { ok: false, error: { code, message, hint } },
      },
    },
  };
}

function rateLimitExceededHeaders() {
  return {
    "RateLimit-Policy": rateLimitPolicyHeader,
    RateLimit: {
      description: "Current IETF service-limit field. On a 429 the available quota is zero.",
      schema: { type: "string", example: `"profile";r=0;t=${PROFILE_RATE_LIMIT_WINDOW}` },
    },
    "Retry-After": {
      description: "Seconds a client should wait before retrying.",
      schema: { type: "integer", example: PROFILE_RATE_LIMIT_WINDOW },
    },
  };
}

function readOnlyResponses({ retryPath, quotaMessage }) {
  return {
    405: {
      description: "The endpoint only supports read-only methods.",
      content: {
        "application/json": jsonErrorContent(
          "method_not_allowed",
          "POST is not supported by this read-only endpoint.",
          `Use GET ${retryPath} or inspect /openapi.json for the supported contract.`
        ),
      },
    },
    429: {
      description: "The per-client request quota has been exhausted.",
      headers: rateLimitExceededHeaders(),
      content: {
        "application/json": jsonErrorContent(
          "rate_limit_exceeded",
          quotaMessage,
          `Retry after ${PROFILE_RATE_LIMIT_WINDOW} seconds.`
        ),
      },
    },
    default: {
      description: "Unexpected error. The payload follows the shared typed error schema.",
      content: {
        "application/json": jsonErrorContent(
          "internal_error",
          "An unexpected error occurred while serving the request.",
          "Retry with exponential backoff and inspect /openapi.json for the supported contract."
        ),
      },
    },
  };
}

function aiFunction(operationId, description) {
  return {
    name: operationId,
    description,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  };
}

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "mikeldev Portfolio API",
    version: "1.0.0",
    description:
      "Versioned read-only API for software agents and developer tools that need Mikel Echeverria's canonical public portfolio identity and resource links without scraping HTML, served at the edge on Cloudflare Workers. Stable operations use /api/v1/. Breaking changes will ship under a new URL version. Deprecated versions will be announced in developer documentation and, when retained during migration, with Deprecation, Sunset, and successor-version Link response headers.",
  },
  servers: [{ url: "/", description: "Current host" }],
  externalDocs: {
    description: "mikeldev developer resources and API lifecycle policy",
    url: "https://www.mikeldev.com/developers",
  },
  security: [],
  paths: {
    [PROFILE_PATH]: {
      get: {
        operationId: "getPortfolioProfileV1",
        summary: "Get the v1 public portfolio profile",
        description: `Returns Mikel Echeverria's public professional identity, location, role, summary, contact email, and canonical portfolio resource links. Use this versioned read-only operation for identity or portfolio discovery tasks. Requests are limited to ${PROFILE_RATE_LIMIT} per client per ${PROFILE_RATE_LIMIT_WINDOW} seconds.`,
        tags: ["Portfolio"],
        security: [],
        "x-ai-function": aiFunction(
          "getPortfolioProfileV1",
          "Retrieve Mikel Echeverria's canonical public portfolio identity and resource links."
        ),
        responses: {
          200: {
            description: "Public portfolio profile returned successfully.",
            headers: successRateLimitHeaders(),
            content: {
              "application/json": { schema: profileResponseSchema },
            },
          },
          ...readOnlyResponses({
            retryPath: PROFILE_PATH,
            quotaMessage: "The public portfolio API rate limit has been exceeded.",
          }),
        },
      },
    },
    [RESOURCES_PATH]: {
      get: {
        operationId: "getPortfolioResourcesV1",
        summary: "Get the v1 canonical portfolio resource links",
        description: `Returns the canonical public resource links (portfolio sections, documentation, source code, and professional profiles) without the full profile payload. Use this versioned read-only operation for link discovery and canonicalization tasks. Requests are limited to ${PROFILE_RATE_LIMIT} per client per ${PROFILE_RATE_LIMIT_WINDOW} seconds.`,
        tags: ["Portfolio"],
        security: [],
        "x-ai-function": aiFunction(
          "getPortfolioResourcesV1",
          "Retrieve Mikel Echeverria's canonical public portfolio and social resource links."
        ),
        responses: {
          200: {
            description: "Canonical portfolio resource links returned successfully.",
            headers: successRateLimitHeaders(),
            content: {
              "application/json": { schema: resourcesResponseSchema },
            },
          },
          ...readOnlyResponses({
            retryPath: RESOURCES_PATH,
            quotaMessage: "The public resources API rate limit has been exceeded.",
          }),
        },
      },
    },
    [LEGACY_PROFILE_PATH]: {
      get: {
        operationId: "getPortfolioProfileLegacy",
        summary: "Deprecated unversioned profile alias",
        description:
          "Permanent redirect kept for backward compatibility with early integrations. Responses carry RFC 8594 Deprecation and Sunset headers plus a successor-version Link to the stable v1 operation, and clients must follow Location to /api/v1/profile.",
        tags: ["Portfolio"],
        deprecated: true,
        security: [],
        responses: {
          308: {
            description: "Permanent redirect to the stable v1 profile endpoint.",
            headers: {
              Location: {
                description: "Successor endpoint that replaces this alias.",
                schema: { type: "string", example: PROFILE_PATH },
              },
              Deprecation: {
                description: "RFC 8594 deprecation timestamp in seconds since the Unix epoch.",
                schema: { type: "string", example: "@1787356800" },
              },
              Sunset: {
                description: "RFC 8594 date when this alias will stop responding.",
                schema: { type: "string", example: "Tue, 01 Dec 2026 00:00:00 GMT" },
              },
              Link: {
                description: "successor-version link pointing at the stable v1 profile endpoint.",
                schema: { type: "string", example: '</api/v1/profile>; rel="successor-version"' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ProfileResponse: profileResponseSchema,
      ErrorResponse: errorResponseSchema,
    },
  },
};

export function openApiDocumentForOrigin(origin) {
  const currentOrigin = new URL(origin).origin;
  return {
    ...openApiDocument,
    servers: [{ url: currentOrigin, description: "Current host" }],
    externalDocs: {
      ...openApiDocument.externalDocs,
      url: `${currentOrigin}/developers`,
    },
  };
}
