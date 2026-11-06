<?php
/**
 * /api/instalar.php — instalación por única vez.
 *
 * Crea las tablas y el usuario del panel. Se bloquea solo: en cuanto existe
 * un administrador deja de funcionar y pide que se borre el archivo.
 *
 * Aun así, BORRALO DEL HOSTING cuando termines. Un archivo que no está no se
 * puede atacar.
 */

declare(strict_types=1);

define('SHINKA_API', true);
require __DIR__ . '/lib/comun.php';

// Incluir comun.php no lee la configuración: eso recién pasa al llamar a cfg().
$config_existe = ruta_config() !== null;

/**
 * Dos listas de errores, a propósito:
 *
 *   $errores      — problemas del entorno (falta config, MySQL no responde,
 *                   PHP viejo). Mientras haya uno, el formulario no se dibuja:
 *                   no tiene sentido pedir datos que no se van a poder guardar.
 *   $errores_form — lo que se escribió mal en el formulario. Acá el formulario
 *                   SÍ se vuelve a dibujar, con el usuario ya cargado, para
 *                   poder corregir sin recargar la página a mano.
 */
$errores      = [];
$errores_form = [];
$listo        = false;
$sal_sugerida = bin2hex(random_bytes(24));

// =========================================================
//  Entorno del servidor
// =========================================================
// Se chequea acá porque es lo primero que conviene descartar cuando algo no
// funciona, y porque desde una máquina sin PHP no hay manera de saberlo antes.

$entorno = [];

$php_ok = PHP_VERSION_ID >= 80000;
$entorno[] = [
    'ok'      => $php_ok,
    'etiqueta' => 'PHP ' . PHP_VERSION,
    'detalle' => $php_ok ? 'Versión soportada.' : 'Hace falta PHP 8.0 o superior.',
];
if (!$php_ok) {
    $errores[] = 'El servidor corre PHP ' . PHP_VERSION . ' y la API necesita 8.0 o superior. '
        . 'Se cambia en hPanel → Avanzado → Configuración de PHP.';
}

$pdo_ok = extension_loaded('pdo_mysql');
$entorno[] = [
    'ok'      => $pdo_ok,
    'etiqueta' => 'Extensión pdo_mysql',
    'detalle' => $pdo_ok ? 'Disponible.' : 'Sin esta extensión no se puede hablar con MySQL.',
];
if (!$pdo_ok) {
    $errores[] = 'Falta la extensión <code>pdo_mysql</code>. Activala en hPanel → Avanzado → Configuración de PHP.';
}

// Esto no bloquea la instalación: sin salida HTTP se pierde el país y nada más.
$salida_ok = function_exists('curl_init') || (bool) ini_get('allow_url_fopen');
$entorno[] = [
    'ok'      => $salida_ok,
    'etiqueta' => 'Salida a internet (para el país)',
    'detalle' => $salida_ok
        ? 'Disponible.'
        : 'Opcional: sin esto las visitas se cuentan igual, pero sin país.',
];

// =========================================================
//  Estado previo
// =========================================================

$db          = null;
$ya_instalado = false;

if ($config_existe) {
    try {
        $db = db();

        if ((string) cfg('salt') === 'CAMBIAR-POR-UNA-CADENA-LARGA-Y-ALEATORIA' || strlen((string) cfg('salt')) < 16) {
            $errores[] = 'En api/config.php la clave <code>salt</code> sigue con el valor de ejemplo. '
                . 'Pegá una cadena larga y aleatoria antes de seguir (abajo hay una generada).';
        }

        // Si la tabla no existe todavía, no hay nadie instalado.
        try {
            $ya_instalado = (bool) $db->query('SELECT COUNT(*) FROM admin_usuarios')->fetchColumn();
        } catch (PDOException $e) {
            $ya_instalado = false;
        }
    } catch (PDOException $e) {
        $errores[] = 'No se pudo conectar con MySQL: <code>' . htmlspecialchars($e->getMessage(), ENT_QUOTES) . '</code><br>'
            . 'Revisá host, nombre de base, usuario y contraseña en api/config.php.';
    }
} else {
    $errores[] = 'Falta el archivo de configuración. Copiá <code>api/config.example.php</code> '
        . 'como <code>api/config.php</code> &mdash; o, mejor, como <code>shinka-config.php</code> '
        . 'un nivel arriba de <code>public_html</code>, donde ningún redespliegue lo pisa &mdash; '
        . 'y completá los datos de MySQL que te da hPanel.';
}

// =========================================================
//  Alta del administrador
// =========================================================

