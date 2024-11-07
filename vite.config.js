import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    
    host: '0.0.0.0',  // Esto permite que otros dispositivos accedan a tu IP
    port: 5173        // Puerto de tu aplicación
  },
});
