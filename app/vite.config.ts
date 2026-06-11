import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base 設為相對路徑，方便部署到 GitHub Pages 子路徑或任意靜態主機。
export default defineConfig({
  base: "./",
  plugins: [react()],
});
