<?php
/**
 * =========================================================
 *  Base común de la API de analítica — Shinka Studio
 * =========================================================
 *  Todo lo que comparten los endpoints: configuración, conexión a MySQL,
 *  respuestas JSON, lectura del visitante y sesión del panel.
 *
 *  Este archivo nunca se sirve por HTTP (ver lib/.htaccess): solo se
 *  incluye desde los endpoints de /api, que definen SHINKA_API.
 */

declare(strict_types=1);

if (!defined('SHINKA_API')) {
    http_response_code(403);
    exit('Acceso directo no permitido.');
}

/** Costo del bcrypt de las contraseñas del panel. Mismo valor al crear y al verificar. */
const COSTO_BCRYPT = 12;

// =========================================================
//  Configuración
// =========================================================

/**
 * Ruta del archivo de configuración que se va a usar, o null si no hay ninguno.
 *
 * Se busca en dos lugares, en este orden:
 *
 *   1. ../shinka-config.php (un nivel arriba de public_html) — el del servidor.
 *   2. api/config.php — el que se usa en desarrollo.
 *
 * GANA EL DE ARRIBA DE public_html, y el orden es a propósito: si alguna vez
 * se sube por error un `api/config.php` de desarrollo (apuntando a una base
 * local), el servidor lo ignora y sigue usando el suyo. Al revés, el archivo
 * subido por error se llevaría puesto el sitio en producción.
 *
 * En desarrollo no existe nada arriba de public_html, así que se usa el de api/.
 */
function ruta_config(): ?string
{
    static $resuelta = false;

    if ($resuelta === false) {
        $resuelta = null;

        $candidatos = [
            __DIR__ . '/../../../shinka-config.php',  // un nivel arriba de public_html
            __DIR__ . '/../config.php',               // public_html/api/config.php
        ];

        foreach ($candidatos as $candidato) {
            if (is_file($candidato)) {
                $resuelta = $candidato;
                break;
            }
        }
    }

    return $resuelta;
}

function cfg(?string $clave = null)
{
    static $cfg = null;

    if ($cfg === null) {
        $ruta = ruta_config();

        if ($ruta === null) {
            responder([
                'ok'      => false,
                'error'   => 'sin_configuracion',
                'mensaje' => 'Falta el archivo de configuración. Copiá api/config.example.php '
                    . 'como api/config.php (o como shinka-config.php un nivel arriba de public_html) '
                    . 'y completá los datos de MySQL.',
            ], 500);
        }

        $cfg = require $ruta;
        date_default_timezone_set($cfg['zona_horaria'] ?? 'America/Argentina/Buenos_Aires');
    }

    return $clave === null ? $cfg : ($cfg[$clave] ?? null);
}

// =========================================================
//  Respuestas JSON
// =========================================================

/** Responde en JSON y termina la ejecución. */
function responder(array $datos, int $codigo = 200): void
{
    if (!headers_sent()) {
        http_response_code($codigo);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
    }
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_api(string $error, string $mensaje, int $codigo = 400): void
{
    responder(['ok' => false, 'error' => $error, 'mensaje' => $mensaje], $codigo);
}

/** Lee el cuerpo JSON de un POST. Devuelve [] si no hay o no es válido. */
function cuerpo_json(): array
{
    $crudo = file_get_contents('php://input');
    if ($crudo === false || $crudo === '') {
        return [];
    }
    $datos = json_decode($crudo, true);

    return is_array($datos) ? $datos : [];
}

/** Solo acepta el método pedido. */
function exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        error_api('metodo_invalido', "Este endpoint solo acepta $metodo.", 405);
    }
}

/**
 * Rechaza los POST que no vengan del propio sitio.
 * Con la cookie de sesión en SameSite=Lax esto cubre el CSRF sin necesidad
 * de un token: una página de otro dominio no puede falsear el header Origin.
 */
function exigir_origen_propio(): void
{
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origen === '') {
        return; // Same-origin: varios navegadores no mandan Origin. La cookie Lax ya protege.
    }

    $host    = strtolower((string) parse_url($origen, PHP_URL_HOST));
    $propios = array_map('strtolower', cfg('dominios_propios') ?: []);

    if (!in_array($host, $propios, true)) {
        error_api('origen_no_permitido', 'Pedido rechazado: viene de otro dominio.', 403);
    }
}

