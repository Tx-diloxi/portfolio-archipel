import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// BASE_PATH est fourni par le workflow GitHub Pages (« /nom-du-depot/ ») ; « / » en local.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
