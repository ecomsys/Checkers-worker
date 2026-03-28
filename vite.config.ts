import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    open: true,
    fs: {
      strict: false, // разрешаем доступ к файловой системе
    },
    host: true, // разрешаем все хосты
    strictPort: true,
    allowedHosts: ["games.ecomsys.ru/games/checkers"],
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000
  },
});
