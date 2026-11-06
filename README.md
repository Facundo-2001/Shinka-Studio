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

## Analítica y panel de administración

El sitio cuenta sus propias visitas. No usa Google Analytics ni ningún servicio
externo: los datos viven en una base MySQL del mismo hosting y se miran desde
`/admin`.

### Cómo está armado

El sitio es estático, así que el conteo lo hace una API en PHP que corre en el
mismo Apache/LiteSpeed que sirve las páginas. Eso tiene tres ventajas sobre
montar un servidor aparte: no hay CORS, no hay un segundo dominio que mantener
y no cuesta nada extra (el plan de Hostinger ya incluye PHP y MySQL).

```
Visitante → página React → POST /api/track.php → MySQL
                                                   ↑
                  /admin (panel React) → GET /api/stats.php
```

La API vive en `public/api/`, así que `npm run build` la copia a `dist/api/`
sola: subir `dist/` publica el sitio **y** el backend en un solo paso.

| Archivo | Qué hace |
| --- | --- |
| `public/api/track.php` | Registra una visita. Público, responde 204 y nunca falla a la vista. |
| `public/api/stats.php` | Devuelve las métricas del período. **Exige sesión.** |
| `public/api/login.php` · `logout.php` · `sesion.php` | Sesión del panel. |
| `public/api/instalar.php` | Crea las tablas y el usuario. Se usa una vez y se borra. |
| `public/api/lib/comun.php` | Conexión, hashes, detección de bots, lectura del user agent. |
| `public/api/config.php` | Credenciales de MySQL. **No se versiona**: lo creás vos. Puede vivir arriba de `public_html` como `shinka-config.php`. |
| `docs/crear-base-de-datos.sql` | Las sentencias para crear las tablas desde phpMyAdmin. Está fuera de `public/` para que no se publique. |

Requisitos del hosting: **PHP 8.0 o superior y MySQL**. Los dos vienen con
cualquier plan de hosting compartido de Hostinger.

### Puesta en marcha (una sola vez)

1. **Creá la base.** hPanel → *Bases de datos* → *Bases de datos MySQL* →
   *Crear una base de datos nueva*. Anotá los cuatro datos que te muestra ahí:
   nombre de la base, usuario, contraseña y host (casi siempre `localhost`).

   > La base **tiene** que crearse acá. En hosting compartido el usuario de
   > MySQL no tiene privilegio `CREATE DATABASE`, así que un `CREATE DATABASE`
   > desde phpMyAdmin falla con *Access denied*.

2. **Creá las cuatro tablas.** Dos caminos, cualquiera sirve:

   - **phpMyAdmin:** hPanel → *Bases de datos* → *phpMyAdmin* → entrá a tu
     base → pestaña *SQL* → pegá todo
     [`docs/crear-base-de-datos.sql`](docs/crear-base-de-datos.sql) → *Continuar*.
     El archivo se puede ejecutar más de una vez sin romper nada.
   - **O no hacés nada:** el instalador del paso 5 las crea solo.

3. **Creá el archivo de configuración EN EL SERVIDOR.** Con el *Administrador
   de archivos* de hPanel, copiá el contenido de `public/api/config.example.php`
   a un archivo nuevo llamado **`shinka-config.php`**, ubicado **un nivel arriba
   de `public_html`**. Completá ahí los cuatro datos de MySQL del paso 1 y, en
   `salt`, una cadena larga y aleatoria (`instalar.php` genera una si no tenés
   a mano).

   Las credenciales de producción **no se despliegan desde el repositorio**: se
   crean una sola vez, a mano, en el servidor. Por eso el build borra
   `dist/api/config.php` si existe, y por eso la API, cuando encuentra los dos
   archivos, le da prioridad al de arriba de `public_html`. Las dos cosas
   apuntan al mismo problema: que un `config.php` de desarrollo suba por error
   y se lleve puesto el sitio.

   Esa ubicación tiene además dos ventajas: ningún redespliegue la pisa, y no
   queda accesible por HTTP ni siquiera si el `.htaccess` fallara.

   > La `salt` se pone una vez y no se toca: es lo que hace que el hash de
   > visitante sea estable. Si la cambiás, los visitantes únicos de antes
   > dejan de ser comparables con los de después.

   (En desarrollo el archivo va en `public/api/config.php`, que está en
   `.gitignore`. Ver *Desarrollo local* más abajo.)

