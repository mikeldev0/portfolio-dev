/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GITHUB_URL: string;
  readonly GITHUB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
