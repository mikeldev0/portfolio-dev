import type { APIRoute } from "astro";
import { API_CATALOG_PATH } from "../lib/agent-discovery.mjs";
import {
  jsonResponse,
  OPENAPI_MEDIA_TYPE,
  openApiDocumentForOrigin,
} from "../lib/public-api.mjs";

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const origin = new URL(request.url).origin;
  const response = jsonResponse(openApiDocumentForOrigin(origin), {
    method: request.method,
    headers: {
      Link: `</developers>; rel="help"; type="text/html", <${API_CATALOG_PATH}>; rel="api-catalog"; type="application/linkset+json"`,
    },
  });
  response.headers.set("Content-Type", `${OPENAPI_MEDIA_TYPE}; charset=utf-8`);
  return response;
};

export const HEAD = GET;
