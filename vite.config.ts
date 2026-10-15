import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* `vite preview` stand-in for the netlify.toml rewrite: an address with no
   prerendered file of its own (/admin, unknown paths) gets the empty app
   shell, not the prerendered home page that preview would otherwise serve. */
function previewSpaFallback(): Plugin {
  return {
    name: 'preview-spa-fallback',
    configurePreviewServer(server) {
      const dist = resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, _res, next) => {
        const path = decodeURIComponent((req.url ?? '/').split('?')[0])
        const isPage = req.headers.accept?.includes('text/html') && !/\.[a-z0-9]+$/i.test(path)
        if (
          isPage &&
          path !== '/' &&
          !existsSync(join(dist, `${path.replace(/\/+$/, '')}.html`)) &&
          !existsSync(join(dist, path, 'index.html'))
        ) {
          req.url = '/spa-fallback.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), previewSpaFallback()],
})
