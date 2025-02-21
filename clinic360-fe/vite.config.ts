import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
#This shows the plug-in being imported from Vite.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
#The plug-in is instructed to react with the default tool.
