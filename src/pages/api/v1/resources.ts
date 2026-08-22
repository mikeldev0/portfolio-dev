import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createReadOnlyEndpoint } from "../../../lib/api-endpoint.mjs";
import { RESOURCES_PATH, publicProfile } from "../../../lib/public-api.mjs";

export const prerender = false;

const endpoint = createReadOnlyEndpoint({
  path: RESOURCES_PATH,
  scope: "resources",
  data: { resources: publicProfile.resources },
  limit: (key: string) => env.PROFILE_RATE_LIMITER.limit({ key }),
});

export const GET: APIRoute = endpoint.get;
export const HEAD: APIRoute = endpoint.head;
export const OPTIONS: APIRoute = endpoint.options;
export const POST: APIRoute = endpoint.post;
export const PUT: APIRoute = endpoint.put;
export const PATCH: APIRoute = endpoint.patch;
export const DELETE: APIRoute = endpoint.delete;
