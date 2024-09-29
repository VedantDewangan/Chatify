import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Ensure React plugin is included
  server: {
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 5173        // Specify the port
  }
})