if (
    ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST'
    && $db instanceof PDO
    && !$ya_instalado
    && $errores === []
) {
    $usuario = trim((string) ($_POST['usuario'] ?? ''));
    $clave   = (string) ($_POST['password'] ?? '');
    $clave2  = (string) ($_POST['password2'] ?? '');

    if (!preg_match('/^[a-zA-Z0-9._-]{3,64}$/', $usuario)) {
        $errores_form[] = 'El usuario tiene que tener entre 3 y 64 caracteres: letras, números, punto, guion o guion bajo.';
    }
    if (strlen($clave) < 10) {
        $errores_form[] = 'La contraseña tiene que tener al menos 10 caracteres.';
    }
    if ($clave !== $clave2) {
        $errores_form[] = 'Las dos contraseñas no coinciden.';
    }

    if ($errores_form === []) {
        try {
            crear_tablas($db);

            $db->prepare(
                'INSERT INTO admin_usuarios (usuario, password_hash, creado_en)
                      VALUES (?, ?, NOW())'
            )->execute([
                $usuario,
                password_hash($clave, PASSWORD_BCRYPT, ['cost' => COSTO_BCRYPT]),
            ]);

            $listo        = true;
            $ya_instalado = true;
        } catch (PDOException $e) {
            // Va a la lista del formulario para que se pueda reintentar.
            $errores_form[] = 'Error al escribir en la base: <code>'
                . htmlspecialchars($e->getMessage(), ENT_QUOTES) . '</code>';
        }
    }
}

