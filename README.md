# Shinka Studio

Sitio web institucional de Shinka Studio, hecho con React 19 + Vite.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Build de producción **+ prerenderizado SEO** (es el que hay que usar para publicar). |
| `npm run build:spa` | Build sin prerenderizado. Solo para depurar. |
| `npm run preview` | Sirve `dist/` igual que lo hará el hosting real. |
| `npm run lint` | ESLint. |

## Cómo está armado el SEO

El sitio es una SPA, y una SPA entrega un `<div id="root">` vacío: Google termina
indexándola, pero tarda, y los crawlers que **no** ejecutan JavaScript (WhatsApp,
Facebook, X, LinkedIn) no ven ni el título ni la imagen de la vista previa.

Por eso `npm run build` hace tres pasos:

1. `vite build` → build normal del cliente.
2. `vite build --ssr` → compila `src/entry-server.jsx` para poder renderizar en Node.
3. `node scripts/prerender.mjs` → renderiza cada ruta a HTML y escribe un archivo
   por página con su `<head>` ya resuelto.

Resultado en `dist/`:

```
index.html              ← home, con el HTML completo ya renderizado
servicios/index.html
sobre-nosotros/index.html
contacto/index.html
404.html
sitemap.xml             ← se regenera en cada build
```

El sitio sigue siendo una SPA: React hidrata ese HTML y la navegación interna
sigue siendo instantánea.

### Dónde se edita cada cosa

| Qué querés cambiar | Archivo |
| --- | --- |
| Dominio, teléfono, email, redes | `src/seo/siteConfig.js` |
| Título y descripción de una página | `src/seo/siteConfig.js` (objeto `pages`) |
| Datos estructurados (schema.org) | `src/seo/schemas.js` |
| Colores, tipografías, espaciados | `src/styles/tokens.css` |

> **Importante:** si agregás una ruta nueva al router, agregala también a `pages`
> en `src/seo/siteConfig.js`. Si no, no se va a prerenderizar ni va a entrar en
> el sitemap.

## Publicación

En `dist/` ya quedan las configuraciones de los hostings más comunes:

- **Netlify** → usa `_redirects`.
- **Vercel** → usa `vercel.json`.
- **Apache / cPanel** → usa `.htaccess`.

Las tres hacen lo mismo: servir `/servicios` desde `servicios/index.html` y
devolver un **404 real** (no un 200) en las URLs que no existen.

### Después de publicar

1. Dar de alta el sitio en [Google Search Console](https://search.google.com/search-console).
2. Enviar `https://shinkastudio.dev/sitemap.xml`.
3. Validar los datos estructurados en el
   [Test de resultados enriquecidos](https://search.google.com/test/rich-results).

## Sistema de diseño

La paleta sale del isologo: **azul naval + cian**. Todo (colores, tipografías,
espaciados, radios, sombras) está definido como variables CSS en
`src/styles/tokens.css`, así que cambiar un valor ahí lo cambia en todo el sitio.

Tipografías: Plus Jakarta Sans (títulos) e Inter (texto), vía Google Fonts.
