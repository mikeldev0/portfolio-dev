import type { APIRoute } from "astro";
import { jsonResponse, openApiDocument } from "../lib/public-api.mjs";

export const prerender = false;

export const GET: APIRoute = ({ request }) =>
  jsonResponse(openApiDocument, {
    method: request.method,
    headers: { Link: `</developers>; rel="help"; type="text/html"` },
  });

export const HEAD = GET;
