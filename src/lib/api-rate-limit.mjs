export const PROFILE_RATE_LIMIT = 120;
export const PROFILE_RATE_LIMIT_WINDOW = 60;
export const PROFILE_RATE_LIMIT_POLICY = `"profile";q=${PROFILE_RATE_LIMIT};w=${PROFILE_RATE_LIMIT_WINDOW}`;

export function profileRateLimitKey(request, scope = "profile") {
  const clientIp = request.headers.get("CF-Connecting-IP")?.trim();
  return `${scope}:${clientIp || "anonymous"}`;
}

export function profileRateLimitHeaders({ limited = false } = {}) {
  const remaining = limited ? 0 : PROFILE_RATE_LIMIT;
  const headers = {
    "RateLimit-Policy": PROFILE_RATE_LIMIT_POLICY,
    RateLimit: `"profile";r=${remaining};t=${PROFILE_RATE_LIMIT_WINDOW}`,
    "X-RateLimit-Limit": String(PROFILE_RATE_LIMIT),
    "X-RateLimit-Remaining": String(remaining),
  };

  if (limited) {
    headers["Retry-After"] = String(PROFILE_RATE_LIMIT_WINDOW);
  }

  return headers;
}
