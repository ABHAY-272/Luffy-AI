import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Environment-based setup
const port = process.env.PORT ? Number(process.env.PORT) : 5173;
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  // BASE_PATH specify karna zaroori hai agar artifacts folder se serve ho raha ho
  base: process.env.BASE_PATH || "/",

  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    // Replit specific plugins only in dev mode
    ...(!isProduction && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, "..", ".."), // Root of workspace
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Attached assets usually live at the root of the workspace
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: path.resolve(import.meta.dirname),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // Monorepo mein chunks ko optimize karna better rehta hai
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion"],
        },
      },
    },
  },

  server: {
    port,
    host: "0.0.0.0",
    // LOCAL PROXY: Isse dev mein 404 nahi aayega
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Aapka api-server port
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false, // Monorepo mein workspace files access karne ke liye false zaroori hai
      allow: [path.resolve(import.meta.dirname, "..", "..")], 
    },
  },

  preview: {
    port,
    host: "0.0.0.0",
  },
});