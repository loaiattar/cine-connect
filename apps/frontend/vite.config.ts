import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  // Use the VITE_ prefix only (default). Passing "" would match every env key and hide a missing VITE_API_BASE_URL.
  const env = loadEnv(mode, __dirname, "VITE_");
  if (command === "build") {
    const api = String(env.VITE_API_BASE_URL ?? "").trim();
    if (!api) {
      throw new Error(
        "VITE_API_BASE_URL must be set when running `vite build` (CI, Docker, or local: export it or use apps/frontend/.env.production). See apps/frontend/README.md."
      );
    }
  }
  // Prefer 127.0.0.1 so the proxy matches a backend bound to IPv4 (avoids some localhost → ::1 mismatches).
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3000";

  return {
    plugins: [tanstackRouter(), react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/socket.io": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
