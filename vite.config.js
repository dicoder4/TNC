import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  // Same origin as dev so the Google API key's website restriction allows it.
  preview: {
    host: "127.0.0.1",
    port: 5173,
  },
});
