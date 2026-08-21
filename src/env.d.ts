/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GITHUB_URL: string;
  readonly GITHUB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "cloudflare:workers" {
  export const env: {
    PROFILE_RATE_LIMITER: {
      limit(options: { key: string }): Promise<{ success: boolean }>;
    };
  };
}
