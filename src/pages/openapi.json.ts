import type { APIRoute } from "astro";
import { jsonResponse, openApiDocumentForOrigin } from "../lib/public-api.mjs";

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const origin = new URL(request.url).origin;
  return jsonResponse(openApiDocumentForOrigin(origin), {
    method: request.method,
    headers: { Link: `</developers>; rel="help"; type="text/html"` },
  });
};

export const HEAD = GET;
