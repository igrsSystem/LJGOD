import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow this specific ngrok host so HMR and dev server requests succeed
    allowedHosts: ["7469df6feb48.ngrok-free.app", "localhost","1112dc51b45e.ngrok-free.app"],
  },
  host: true,
});