// =========================================================
//  Base de datos
// =========================================================

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $db = cfg('db');

        // El puerto es opcional: en el hosting es siempre el 3306.
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $db['host'],
            (int) ($db['puerto'] ?? 3306),
            $db['nombre']
        );

        $pdo = new PDO($dsn, $db['usuario'], $db['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    return $pdo;
}

/**
 * Crea las tablas si no existen. Lo usa instalar.php.
 * El mismo DDL está en docs/crear-base-de-datos.sql para ejecutarlo a mano
 * en phpMyAdmin.
 */
function crear_tablas(PDO $db): void
{
    $db->exec("
        CREATE TABLE IF NOT EXISTS visitas (
            id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            creado_en       DATETIME        NOT NULL,
            dia             DATE            NOT NULL,
            ruta            VARCHAR(255)    NOT NULL,
            visitante_hash  CHAR(64)        NOT NULL,
            origen          VARCHAR(80)     NOT NULL DEFAULT 'directo',
            referrer        VARCHAR(255)    NULL,
            dispositivo     VARCHAR(16)     NOT NULL DEFAULT 'desconocido',
            navegador       VARCHAR(32)     NOT NULL DEFAULT 'Otro',
            sistema         VARCHAR(32)     NOT NULL DEFAULT 'Otro',
            pais_codigo     CHAR(2)         NULL,
            pais            VARCHAR(64)     NULL,
            es_bot          TINYINT(1)      NOT NULL DEFAULT 0,
            PRIMARY KEY (id),
            KEY idx_dia (dia, es_bot),
            KEY idx_ruta (ruta, dia),
            KEY idx_visitante (visitante_hash, dia),
            KEY idx_origen (origen, dia)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_usuarios (
            id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
            usuario        VARCHAR(64)  NOT NULL,
            password_hash  VARCHAR(255) NOT NULL,
            creado_en      DATETIME     NOT NULL,
            ultimo_acceso  DATETIME     NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uq_usuario (usuario)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_intentos (
            id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            ip_hash   CHAR(64)        NOT NULL,
            creado_en DATETIME        NOT NULL,
            PRIMARY KEY (id),
            KEY idx_ip (ip_hash, creado_en)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS geo_cache (
            ip_hash        CHAR(64)    NOT NULL,
            pais_codigo    CHAR(2)     NULL,
            pais           VARCHAR(64) NULL,
            actualizado_en DATETIME    NOT NULL,
            PRIMARY KEY (ip_hash)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

// =========================================================
//  Datos del visitante
// =========================================================

/**
 * IP del visitante. Si REMOTE_ADDR es una dirección interna, el sitio está
 * detrás del proxy del hosting y la IP real viene en una cabecera reenviada.
 */
function ip_cliente(): string
{
    $remota = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    $publica = FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;

    if (filter_var($remota, FILTER_VALIDATE_IP, $publica)) {
        return $remota;
    }

    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP'] as $cabecera) {
        foreach (explode(',', $_SERVER[$cabecera] ?? '') as $candidata) {
            $candidata = trim($candidata);
            if (filter_var($candidata, FILTER_VALIDATE_IP, $publica)) {
                return $candidata;
            }
        }
    }

    return $remota;
}

/**
 * Identificador diario del visitante.
 *
 * NO se guarda la IP: se guarda sha256(sal + IP + navegador + día), que no se
 * puede revertir y cambia todos los días. Alcanza para contar visitantes
 * únicos por día sin almacenar ningún dato personal.
 */
function hash_visitante(string $ip, string $ua, string $dia): string
{
    return hash('sha256', cfg('salt') . '|' . $ip . '|' . $ua . '|' . $dia);
}

function hash_ip(string $ip): string
{
    return hash('sha256', cfg('salt') . '|ip|' . $ip);
}

/** Buscadores, redes y monitores: se guardan marcados para no contarlos como visitas. */
function es_bot(string $ua): bool
{
    if (trim($ua) === '') {
        return true;
    }

    $patrones = [
        'bot', 'crawl', 'spider', 'slurp', 'fetch', 'monitor', 'scan',
        'curl', 'wget', 'python-requests', 'okhttp', 'axios', 'go-http-client',
        'headless', 'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptime',
        'facebookexternalhit', 'whatsapp', 'telegram', 'discord', 'slack',
        'embedly', 'preview', 'validator', 'archiver', 'ahrefs', 'semrush',
        'mj12', 'dotbot', 'petalbot', 'dataprovider', 'bytespider', 'gptbot',
        'claudebot', 'ccbot', 'perplexity',
    ];

    $ua = strtolower($ua);
    foreach ($patrones as $patron) {
        if (str_contains($ua, $patron)) {
            return true;
        }
    }

    return false;
}

/** Dispositivo, navegador y sistema operativo a partir del user agent. */
function analizar_ua(string $ua): array
{
    $u = strtolower($ua);

    // --- Dispositivo ---
    if ($u === '') {
        $dispositivo = 'desconocido';
    } elseif (str_contains($u, 'ipad') || str_contains($u, 'tablet')
        || (str_contains($u, 'android') && !str_contains($u, 'mobile'))) {
        $dispositivo = 'tablet';
    } elseif (str_contains($u, 'mobi') || str_contains($u, 'iphone')
        || str_contains($u, 'ipod') || str_contains($u, 'android')) {
        $dispositivo = 'movil';
    } else {
        $dispositivo = 'escritorio';
    }

    // --- Navegador. El orden importa: casi todos dicen "Safari" o "Chrome". ---
    $navegadores = [
        'Edge'     => ['edg/', 'edge/', 'edga/', 'edgios/'],
        'Opera'    => ['opr/', 'opera', 'opios/'],
        'Samsung'  => ['samsungbrowser'],
        'Brave'    => ['brave'],
        'Vivaldi'  => ['vivaldi'],
        'Firefox'  => ['firefox/', 'fxios/'],
        'Chrome'   => ['chrome/', 'crios/', 'chromium'],
        'Safari'   => ['safari/'],
        'Explorer' => ['msie', 'trident/'],
    ];

    $navegador = 'Otro';
    foreach ($navegadores as $nombre => $marcas) {
        foreach ($marcas as $marca) {
            if (str_contains($u, $marca)) {
                $navegador = $nombre;
                break 2;
            }
        }
    }

    // --- Sistema operativo ---
    $sistemas = [
        'Android'  => ['android'],
        'iOS'      => ['iphone', 'ipad', 'ipod'],
        'Windows'  => ['windows'],
        'macOS'    => ['macintosh', 'mac os x'],
        'ChromeOS' => ['cros'],
        'Linux'    => ['linux', 'ubuntu', 'fedora'],
    ];

    $sistema = 'Otro';
    foreach ($sistemas as $nombre => $marcas) {
        foreach ($marcas as $marca) {
            if (str_contains($u, $marca)) {
                $sistema = $nombre;
                break 2;
            }
        }
    }

    return [
        'dispositivo' => $dispositivo,
        'navegador'   => $navegador,
        'sistema'     => $sistema,
    ];
}

/**
 * De dónde llegó la visita, a partir del referrer.
 * Devuelve un identificador corto y estable ('google', 'instagram', ...);
 * si no reconoce el dominio, devuelve el dominio tal cual.
 */
function clasificar_origen(string $referrer): string
{
    if (trim($referrer) === '') {
        return 'directo';
    }

    $host = strtolower((string) parse_url($referrer, PHP_URL_HOST));
    if ($host === '') {
        return 'directo';
    }

    $host = (string) preg_replace('/^www\./', '', $host);

    $propios = array_map(
        static fn ($d) => (string) preg_replace('/^www\./', '', strtolower((string) $d)),
        cfg('dominios_propios') ?: []
    );
    if (in_array($host, $propios, true)) {
        return 'interno';
    }

    /**
     * Coincide el dominio exacto o cualquiera de sus subdominios.
     *
     * Importa que sea así y NO una búsqueda de subcadena: 'chatgpt.com'
     * contiene la subcadena 't.co', así que buscando subcadenas se
     * clasificaba como X, igual que cualquier dominio terminado en 't.com'
     * ('client.com', 'market.com'...).
     */
    $es = static fn (string $dominio): bool =>
        $host === $dominio || str_ends_with($host, '.' . $dominio);

    /**
     * Los webmails van primero: mail.google.com es un subdominio de
     * google.com, pero una visita que llega desde ahí vino de un correo,
     * no del buscador.
     */
    $correo = [
        'mail.google.com', 'outlook.com', 'outlook.live.com',
        'outlook.office.com', 'outlook.office365.com', 'mail.yahoo.com',
    ];
    foreach ($correo as $dominio) {
        if ($es($dominio)) {
            return 'email';
        }
    }
    if (str_starts_with($host, 'webmail.')) {
        return 'email';
    }

    $mapa = [
        'instagram'  => ['instagram.com'],
        'whatsapp'   => ['whatsapp.com', 'wa.me'],
        'facebook'   => ['facebook.com', 'fb.me', 'fb.com', 'fb.watch'],
        'bing'       => ['bing.com', 'msn.com'],
        'duckduckgo' => ['duckduckgo.com'],
        'ecosia'     => ['ecosia.org'],
        'x'          => ['x.com', 'twitter.com', 't.co'],
        'linkedin'   => ['linkedin.com', 'lnkd.in'],
        'youtube'    => ['youtube.com', 'youtu.be'],
        'tiktok'     => ['tiktok.com'],
        'github'     => ['github.com'],
        'reddit'     => ['reddit.com'],
        'chatgpt'    => ['chatgpt.com', 'openai.com'],
        'claude'     => ['claude.ai'],
        'gemini'     => ['gemini.google.com'],
        'perplexity' => ['perplexity.ai'],
    ];

    foreach ($mapa as $origen => $dominios) {
        foreach ($dominios as $dominio) {
            if ($es($dominio)) {
                return $origen;
            }
        }
    }

    /**
     * Google y Yahoo tienen un dominio por país (google.com.ar, google.es,
     * yahoo.co.jp), así que van por patrón y no por lista. Van al final para
     * que gemini.google.com y mail.google.com ya hayan salido antes.
     */
    if (preg_match('/^(.+\.)?google(\.[a-z]{2,4}){1,2}$/', $host)) {
        return 'google';
    }
    if (preg_match('/^(.+\.)?yahoo(\.[a-z]{2,4}){1,2}$/', $host)) {
        return 'yahoo';
    }
    if ($es('googleusercontent.com') || $es('googleadservices.com')) {
        return 'google';
    }

    return substr($host, 0, 80);
}

/**
 * País aproximado de la visita.
 *
 * Se consulta una sola vez por IP y se guarda en caché 30 días. Si el servicio
 * externo falla o está desactivado en config.php devuelve nulos: la visita se
 * registra igual, solo sin país.
 */
function geo_pais(PDO $db, string $ip): array
{
    $vacio = ['codigo' => null, 'pais' => null];

    if (!cfg('geo')) {
        return $vacio;
    }
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return $vacio;
    }

    $clave = hash_ip($ip);

    /**
     * Las respuestas buenas valen 30 días; las fallidas, solo 1.
     *
     * Si se cachearan las dos por 30 días, una caída pasajera del servicio
     * (o, como pasó al probar esto, un PHP sin bundle de certificados) deja
     * a ese visitante sin país durante un mes.
     */
    $cache = $db->prepare(
        'SELECT pais_codigo, pais FROM geo_cache
          WHERE ip_hash = ?
            AND (
                  (pais_codigo IS NOT NULL AND actualizado_en > DATE_SUB(NOW(), INTERVAL 30 DAY))
               OR (pais_codigo IS NULL     AND actualizado_en > DATE_SUB(NOW(), INTERVAL 1 DAY))
            )'
    );
    $cache->execute([$clave]);
    if ($fila = $cache->fetch()) {
        return ['codigo' => $fila['pais_codigo'], 'pais' => $fila['pais']];
    }

    $resultado = consultar_geo($ip);

    $db->prepare(
        'INSERT INTO geo_cache (ip_hash, pais_codigo, pais, actualizado_en)
              VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE pais_codigo    = VALUES(pais_codigo),
                                 pais           = VALUES(pais),
                                 actualizado_en = VALUES(actualizado_en)'
    )->execute([$clave, $resultado['codigo'], $resultado['pais']]);

    return $resultado;
}

/** Llamada al servicio de geolocalización. Falla en silencio a propósito. */
function consultar_geo(string $ip): array
{
    $vacio = ['codigo' => null, 'pais' => null];
    $url   = 'https://ipwho.is/' . urlencode($ip) . '?fields=success,country,country_code';
    $json  = null;

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 2,
            CURLOPT_CONNECTTIMEOUT => 1,
            CURLOPT_USERAGENT      => 'ShinkaStudio-Analitica/1.0',
        ]);
        $json = curl_exec($ch);
        curl_close($ch);
    } elseif (ini_get('allow_url_fopen')) {
        $contexto = stream_context_create(['http' => [
            'timeout' => 2,
            'header'  => "User-Agent: ShinkaStudio-Analitica/1.0\r\n",
        ]]);
        $json = @file_get_contents($url, false, $contexto);
    }

    if (!is_string($json) || $json === '') {
        return $vacio;
    }

    $datos = json_decode($json, true);
    if (!is_array($datos) || empty($datos['success']) || empty($datos['country_code'])) {
        return $vacio;
    }

    return [
        'codigo' => strtoupper(substr((string) $datos['country_code'], 0, 2)),
        'pais'   => substr((string) ($datos['country'] ?? ''), 0, 64) ?: null,
    ];
}

// =========================================================
//  Sesión del panel
// =========================================================

function iniciar_sesion_panel(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';

    session_name('shinka_panel');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'secure'   => $https,
        'samesite' => 'Lax',
    ]);
    session_start();
}