4. **Publicá.** `npm run build` y subí todo el contenido de `dist/` a
   `public_html`. El build copia `public/api/` a `dist/api/` solo, así que esto
   publica el sitio y el backend en un solo paso.

5. **Creá el usuario del panel.** Abrí `https://shinkastudio.dev/api/instalar.php`,
   elegí usuario y contraseña (mínimo 10 caracteres) y confirmá.

   > Este paso no se puede hacer desde phpMyAdmin: la contraseña se guarda con
   > bcrypt y MySQL no sabe calcularlo. Lo hace PHP, que sí.

6. **Borrá `api/instalar.php` del hosting.** El instalador se desactiva solo en
   cuanto existe un administrador, pero un archivo que no está no se puede
   atacar. Después entrá a `https://shinkastudio.dev/admin`.

El panel va a estar vacío hasta que entre la primera visita. Para probarlo,
abrí el sitio desde el teléfono o en otro navegador y refrescá el panel.

### Redespliegues: dos cosas que se pisan

Después de la primera vez, cada `npm run build` + subida tiene dos trampas.
Las dos vienen de que `dist/api/` se regenera entero en cada build:

1. **La configuración no está en `dist/`, y es a propósito.** El build quita
   `dist/api/config.php` para que un config de desarrollo no pueda subir por
   error. Si seguiste el paso 3 y la tuya vive arriba de `public_html`, no
   tenés que hacer nada: ningún despliegue la alcanza.

   Si en cambio la pusiste en `public_html/api/config.php`, **no borres
   `public_html/api` antes de subir**: se la lleva puesta y el panel queda
   muerto hasta que la vuelvas a crear. Subí encima sin borrar, o respaldala
   antes.

2. **Volvé a borrar `api/instalar.php`.** Está en `public/api/`, así que cada
   build lo vuelve a generar y cada subida lo vuelve a publicar. Se desactiva
   solo mientras exista un administrador, así que el riesgo real es bajo, pero
   no tiene nada que hacer ahí.

### Qué se mide

Visitas y visitantes únicos por día, páginas más vistas, de dónde llega la
gente (Google, Instagram, WhatsApp, directo… y país aproximado) y con qué
entra (móvil o escritorio, navegador, sistema).

Los buscadores y los robots se detectan por el user agent y se guardan
marcados: **no entran en ningún número**. El panel los informa aparte, como
nota al pie, así se ve cuánto tráfico era automático.

### Qué datos se guardan de las personas

Ninguno que las identifique. **La IP no se guarda.** Para contar visitantes
únicos se guarda `sha256(salt + IP + navegador + día)`: no se puede revertir y
cambia todos los días, así que sirve para contar pero no para seguir a nadie.
Tampoco hay cookies en el sitio público; la única cookie del dominio es la de
sesión del panel, que solo existe mientras estás logueado.

El país se resuelve consultando el servicio gratuito `ipwho.is`, una vez por
visitante y con el resultado en caché 30 días. Si preferís no consultar nada
externo, poné `'geo' => false` en `config.php`: el resto sigue funcionando
igual, solo deja de haber país.

### Seguridad del panel

- La autorización está en el servidor. `stats.php` llama a `exigir_sesion()` y
  corta con 401 antes de leer la base. El panel de React solo decide qué
  dibuja, nunca si los datos se entregan.
- Contraseña con bcrypt (costo 12). En la base no hay contraseñas en claro.
- Cookie de sesión `HttpOnly` + `SameSite=Lax` + `Secure` sobre HTTPS, y el
  identificador de sesión se regenera al entrar.
