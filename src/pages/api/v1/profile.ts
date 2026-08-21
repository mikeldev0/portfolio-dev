import type { APIRoute } from "astro";
import {
  apiErrorResponse,
  jsonResponse,
  OPENAPI_MEDIA_TYPE,
  publicProfile,
} from "../../../lib/public-api.mjs";

export const prerender = false;

const serviceDescription = `</openapi.json>; rel="service-desc"; type="${OPENAPI_MEDIA_TYPE}"`;

export const GET: APIRoute = ({ request }) =>
  jsonResponse(
    { ok: true, data: publicProfile },
    { method: request.method, headers: { Link: serviceDescription } }
  );

export const HEAD = GET;

export const OPTIONS: APIRoute = () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });

const methodNotAllowed: APIRoute = ({ request }) =>
  apiErrorResponse({
    status: 405,
    code: "method_not_allowed",
    message: "The v1 public portfolio profile endpoint is read-only.",
    hint: "Use GET /api/v1/profile. Inspect /openapi.json for the supported API contract.",
    method: request.method,
    headers: { Allow: "GET, HEAD, OPTIONS", Link: serviceDescription },
  });

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
