import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://www.mikeldev.com",
  integrations: [tailwind()],
  image: {
    domains: ["opengraph.githubassets.com"],
  },
});