- 8 intentos fallidos por IP cada 15 minutos.
- La sesión se cierra tras 2 horas de inactividad (`minutos_sesion`).
- `Disallow: /admin` en robots.txt y `noindex` en la página son un extra para
  los buscadores, **no** la protección: esa está en el PHP.

### Mantenimiento

| Situación | Qué hacer |
| --- | --- |
| Me olvidé la contraseña | Borrá la fila de `admin_usuarios` en phpMyAdmin y volvé a abrir `api/instalar.php`: se reactiva. |
| Quiero borrar los datos de prueba | `TRUNCATE TABLE visitas;` en phpMyAdmin. No toca el usuario del panel. |
| No quiero contar mis propias visitas | Desde el panel, activá el interruptor de "no registrar mis visitas". Queda guardado en ese navegador. |
| El panel dice que no hay base | Revisá los cuatro datos de `api/config.php`. Son los que figuran en hPanel → Bases de datos. |

### Desarrollo local

Vite no ejecuta PHP, así que `npm run dev` reenvía `/api` a un PHP local (el
proxy ya está configurado en `vite.config.js`).

```bash
php -S localhost:8000 -t public   # en una terminal
npm run dev                       # en otra
```

Sin el PHP levantado el sitio funciona igual: el registro de visitas falla en
silencio y el panel avisa que no puede contactar la API.

#### Qué hace falta

**PHP 8.0 o superior.** Si no lo tenés:

```bash
winget install --id PHP.PHP.8.3 --exact --source winget
```

Queda en `%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_*`. Hay que
crear el `php.ini` (copiando `php.ini-development`) y habilitar ahí:

```ini
extension_dir = "<ruta completa de la carpeta ext>"
extension=pdo_mysql
extension=curl
extension=openssl
extension=mbstring
date.timezone = America/Argentina/Buenos_Aires
```

**Una base MariaDB o MySQL.** Para no mezclar los datos con los de otro
proyecto, conviene levantar una instancia aparte, con su propio directorio de
datos y su propio puerto:

```bash
# Una sola vez: crear el directorio de datos
mariadb-install-db.exe --datadir=C:/ruta/a/datos-shinka --port=3307

# Cada vez que quieras trabajar
mariadbd.exe --defaults-file=C:/ruta/a/datos-shinka/my.ini --console
```

Después, la base y el usuario:

```sql
CREATE DATABASE shinka_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shinka'@'127.0.0.1' IDENTIFIED BY 'la-que-quieras';
GRANT ALL PRIVILEGES ON shinka_local.* TO 'shinka'@'127.0.0.1';
```

Y las tablas, con el mismo archivo que se usa en producción:

```bash
mariadb.exe --protocol=TCP -h 127.0.0.1 -P 3307 -u shinka -p shinka_local < docs/crear-base-de-datos.sql
```

En `public/api/config.php` apuntá a esa base (`'host' => '127.0.0.1'`,
`'puerto' => 3307`) y agregá `localhost` y `127.0.0.1` a `dominios_propios`,
que si no los chequeos de origen rechazan los pedidos.

#### El país no funciona en Windows sin configurar los certificados

Si en local el país queda siempre vacío, no es un error del código: el PHP de
Windows no trae el paquete de certificados raíz, así que la llamada HTTPS al
servicio de geolocalización falla con *unable to get local issuer certificate*.
Se arregla una vez:

1. Bajá [`cacert.pem`](https://curl.se/ca/cacert.pem) a la carpeta de PHP.
2. En `php.ini`:

```ini
curl.cainfo = "<ruta completa>/cacert.pem"
openssl.cafile = "<ruta completa>/cacert.pem"
```

En el hosting esto no pasa: Linux ya trae los certificados del sistema.

## Sistema de diseño

La paleta sale del isologo: **azul naval + cian**. Todo (colores, tipografías,
espaciados, radios, sombras) está definido como variables CSS en
`src/styles/tokens.css`, así que cambiar un valor ahí lo cambia en todo el sitio.

Tipografías: Plus Jakarta Sans (títulos) e Inter (texto), vía Google Fonts.
