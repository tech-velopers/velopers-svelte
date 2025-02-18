import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib')
    }
  },
  server: {
    proxy: {
      '/sitemap.xml': {
        target: mode === 'development'
          ? 'http://localhost:8080'
          : 'https://server.velopers.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace('/sitemap.xml', '/api/sitemap.xml')
      }
    }
  }
}))
