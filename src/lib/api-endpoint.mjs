import { API_CATALOG_PATH } from "./agent-discovery.mjs";
import { profileRateLimitHeaders, profileRateLimitKey } from "./api-rate-limit.mjs";
import { apiErrorResponse, jsonResponse, OPENAPI_MEDIA_TYPE } from "./public-api.mjs";

const serviceDescription = `</openapi.json>; rel="service-desc"; type="${OPENAPI_MEDIA_TYPE}"`;
const apiCatalogLink = `<${API_CATALOG_PATH}>; rel="api-catalog"; type="application/linkset+json"`;

export function createReadOnlyEndpoint({ path, scope, data, limit }) {
  const discoveryLinks = `${serviceDescription}, ${apiCatalogLink}`;

  async function get({ request }) {
    const { success } = await limit(profileRateLimitKey(request, scope));
    const rateLimitHeaders = profileRateLimitHeaders({ limited: !success });

    if (!success) {
      return apiErrorResponse({
        status: 429,
        code: "rate_limit_exceeded",
        message: `The public ${scope} API rate limit has been exceeded.`,
        hint: `Retry after ${rateLimitHeaders["Retry-After"]} seconds.`,
        method: request.method,
        headers: { Link: discoveryLinks, ...rateLimitHeaders },
      });
    }

    return jsonResponse(
      { ok: true, data },
      { method: request.method, headers: { Link: discoveryLinks, ...rateLimitHeaders } }
    );
  }

  const options = () =>
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

  const methodNotAllowed = ({ request }) =>
    apiErrorResponse({
      status: 405,
      code: "method_not_allowed",
      message: `${request.method} is not supported by this read-only endpoint.`,
      hint: `Use GET ${path} or inspect /openapi.json for the supported contract.`,
      method: request.method,
      headers: { Allow: "GET, HEAD, OPTIONS", Link: discoveryLinks },
    });

  return {
    get,
    head: get,
    options,
    post: methodNotAllowed,
    put: methodNotAllowed,
    patch: methodNotAllowed,
    delete: methodNotAllowed,
  };
}
