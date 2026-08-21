import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { API_CATALOG_PATH } from "../../../lib/agent-discovery.mjs";
import {
  profileRateLimitHeaders,
  profileRateLimitKey,
} from "../../../lib/api-rate-limit.mjs";
import {
  apiErrorResponse,
  jsonResponse,
  OPENAPI_MEDIA_TYPE,
  publicProfile,
} from "../../../lib/public-api.mjs";

export const prerender = false;

const serviceDescription = `</openapi.json>; rel="service-desc"; type="${OPENAPI_MEDIA_TYPE}"`;
const apiCatalogLink = `<${API_CATALOG_PATH}>; rel="api-catalog"; type="application/linkset+json"`;
const discoveryLinks = `${serviceDescription}, ${apiCatalogLink}`;

export const GET: APIRoute = async ({ request }) => {
  const { success } = await env.PROFILE_RATE_LIMITER.limit({ key: profileRateLimitKey(request) });
  const rateLimitHeaders = profileRateLimitHeaders({ limited: !success });

  if (!success) {
    return apiErrorResponse({
      status: 429,
      code: "rate_limit_exceeded",
      message: "The public profile API rate limit has been exceeded.",
      hint: `Retry after ${rateLimitHeaders["Retry-After"]} seconds.`,
      method: request.method,
      headers: { Link: discoveryLinks, ...rateLimitHeaders },
    });
  }

  return jsonResponse(
    { ok: true, data: publicProfile },
    {
      method: request.method,
      headers: { Link: discoveryLinks, ...rateLimitHeaders },
    }
  );
};

export const HEAD = GET;

export const OPTIONS: APIRoute = () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Cache-Control": "public, max-age=86400",
      Link: discoveryLinks,
    },
  });

function methodNotAllowed(method: string) {
  return apiErrorResponse({
    status: 405,
    code: "method_not_allowed",
    message: `${method} is not supported by this read-only endpoint.`,
    hint: "Use GET /api/v1/profile or inspect /openapi.json for the supported contract.",
    method,
    headers: {
      Allow: "GET, HEAD, OPTIONS",
      Link: discoveryLinks,
    },
  });
}

export const POST: APIRoute = ({ request }) => methodNotAllowed(request.method);
export const PUT: APIRoute = ({ request }) => methodNotAllowed(request.method);
export const PATCH: APIRoute = ({ request }) => methodNotAllowed(request.method);
export const DELETE: APIRoute = ({ request }) => methodNotAllowed(request.method);
