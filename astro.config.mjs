import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react"; // Importa la integración de React

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(), // Añade React a la lista de integraciones
  ],
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "framer-motion"],
    },
  },
  image: {
    domains: ["opengraph.githubassets.com"],
  },
});
