export const SITE_URL: string;
export const PRODUCES: readonly string[];
export const VARY_HEADERS: readonly string[];

export interface SitePage {
  path: string;
  markdownPath: string;
  lastmod: string;
}

export const sitePages: readonly SitePage[];
export const agentMarkdown: Readonly<Record<string, string>>;
export const notFoundMarkdown: string;

export function preferredType(
  header: string | null | undefined,
  produces?: readonly string[]
): string | null;

export function appendVary(headers: Headers, names?: readonly string[]): void;

export function markdownResponse(
  markdown: string,
  options?: {
    status?: number;
    method?: string;
    headers?: HeadersInit;
  }
): Response;

export function notAcceptableResponse(method?: string): Response;
export function markdownForPath(pathname: string): string | null;
export function markdownPathFor(pathname: string): string | null;
export function buildSitemap(pages?: readonly SitePage[]): string;
