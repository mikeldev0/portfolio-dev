export const OPENAPI_MEDIA_TYPE: string;
export const API_VERSION: string;
export const PROFILE_PATH: string;
export const publicProfile: Readonly<Record<string, unknown>>;
export const openApiDocument: Readonly<Record<string, any>>;
export function openApiDocumentForOrigin(origin: string): Readonly<Record<string, any>>;

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