/** Devuelve el usuario con sesión abierta, o null si no hay o venció. */
function usuario_actual(): ?array
{
    iniciar_sesion_panel();

    if (empty($_SESSION['admin_id'])) {
        return null;
    }

    $limite = (int) (cfg('minutos_sesion') ?: 120);
    $ultimo = (int) ($_SESSION['visto_en'] ?? 0);

    if ($limite > 0 && $ultimo > 0 && (time() - $ultimo) > $limite * 60) {
        cerrar_sesion_panel();
        return null;
    }

    $_SESSION['visto_en'] = time();

    return [
        'id'      => (int) $_SESSION['admin_id'],
        'usuario' => (string) ($_SESSION['admin_usuario'] ?? ''),
    ];
}

/**
 * Puerta de entrada de todo endpoint privado.
 * La autorización vive acá, en el servidor: el panel de React solo decide
 * qué dibuja, nunca si los datos se entregan.
 */
function exigir_sesion(): array
{
    $usuario = usuario_actual();
    if ($usuario === null) {
        error_api('sin_sesion', 'Necesitás iniciar sesión.', 401);
    }

    return $usuario;
}

function cerrar_sesion_panel(): void
{
    iniciar_sesion_panel();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires'  => time() - 42000,
            'path'     => $p['path'],
            'secure'   => $p['secure'],
            'httponly' => $p['httponly'],
            'samesite' => $p['samesite'] ?? 'Lax',
        ]);
    }

    session_destroy();
}

/** Frena la fuerza bruta: 8 intentos fallidos por IP cada 15 minutos. */
function intentos_restantes(PDO $db, string $ip): int
{
    $maximo = 8;

    $consulta = $db->prepare(
        'SELECT COUNT(*) FROM admin_intentos
          WHERE ip_hash = ? AND creado_en > DATE_SUB(NOW(), INTERVAL 15 MINUTE)'
    );
    $consulta->execute([hash_ip($ip)]);

    return max(0, $maximo - (int) $consulta->fetchColumn());
}

function registrar_intento_fallido(PDO $db, string $ip): void
{
    $db->prepare('INSERT INTO admin_intentos (ip_hash, creado_en) VALUES (?, NOW())')
        ->execute([hash_ip($ip)]);

    // Limpieza oportunista para que la tabla no crezca sin control.
    $db->exec('DELETE FROM admin_intentos WHERE creado_en < DATE_SUB(NOW(), INTERVAL 1 DAY)');
}

function limpiar_intentos(PDO $db, string $ip): void
{
    $db->prepare('DELETE FROM admin_intentos WHERE ip_hash = ?')->execute([hash_ip($ip)]);
}
