import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
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
