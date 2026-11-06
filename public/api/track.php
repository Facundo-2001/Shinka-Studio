<?php
/**
 * POST /api/track.php — registra una visita.
 *
 * Es público (lo llama el sitio en cada cambio de ruta) y está escrito para
 * no molestar nunca al visitante: ante cualquier problema responde 204 y se
 * calla. Un error de analítica no puede romper la página.
 *
 * Cuerpo esperado (JSON, todo opcional salvo `ruta`):
 *   { "ruta": "/servicios", "referrer": "https://www.google.com/" }
 *
 * Lo que NO se guarda: la IP. Se guarda un hash diario irreversible de la IP
 * para poder contar visitantes únicos sin almacenar datos personales.
 */

declare(strict_types=1);

define('SHINKA_API', true);
require __DIR__ . '/lib/comun.php';

/** Respuesta silenciosa: la analítica nunca devuelve un error al visitante. */
function sin_contenido(): void
{
    if (!headers_sent()) {
        http_response_code(204);
        header('Cache-Control: no-store');
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    sin_contenido();
}

/**
 * Sin configuración no hay dónde guardar nada. Se corta acá, en silencio,
 * antes de que cfg() conteste con un error en JSON: el sitio no tiene por qué
 * recibir un 500 en cada página vista solo porque falta instalar la base.
 */
if (ruta_config() === null) {
    sin_contenido();
}

exigir_origen_propio();

/**
 * Normaliza la ruta: deja solo el camino, sin query ni ancla, y acotado.
 * Devuelve null si no parece una ruta del sitio.
 */
function normalizar_ruta(string $valor): ?string
{
    $valor = trim($valor);
    if ($valor === '') {
        return null;
    }

    // Si llegó una URL completa, se queda con el path.
    $camino = parse_url($valor, PHP_URL_PATH);
    if (!is_string($camino) || $camino === '') {
        $camino = $valor;
    }

    if ($camino[0] !== '/') {
        $camino = '/' . $camino;
    }

    // Saca la barra final (salvo en la raíz) para que /servicios y
    // /servicios/ no se cuenten como dos páginas distintas.
    if (strlen($camino) > 1) {
        $camino = rtrim($camino, '/');
        if ($camino === '') {
            $camino = '/';
        }
    }

    if (!preg_match('#^/[\w\-/.%]*$#u', $camino)) {
        return null;
    }

    return substr($camino, 0, 255);
}

try {
    $cuerpo = cuerpo_json();

    $ruta = normalizar_ruta((string) ($cuerpo['ruta'] ?? ''));
    if ($ruta === null) {
        sin_contenido();
    }

    // El panel no se cuenta a sí mismo.
    if ($ruta === '/admin' || str_starts_with($ruta, '/admin/')) {
        sin_contenido();
    }

    $ua       = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 512);
    $ip       = ip_cliente();
    $ahora    = new DateTimeImmutable('now');
    $dia      = $ahora->format('Y-m-d');
    $visitante = hash_visitante($ip, $ua, $dia);
    $bot      = es_bot($ua);

    $referrer = substr(trim((string) ($cuerpo['referrer'] ?? '')), 0, 255);
    if ($referrer !== '' && !filter_var($referrer, FILTER_VALIDATE_URL)) {
        $referrer = '';
    }

    $db = db();

    /**
     * Tope de seguridad: 40 registros por visitante por minuto. Sin esto,
     * cualquiera podría inflar el contador llamando al endpoint en bucle.
     */
    $reciente = $db->prepare(
        'SELECT COUNT(*) FROM visitas
          WHERE visitante_hash = ? AND creado_en > DATE_SUB(NOW(), INTERVAL 1 MINUTE)'
    );
    $reciente->execute([$visitante]);
    if ((int) $reciente->fetchColumn() >= 40) {
        sin_contenido();
    }

    /**
     * Atribución de primer contacto: el origen de la visita es el de su
     * primer registro del día. Hace falta porque en una SPA `document.referrer`
     * no cambia al navegar entre páginas, así que sin esto una misma llegada
     * desde Instagram se contaría una vez por página vista.
     */
    $primero = $db->prepare(
        'SELECT origen FROM visitas
          WHERE visitante_hash = ? AND dia = ?
          ORDER BY id ASC LIMIT 1'
    );
    $primero->execute([$visitante, $dia]);
    $origen_previo = $primero->fetchColumn();

    $origen = is_string($origen_previo) && $origen_previo !== ''
        ? $origen_previo
        : clasificar_origen($referrer);

    $ua_datos = analizar_ua($ua);

    // El país solo se resuelve para visitantes reales y una vez por IP.
    $geo = $bot ? ['codigo' => null, 'pais' => null] : geo_pais($db, $ip);

    $insertar = $db->prepare(
        'INSERT INTO visitas
            (creado_en, dia, ruta, visitante_hash, origen, referrer,
             dispositivo, navegador, sistema, pais_codigo, pais, es_bot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    $insertar->execute([
        $ahora->format('Y-m-d H:i:s'),
        $dia,
        $ruta,
        $visitante,
        $origen,
        $referrer !== '' ? $referrer : null,
        $ua_datos['dispositivo'],
        $ua_datos['navegador'],
        $ua_datos['sistema'],
        $geo['codigo'],
        $geo['pais'],
        $bot ? 1 : 0,
    ]);
} catch (Throwable $e) {
    // A propósito en silencio: si la analítica falla, el sitio sigue andando.
    error_log('[shinka/track] ' . $e->getMessage());
}

sin_contenido();
