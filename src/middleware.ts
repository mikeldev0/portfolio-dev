import { defineMiddleware } from "astro:middleware";
import {
  AGENT_GUIDE_PATH,
  AI_CATALOG_MEDIA_TYPE,
  AI_CATALOG_PATH,
  API_CATALOG_MEDIA_TYPE,
  API_CATALOG_PATH,
  agentGuideMarkdown,
  aiCatalogForOrigin,
  apiCatalogForOrigin,
} from "./lib/agent-discovery.mjs";
import {
  appendVary,
  markdownForPath,
  markdownPathFor,
  markdownResponse,
  notAcceptableResponse,
  notFoundMarkdown,
  preferredType,
} from "./lib/agent-readiness.mjs";
import { apiErrorResponse, OPENAPI_MEDIA_TYPE, PROFILE_PATH } from "./lib/public-api.mjs";

const serviceDescription = `</openapi.json>; rel="service-desc"; type="${OPENAPI_MEDIA_TYPE}"`;
const apiCatalogLink = `<${API_CATALOG_PATH}>; rel="api-catalog"; type="application/linkset+json"`;

function apiNotFound(pathname: string, method: string) {
  return apiErrorResponse({
    status: 404,
    code: "not_found",
    message: `No public API resource exists at ${pathname}.`,
    hint: `Use GET ${PROFILE_PATH} or inspect /openapi.json for the supported API contract.`,
    method,
    headers: { Link: `${serviceDescription}, ${apiCatalogLink}` },
  });
}

function machineDocumentResponse(
  payload: string | Record<string, unknown>,
  { contentType, method, link }: { contentType: string; method: string; link?: string }
) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return new Response(method === "HEAD" ? null : body, {
    status: 200,
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
      ...(link ? { Link: link } : {}),
    },
  });
}

function discoveryResponse(pathname: string, origin: string, method: string) {
  if (pathname === API_CATALOG_PATH) {
    return machineDocumentResponse(apiCatalogForOrigin(origin), {
      contentType: API_CATALOG_MEDIA_TYPE,
      method,
      link: `${serviceDescription}, </developers>; rel="service-doc"; type="text/html"`,
    });
  }

  if (pathname === AI_CATALOG_PATH) {
    return machineDocumentResponse(aiCatalogForOrigin(origin), {
      contentType: AI_CATALOG_MEDIA_TYPE,
      method,
      link: `${serviceDescription}, <${AGENT_GUIDE_PATH}>; rel="help"; type="text/markdown"`,
    });
  }

  if (pathname === AGENT_GUIDE_PATH) {
    return machineDocumentResponse(agentGuideMarkdown, {
      contentType: "text/markdown",
      method,
      link: `</llms.txt>; rel="describedby"; type="text/plain", ${serviceDescription}, ${apiCatalogLink}`,
    });
  }

  return null;
}

function withNegotiationHeaders(response: Response, markdownPath: string | null) {
  const headers = new Headers(response.headers);
  appendVary(headers);

  const links = [
    `</llms.txt>; rel="describedby"; type="text/plain"`,
    serviceDescription,
    apiCatalogLink,
    `</developers>; rel="help"; type="text/html"`,
  ];
  if (markdownPath) {
    links.unshift(`<${markdownPath}>; rel="alternate"; type="text/markdown"`);
  }

  const existingLink = headers.get("Link");
  headers.set("Link", existingLink ? `${existingLink}, ${links.join(", ")}` : links.join(", "));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const method = context.request.method.toUpperCase();
  const isRepresentationRequest = method === "GET" || method === "HEAD";

  if (isRepresentationRequest) {
    const discovery = discoveryResponse(context.url.pathname, context.url.origin, method);
    if (discovery) return discovery;
  }

  if (!isRepresentationRequest) {
    const response = await next();
    if (response.status === 404 && context.url.pathname.startsWith("/api/")) {
      return apiNotFound(context.url.pathname, method);
    }
    return response;
  }

  const markdown = markdownForPath(context.url.pathname);
  const markdownPath = markdownPathFor(context.url.pathname);
  const accept = context.request.headers.get("Accept");

  if (markdown) {
    const chosen = preferredType(accept);
    if (chosen === null && accept) return notAcceptableResponse(method);

    if (chosen === "text/markdown") {
      const response = markdownResponse(markdown, { method });
      response.headers.set(
        "Link",
        `<${context.url.pathname}>; rel="canonical", </llms.txt>; rel="describedby"; type="text/plain", ${serviceDescription}, ${apiCatalogLink}, </developers>; rel="help"; type="text/html"`
      );
      return response;
    }

    return withNegotiationHeaders(await next(), markdownPath);
  }

  const response = await next();
  if (response.status !== 404) return response;

  if (context.url.pathname.startsWith("/api/")) {
    return apiNotFound(context.url.pathname, method);
  }

  const chosen = preferredType(accept);
  if (chosen === "text/markdown") {
    const notFound = markdownResponse(notFoundMarkdown, { status: 404, method });
    notFound.headers.set(
      "Link",
      `</llms.txt>; rel="describedby"; type="text/plain", </sitemap.xml>; rel="help", ${apiCatalogLink}`
    );
    return notFound;
  }

  return withNegotiationHeaders(response, null);
});
