import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electronVite from './plugin/electron-vite/index.ts'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), electronVite()],
})
