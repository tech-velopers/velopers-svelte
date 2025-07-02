import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [sveltekit()],
  define: {
    global: 'globalThis'
  },
  ssr: {
    external: ['svelte/elements']
  }
})
