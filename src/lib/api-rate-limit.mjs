export const PROFILE_RATE_LIMIT = 120;
export const PROFILE_RATE_LIMIT_WINDOW = 60;
export const PROFILE_RATE_LIMIT_POLICY = `"profile";q=${PROFILE_RATE_LIMIT};w=${PROFILE_RATE_LIMIT_WINDOW}`;

export function profileRateLimitKey(request) {
  const clientIp = request.headers.get("CF-Connecting-IP")?.trim();
  return `profile:${clientIp || "anonymous"}`;
}

export function profileRateLimitHeaders({ limited = false } = {}) {
  const headers = {
    "RateLimit-Policy": PROFILE_RATE_LIMIT_POLICY,
    "X-RateLimit-Limit": String(PROFILE_RATE_LIMIT),
  };

  if (limited) {
    headers.RateLimit = `"profile";r=0;t=${PROFILE_RATE_LIMIT_WINDOW}`;
    headers["Retry-After"] = String(PROFILE_RATE_LIMIT_WINDOW);
    headers["X-RateLimit-Remaining"] = "0";
  }

  return headers;
}
