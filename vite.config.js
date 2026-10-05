// Configuración de Vite para compilar la aplicación React y procesar los estilos con Tailwind CSS.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
