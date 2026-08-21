import { agentMarkdown, markdownResponse } from "../lib/agent-readiness.mjs";

export function GET({ request }: { request: Request }) {
  const response = markdownResponse(agentMarkdown["/developers"], { method: request.method });
  response.headers.set(
    "Link",
    `</developers>; rel="canonical", </llms.txt>; rel="describedby"; type="text/plain"`
  );
  return response;
}
