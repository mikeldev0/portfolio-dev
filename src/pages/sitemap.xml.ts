import { buildSitemap } from "../lib/agent-readiness.mjs";

export function GET() {
  return new Response(buildSitemap(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
