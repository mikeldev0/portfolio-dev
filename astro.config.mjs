import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://www.mikeldev.com",
  output: "server",
  integrations: [tailwind()],
  adapter: cloudflare({ inspectorPort: false }),
  image: {
    domains: ["opengraph.githubassets.com"],
  },
});
