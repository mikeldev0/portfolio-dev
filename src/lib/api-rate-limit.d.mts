export const PROFILE_RATE_LIMIT: number;
export const PROFILE_RATE_LIMIT_WINDOW: number;
export const PROFILE_RATE_LIMIT_POLICY: string;

export function profileRateLimitKey(request: Request): string;
export function profileRateLimitHeaders(options?: { limited?: boolean }): Record<string, string>;
