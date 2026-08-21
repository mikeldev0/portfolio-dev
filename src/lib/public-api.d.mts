export const OPENAPI_MEDIA_TYPE: string;
export const publicProfile: Readonly<Record<string, unknown>>;
export const openApiDocument: Readonly<Record<string, unknown>>;

export interface JsonResponseOptions {
  status?: number;
  method?: string;
  headers?: HeadersInit;
}

export function jsonResponse(payload: unknown, options?: JsonResponseOptions): Response;

export interface ApiErrorOptions extends JsonResponseOptions {
  code?: string;
  message?: string;
  hint?: string;
}

export function apiErrorResponse(options?: ApiErrorOptions): Response;
