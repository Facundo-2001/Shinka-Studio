import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

/**
 * `vite preview` reescribe cualquier ruta a /index.html (fallback de SPA),
 * así que se saltea los HTML prerenderizados y no muestra lo que realmente
 * verá Google. Este plugin sirve dist/<ruta>/index.html cuando existe, igual
 * que hacen Netlify, Vercel o cualquier hosting estático en producción.
 */
function servirPaginasPrerenderizadas() {
  return {
    name: 'servir-paginas-prerenderizadas',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [ruta] = (req.url || '/').split('?')
        if (ruta !== '/' && !ruta.includes('.')) {
          const archivo = join(server.config.build.outDir, ruta, 'index.html')
          if (existsSync(archivo)) {
            req.url = `${ruta.replace(/\/$/, '')}/index.html`
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    servirPaginasPrerenderizadas(),
  ],
})
