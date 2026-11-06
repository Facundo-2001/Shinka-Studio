# Estado del trabajo — Panel de analítica

**Fecha:** 6 de noviembre de 2026
**Estado general:** terminado y verificado en local. **Falta subirlo a Hostinger.**
**Nada commiteado todavía** (ver *Pendientes*).

---

## 1. Qué se pidió

Un panel de administración para contar las visitas de shinkastudio.dev, con base
de datos propia, manteniendo la estética actual del sitio.

### Decisiones tomadas

| Decisión | Qué se eligió | Por qué |
| --- | --- | --- |
| Dónde corre el backend | **PHP + MySQL en el mismo hosting** | El plan compartido de Hostinger ya los incluye. Sin CORS, sin segundo dominio, sin costo extra. |
| Dónde vive el panel | **Ruta `/admin` en la misma app React** | Hereda `tokens.css` y los componentes actuales, así la estética es idéntica por construcción. |
| Qué se mide | Visitas y visitantes únicos por día, páginas más vistas, origen (referrer + país), dispositivo y navegador | Lo elegido al arrancar. |
| Dónde vive el código | **Todo en `G:\Proyectos\Shinka-Studio`** | En hosting compartido el PHP tiene que estar bajo `public_html`. El build copia `public/api/` a `dist/api/`, así una sola subida publica el sitio y el backend. |
| `Shinka-Studio-Server` | **Sin uso para esto** | Era para el intento anterior con Node + Oracle, que se descartó. |

---

## 2. Cómo está armado

```
Visitante → página React → POST /api/track.php → MySQL
                                                   ↑
                  /admin (panel React) → GET /api/stats.php
```

Cuatro tablas: `visitas`, `admin_usuarios`, `admin_intentos`, `geo_cache`.

### Tres decisiones de diseño que conviene recordar

- **No se guarda la IP.** Para contar visitantes únicos se guarda
  `sha256(salt + IP + navegador + día)`: no se puede revertir y cambia todos los
  días. Sirve para contar, no para seguir a nadie. El sitio público no pone
  cookies; la única del dominio es la de sesión del panel.
- **Los bots no cuentan.** Se detectan por user agent y se guardan marcados,
  fuera de todos los números. El panel los informa aparte, como nota al pie.
- **Atribución de primer contacto.** En una SPA `document.referrer` no cambia al
  navegar, así que el origen se toma del primer registro del visitante en el
  día. Sin esto, una sola llegada desde Instagram se contaría una vez por
  página vista.

---

## 3. Archivos

### Backend (PHP)

```
public/api/.htaccess             Bloquea config/sql/md/log, desactiva listados
public/api/config.example.php    Plantilla de configuración
public/api/lib/.htaccess         Deniega todo acceso HTTP a lib/
public/api/lib/comun.php         Conexión, hashes, bots, user agent, origen, geo, sesión
public/api/instalar.php          Instalación por única vez. Se autobloquea.
public/api/track.php             Registra una visita. Público. Responde 204 siempre.
public/api/login.php             Abre sesión. Freno de fuerza bruta.
public/api/logout.php            Cierra sesión.
public/api/sesion.php            Estado de instalación y de sesión.
public/api/stats.php             Métricas del período. EXIGE SESIÓN.
docs/crear-base-de-datos.sql     Sentencias para phpMyAdmin
docs/ESTADO.md                   Este archivo
```

`public/api/config.php` **no se versiona** (está en `.gitignore`) y **no se
despliega**: el build lo quita de `dist/`. Las credenciales de producción se
crean a mano en el servidor, una sola vez.

### Frontend (React)

```
src/analitica/useRegistrarVisita.js, preferencias.js
src/pages/admin/  Admin.jsx · Admin.css · Tablero.jsx · Tablero.css · Login.jsx
                  MarcoAdmin.jsx · api.js · formato.js · useConsultaMedia.js
src/pages/admin/componentes/  GraficoSerie.jsx · Ranking.jsx
                              TarjetaResumen.jsx · TablaRecientes.jsx
```

### Compartidos que se tocaron

```
src/App.jsx                       Ruta /admin, fuera de Layout
src/components/layout/Layout.jsx  Monta el tracker (así el panel queda fuera)
scripts/prerender.mjs             Genera dist/admin/index.html con noindex
public/robots.txt                 Disallow: /admin y /api/
vite.config.js                    Proxy de /api en dev + quita el config del build
.gitignore                        Ignora public/api/config.php
README.md                         Sección "Analítica y panel de administración"
```

---

## 4. Para ponerlo en producción

Los pasos completos están en el README, sección *Analítica y panel de
administración*. Resumen:

