import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
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

/**
 * El build copia `public/` entero a `dist/`, y eso incluye
 * `public/api/config.php` cuando existe, que es el de DESARROLLO y apunta a una
 * base local. Si ese archivo viaja a Hostinger, el panel queda muerto y, peor,
 * pisa el config bueno que haya en el servidor.
 *
 * Las credenciales de produccion no se despliegan desde el repo: se crean una
 * vez en el servidor. Asi que el config se saca del build, y nunca puede
 * filtrarse por descuido.
 */
function excluirConfigLocalDelBuild() {
  return {
    name: 'excluir-config-local-del-build',
    apply: 'build',
    closeBundle() {
      const salida = fileURLToPath(new URL('./dist/api/config.php', import.meta.url))
      if (existsSync(salida)) {
        rmSync(salida)
        this.warn(
          'Se quito dist/api/config.php del build (es el config local). ' +
            'Las credenciales de produccion se crean una sola vez en el servidor: ' +
            'ver la seccion "Analitica y panel" del README.'
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    servirPaginasPrerenderizadas(),
    excluirConfigLocalDelBuild(),
  ],

  /**
   * La API de analítica es PHP y en producción la sirve el mismo Apache que
   * el sitio, así que /api es same-origin y no hay CORS. En desarrollo Vite
   * no ejecuta PHP, así que reenvía /api a un PHP local que se levanta con:
   *
   *   php -S localhost:8000 -t public
   *
   * Si no lo levantás, el sitio funciona igual: el registro de visitas falla
   * en silencio y el panel avisa que no puede contactar la API.
   */
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
