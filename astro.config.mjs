import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

export default defineConfig({
  site: "https://www.mikeldev.com",
  integrations: [tailwind()],
  adapter: netlify(),
  image: {
    domains: ["opengraph.githubassets.com"],
  },
});
