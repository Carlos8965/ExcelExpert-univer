import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      "./dist/cpexcel.js": "" // Evita errores innecesarios de la librería xlsx
    }
  }
})