1. hPanel → Bases de datos → crear base. Anotar los cuatro datos.
2. phpMyAdmin → pestaña SQL → pegar `docs/crear-base-de-datos.sql`.
   (La base en sí **no** se puede crear desde phpMyAdmin: en hosting compartido
   el usuario no tiene privilegio `CREATE DATABASE`.)
3. Crear **en el servidor** el archivo `shinka-config.php`, un nivel arriba de
   `public_html`, con los datos de MySQL y una `salt` aleatoria.
4. `npm run build` y subir `dist/` a `public_html`.
5. Abrir `shinkastudio.dev/api/instalar.php`, crear usuario y contraseña.
   (Este paso no se puede hacer por SQL: la contraseña va con bcrypt y MySQL no
   sabe calcularlo.)
6. **Borrar `api/instalar.php` del hosting.**

---

## 5. Qué quedó verificado, y cómo

Se instaló PHP 8.3.36 y se levantó una MariaDB aislada para probar de verdad
contra MySQL. Todo lo de abajo se ejecutó, no se razonó.

### Backend

- `php -l` limpio en los 9 archivos.
- **84 comprobaciones automatizadas** de clasificación de origen, lectura de
  user agent y detección de bots.
- El `.sql` ejecutado con un usuario sin privilegios de admin (como en
  Hostinger): crea las 4 tablas con sus 10 índices. Ejecutado dos veces para
  confirmar que es idempotente.
- Instalador: chequeos de entorno, validación, alta con bcrypt costo 12,
  autobloqueo al segundo intento.
- Login: contador de intentos restantes; usuario inexistente devuelve el mismo
  mensaje que una clave mal (no filtra qué usuarios existen); bloqueo a los 8
  fallos que frena **incluso con la clave correcta**.
- **`stats.php` devuelve 401 sin sesión.** Era la afirmación central de
  seguridad; está probada, no argumentada.
- Logout invalida la sesión.
- `track.php`: 204 siempre, 403 ante Origin ajeno, y verificado en la base la
  atribución de primer contacto, el user agent, el filtrado de bots, el descarte
  de `/admin`, la normalización de barra final y URL completa, y el tope de 40
  por minuto (se mandaron 50, guardó 40 exactas).
- Aritmética del panel con 1050 registros de 415 visitantes en 60 días:
  627 visitas vs 431 del período anterior = +45,5%; 627/251 = 2,5 páginas por
  visitante. La serie trae los 30 puntos con los días vacíos en cero.
- Geolocalización contra el servicio real: IPs argentinas → AR/Argentina.
  Caché de 338 ms a 0 ms.
- Cero warnings de PHP en el log del servidor en toda la tanda.

### Frontend

- Lint y build limpios. `dist/admin/index.html` con `noindex`, fuera del sitemap.
- Login → tablero, los tres rangos, tooltip, crosshair, "ver tabla", opt-out.
- Probado contra la API real: encoding con tildes correcto, orígenes reales con
  sus etiquetas, dominio no mapeado mostrado tal cual.
- Tracker medido con el contador del propio panel: 3 cargas de página = 3
  visitas (sin el dedupe habrían sido 6, porque StrictMode dobla los efectos en
  desarrollo). Con el opt-out puesto, dos cargas más no registraron nada.
  Visitantes únicos se mantuvo estable: el hash funciona.
- Móvil a 390 px: alto del gráfico de 124 px a ~273 px, texto de los ejes de
  ~5 px a ~11 px.

---

## 6. Defectos encontrados y corregidos

Ocho del backend:

1. **`chatgpt.com` se clasificaba como "X (Twitter)".** El mapa de orígenes
   buscaba subcadenas y `"chatgpt.com"` contiene `"t.co"`. El alcance real era
   mucho mayor: **cualquier dominio terminado en `t.com`** caía en X
   (`client.com`, `market.com`, `product.com`). Reescrito con coincidencia de
   dominio exacto o subdominio. Habría reportado referidos mal sin que se note,
   porque el total igual sumaba.
2. **El config local se filtraba al build.** `dist/api/config.php` salía con las
   credenciales de la base de prueba apuntando a `127.0.0.1:3307`. Subir ese
   `dist/` habría matado el panel en producción y pisado el config del servidor.
   Ahora el build lo quita y avisa, y la API le da prioridad al config de arriba
   de `public_html`.
3. **El instalador dejaba sin formulario.** Si la validación fallaba, mostraba
   los errores pero no volvía a dibujar el formulario: había que recargar a
   mano. Mezclaba errores de entorno con errores de formulario.