// =========================================================
//  Vista
// =========================================================

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$e = static fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Instalación del panel | Shinka Studio</title>
  <link rel="icon" type="image/png" href="/logos/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap">
  <style>
    /* Mismos valores que src/styles/tokens.css: este archivo es independiente
       del build de React, así que no puede importar los tokens. */
    :root {
      --brand-950: #06111F; --brand-800: #0F2B47; --brand-700: #164A7C;
      --brand-600: #1E63A8; --brand-100: #DCEBFA; --accent-500: #00C4DB;
      --ink: #0C1724; --slate: #4A5B70; --muted: #6E8097;
      --line: #E3EAF2; --surface: #FFFFFF; --surface-alt: #F6F9FC;
      --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
      --font-body: 'Inter', system-ui, sans-serif;
    }
    * , *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100svh; padding: 3rem 1.25rem;
      display: flex; align-items: flex-start; justify-content: center;
      font-family: var(--font-body); color: var(--slate); line-height: 1.65;
      background: linear-gradient(160deg, var(--brand-950) 0%, var(--brand-800) 55%, var(--brand-700) 100%);
    }
    .caja {
      width: 100%; max-width: 620px; background: var(--surface);
      border-radius: 26px; padding: clamp(1.75rem, 1rem + 3vw, 2.75rem);
      box-shadow: 0 22px 48px -18px rgba(12, 23, 36, 0.45);
    }
    .marca { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.75rem; }
    .marca img { height: 40px; width: auto; }
    .marca span { font-family: var(--font-display); font-weight: 800; color: var(--ink); letter-spacing: -.02em; }
    h1 { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;
         color: var(--ink); letter-spacing: -.03em; margin: 0 0 .5rem; }
    p { margin: 0 0 1rem; }
    .apagado { color: var(--muted); font-size: .925rem; }
    label { display: block; font-family: var(--font-display); font-size: .88rem;
            font-weight: 600; color: var(--ink); margin-bottom: .4rem; }
    .campo { margin-bottom: 1.15rem; }
    input {
      width: 100%; padding: .85rem 1rem; font: inherit; color: var(--ink);
      background: var(--surface-alt); border: 1px solid var(--line);
      border-radius: 12px; transition: border-color 160ms, box-shadow 160ms;
    }
    input:focus { outline: none; border-color: var(--brand-600);
                  box-shadow: 0 0 0 4px rgba(30, 99, 168, .14); }
    button {
      width: 100%; padding: 1rem 1.9rem; font-family: var(--font-display);
      font-size: 1rem; font-weight: 700; color: #fff; cursor: pointer;
      background: linear-gradient(135deg, var(--brand-800) 0%, var(--brand-600) 100%);
      border: 0; border-radius: 999px;
      box-shadow: 0 18px 40px -14px rgba(30, 99, 168, .5);
      transition: transform 280ms, filter 280ms;
    }
    button:hover { transform: translateY(-2px); filter: brightness(1.08); }
    .aviso { padding: 1rem 1.15rem; border-radius: 12px; font-size: .925rem; margin-bottom: 1.15rem; }
    .aviso--error { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
    .aviso--ok    { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
    .aviso--dato  { background: var(--brand-100); border: 1px solid #BBD7F5; color: var(--brand-700); }
    .aviso ul { margin: .5rem 0 0; padding-left: 1.25rem; }
    code, pre {
      font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
      font-size: .85rem;
    }
    pre {
      background: var(--brand-950); color: #CFE6FB; padding: .9rem 1rem;
      border-radius: 12px; overflow-x: auto; margin: .5rem 0 0;
      user-select: all;
    }
    ol { padding-left: 1.3rem; } ol li { margin-bottom: .5rem; }
    a { color: var(--brand-600); }
    .entorno { list-style: none; margin: 0 0 1.5rem; padding: 0; font-size: .9rem; }
    .entorno li {
      display: flex; flex-wrap: wrap; gap: .2rem .6rem; align-items: baseline;
      padding: .6rem .85rem; margin-bottom: .4rem;
      border: 1px solid var(--line); border-radius: 10px;
    }
    .entorno li::before { font-weight: 700; }
    .entorno .si::before { content: '\2713'; color: #059669; }
    .entorno .no::before { content: '\2715'; color: #DC2626; }
    .entorno strong { font-family: var(--font-display); color: var(--ink); }
    .entorno span { color: var(--muted); }
  </style>
</head>
<body>
  <main class="caja">
    <div class="marca">
      <img src="/logos/logo-compacto.png" alt="">
      <span>Shinka Studio</span>
    </div>

<?php if ($listo): ?>

    <h1>Listo</h1>
    <div class="aviso aviso--ok">
      Tablas creadas y administrador <strong><?= $e($_POST['usuario'] ?? '') ?></strong> dado de alta.
    </div>
    <p><strong>Ahora hacé estas dos cosas, en este orden:</strong></p>
    <ol>
      <li><strong>Borrá <code>api/instalar.php</code> del hosting.</strong> Ya cumplió su función y no hace falta más.</li>
      <li>Entrá a <a href="/admin">shinkastudio.dev/admin</a> e iniciá sesión.</li>
    </ol>
    <p class="apagado">
      El panel va a estar vacío hasta que entre la primera visita. Abrí el sitio en
      otro navegador (o en el teléfono) y refrescá el panel para verlo contar.
    </p>

<?php elseif ($ya_instalado): ?>

    <h1>Ya está instalado</h1>
    <div class="aviso aviso--dato">
      Hay un administrador dado de alta, así que el instalador se desactivó solo.
    </div>
    <p>
      <strong>Borrá este archivo del hosting</strong> (<code>api/instalar.php</code>)
      y entrá al panel desde <a href="/admin">shinkastudio.dev/admin</a>.
    </p>
    <p class="apagado">
      ¿Te olvidaste la contraseña? Borrá la fila de la tabla <code>admin_usuarios</code>
      desde phpMyAdmin y volvé a cargar esta página: el instalador se reactiva.
    </p>

<?php else: ?>

    <h1>Instalación del panel</h1>
    <p class="apagado">
      Esto crea las tablas de la base y el usuario con el que vas a entrar a
      <code>/admin</code>. Se hace una sola vez.
    </p>

    <ul class="entorno">
<?php foreach ($entorno as $item): ?>
      <li class="<?= $item['ok'] ? 'si' : 'no' ?>">
        <strong><?= $e($item['etiqueta']) ?></strong>
        <span><?= $e($item['detalle']) ?></span>
      </li>
<?php endforeach; ?>
    </ul>

  <?php $todos = array_merge($errores, $errores_form); ?>
  <?php if ($todos !== []): ?>
    <div class="aviso aviso--error">
      <strong><?= $errores !== [] ? 'Hay que resolver esto antes de seguir:' : 'Revisá esto:' ?></strong>
      <ul><?php foreach ($todos as $error): ?><li><?= $error ?></li><?php endforeach; ?></ul>
    </div>
  <?php endif; ?>

  <?php if ($config_existe && (!$db instanceof PDO || $errores !== [])): ?>
    <div class="aviso aviso--dato">
      Sal aleatoria recién generada, por si te hace falta para <code>config.php</code>:
      <pre><?= $e($sal_sugerida) ?></pre>
    </div>
  <?php endif; ?>

  <?php if ($db instanceof PDO && $errores === []): ?>
    <form method="post" autocomplete="off">
      <div class="campo">
        <label for="usuario">Usuario</label>
        <input id="usuario" name="usuario" required minlength="3" maxlength="64"
               pattern="[a-zA-Z0-9._\-]{3,64}" autocomplete="username"
               value="<?= $e($_POST['usuario'] ?? '') ?>">
      </div>
      <div class="campo">
        <label for="password">Contraseña (mínimo 10 caracteres)</label>
        <input id="password" name="password" type="password" required minlength="10"
               autocomplete="new-password">
      </div>
      <div class="campo">
        <label for="password2">Repetí la contraseña</label>
        <input id="password2" name="password2" type="password" required minlength="10"
               autocomplete="new-password">
      </div>
      <button type="submit">Crear las tablas y el usuario</button>
    </form>
  <?php endif; ?>

<?php endif; ?>
  </main>
</body>
</html>
