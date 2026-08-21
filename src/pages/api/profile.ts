import type { APIRoute } from "astro";
import { jsonResponse, PROFILE_PATH } from "../../lib/public-api.mjs";

export const prerender = false;

const sunset = "Tue, 01 Dec 2026 00:00:00 GMT";
const successorLink = `<${PROFILE_PATH}>; rel="successor-version"`;

const redirect: APIRoute = ({ request }) =>
  jsonResponse(
    {
      ok: false,
      error: {
        code: "deprecated_endpoint",
        message: "The unversioned portfolio profile endpoint has moved to the stable v1 API.",
        hint: `Use GET ${PROFILE_PATH}.`,
      },
    },
    {
      status: 308,
      method: request.method,
      headers: {
        Location: PROFILE_PATH,
        Deprecation: "@1787356800",
        Sunset: sunset,
        Link: successorLink,
      },
    }
  );

export const GET = redirect;
export const HEAD = redirect;