4. **Una caída pasajera de la geolocalización dejaba sin país por un mes.** Se
   cacheaba el nulo 30 días. Ahora las respuestas buenas valen 30 días y las
   fallidas 1.
5. **`sesion.php` mezclaba dos problemas distintos.** "Nunca corriste el
   instalador" y "MySQL no responde" llegaban idénticos al panel. Ahora devuelve
   `config_ok`, `base_ok` e `instalado` separados.
6. **El redespliegue se comía la configuración**, y con ella el conteo de
   visitas en silencio (porque `track.php` falla callado por diseño). Resuelto
   con la ubicación arriba de `public_html` y documentado.
7. **El hash señuelo del login no era un bcrypt válido**, así que
   `password_verify` cortaba de inmediato y no igualaba los tiempos de
   respuesta. Ahora se calcula un bcrypt real descartable.
8. **`stats.php` podía devolver una página de error en vez de JSON** ante una
   excepción que no fuera de PDO. Agregada la red de contención.

Tres del frontend:

1. Texto de los ejes del gráfico dibujado a ~5 px en un teléfono.
2. `dias=1` producía "+90,3% vs. los **1 días** anteriores".
3. `dias=1` producía "Del 6 de noviembre de 2026 al 6 de noviembre de 2026".

---

## 7. Qué NO está verificado

| Qué | Por qué |
| --- | --- |
| **El backend contra Hostinger** | Nunca corrió ahí. Corrió entero contra MySQL en local, así que el riesgo bajó mucho, pero la primera ejecución real es al subirlo. |
| **El panel en un teléfono real** | Se midió con un iframe de 390 px, no con un dispositivo. |
| **El salto visual al hidratar en móvil** | El HTML prerenderizado sale con el gráfico ancho y al hidratar salta al alto. Es un reflow de una vez por carga. Se aceptó a propósito: la alternativa era medir el contenedor, que trae bastante complejidad. Si molesta, se resuelve reservando la altura por CSS. |
| **El vencimiento de sesión a las 2 horas** | La lógica está revisada pero no se esperaron 2 horas. |

---

## 8. Entorno de prueba local

### Instalado en esta máquina

**PHP 8.3.36**, con winget (paquete oficial de php.net, hash verificado), en
`%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_*`. Se le configuró el
`php.ini` con `pdo_mysql`, `curl`, `openssl`, `mbstring`, la zona horaria de
Buenos Aires y el bundle de certificados (`cacert.pem`).

**MariaDB:** no se instaló nada. Se usó el binario portable que ya estaba en
`G:\Proyectos\tienda-demo(servidor)\herramientas\mariadb` (11.8.9), pero
levantando una **instancia aparte**, con directorio de datos propio y puerto
3307, para no tocar los datos de `tienda-demo`.

### Datos y credenciales de prueba

- Base `shinka_local`, usuario MySQL `shinka` / `prueba-local-2026`, puerto 3307.
- Usuario del panel: **`facu` / `clave-de-prueba-2026`**.
- ~1050 registros sembrados en 60 días, más unas 40 filas en `/servicios` que
  dejó la prueba del tope por minuto y unas 5 visitas de prueba del navegador.
  Para limpiar: `TRUNCATE TABLE visitas;` (no toca el usuario del panel).

### Importante

El directorio de datos de MariaDB está en el **scratchpad de la sesión, que es
temporal**. Si se quiere una base local que sobreviva, hay que recrearla en una
ruta fija: los comandos están en el README, sección *Desarrollo local*.

**Los dos procesos de fondo (PHP en el 8000 y MariaDB en el 3307) fueron
detenidos por el sistema** por falta de memoria en la máquina. No es una falla
de los procesos ni de la prueba: las verificaciones se habían completado antes.

---

## 9. Pendientes

1. **Autorizar los commits.** Nada está commiteado y las dos partes del trabajo
   conviven sin commitear en el mismo working tree, que es el estado más
   frágil: un `git checkout -- .`, un `git clean` o un `git stash` borra todo.
   Lo acordado entre las dos sesiones: commits de un solo tema, `git add` por
   ruta explícita, nunca `-A` ni `-a`.
2. **Subirlo a Hostinger** siguiendo los 6 pasos del README.
3. **Mirar el panel en un teléfono** después de subirlo.

### Reparto del trabajo

Dos sesiones trabajaron en paralelo sobre el mismo repo. Esta sesión hizo el
backend, el `.sql`, el entorno de prueba y la documentación, y definió las
decisiones de diseño y el contrato de la API. La sesión `shinka-studio-d0` hizo
el panel React y el tracker; **terminó y se quedó sin cuota de uso**, así que ya
no está disponible.
