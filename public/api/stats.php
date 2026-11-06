<?php
/**
 * GET /api/stats.php?dias=30 — métricas agregadas del período.
 *
 * Endpoint privado: exige sesión. Devuelve todo lo que dibuja el panel en
 * una sola llamada, para que el tablero no tenga que hacer seis pedidos.
 *
 * Los bots quedan siempre fuera de los números (se guardan marcados y se
 * informan aparte, en `resumen.bots`).
 */

declare(strict_types=1);

define('SHINKA_API', true);
require __DIR__ . '/lib/comun.php';

exigir_metodo('GET');
exigir_sesion();

/** Días del período. Se acota para que nadie pida un rango que tumbe la consulta. */
$dias = (int) ($_GET['dias'] ?? 30);
$dias = max(1, min(365, $dias));

$hoy   = new DateTimeImmutable('today');
$desde = $hoy->modify('-' . ($dias - 1) . ' days');

// Período anterior, del mismo largo, para comparar.
$desde_prev = $desde->modify('-' . $dias . ' days');
$hasta_prev = $desde->modify('-1 day');

$f = static fn (DateTimeImmutable $d): string => $d->format('Y-m-d');

try {
    $db = db();

    // -----------------------------------------------------
    //  Totales del período y del anterior
    // -----------------------------------------------------

    $totales = $db->prepare(
        'SELECT COUNT(*) AS visitas, COUNT(DISTINCT visitante_hash) AS visitantes
           FROM visitas
          WHERE es_bot = 0 AND dia BETWEEN ? AND ?'
    );

    $totales->execute([$f($desde), $f($hoy)]);
    $actual = $totales->fetch() ?: ['visitas' => 0, 'visitantes' => 0];

    $totales->execute([$f($desde_prev), $f($hasta_prev)]);
    $previo = $totales->fetch() ?: ['visitas' => 0, 'visitantes' => 0];

    $totales->execute([$f($hoy), $f($hoy)]);
    $de_hoy = $totales->fetch() ?: ['visitas' => 0, 'visitantes' => 0];

    $bots = $db->prepare(
        'SELECT COUNT(*) FROM visitas WHERE es_bot = 1 AND dia BETWEEN ? AND ?'
    );
    $bots->execute([$f($desde), $f($hoy)]);

    $historico = $db->query(
        'SELECT COUNT(*) AS visitas, COUNT(DISTINCT visitante_hash) AS visitantes,
                MIN(dia) AS primer_dia
           FROM visitas WHERE es_bot = 0'
    )->fetch() ?: ['visitas' => 0, 'visitantes' => 0, 'primer_dia' => null];

    /** Variación porcentual contra el período anterior. null si no hay con qué comparar. */
    $variacion = static function (int $ahora, int $antes): ?float {
        if ($antes === 0) {
            return null;
        }
        return round((($ahora - $antes) / $antes) * 100, 1);
    };

    $visitas     = (int) $actual['visitas'];
    $visitantes  = (int) $actual['visitantes'];
    $visitas_p   = (int) $previo['visitas'];
    $visitantes_p = (int) $previo['visitantes'];

    $resumen = [
        'visitas'              => $visitas,
        'visitantes'           => $visitantes,
        'visitas_previo'       => $visitas_p,
        'visitantes_previo'    => $visitantes_p,
        'visitas_variacion'    => $variacion($visitas, $visitas_p),
        'visitantes_variacion' => $variacion($visitantes, $visitantes_p),
        'visitas_hoy'          => (int) $de_hoy['visitas'],
        'visitantes_hoy'       => (int) $de_hoy['visitantes'],
        'paginas_por_visitante' => $visitantes > 0 ? round($visitas / $visitantes, 2) : 0.0,
        'bots'                 => (int) $bots->fetchColumn(),
        'historico'            => [
            'visitas'    => (int) $historico['visitas'],
            'visitantes' => (int) $historico['visitantes'],
            'primer_dia' => $historico['primer_dia'],
        ],
    ];

    // -----------------------------------------------------
    //  Serie diaria (con los días vacíos en cero)
    // -----------------------------------------------------

    $consulta = $db->prepare(
        'SELECT dia, COUNT(*) AS visitas, COUNT(DISTINCT visitante_hash) AS visitantes
           FROM visitas
          WHERE es_bot = 0 AND dia BETWEEN ? AND ?
          GROUP BY dia'
    );
    $consulta->execute([$f($desde), $f($hoy)]);

    $por_dia = [];
    foreach ($consulta->fetchAll() as $fila) {
        $por_dia[$fila['dia']] = [
            'visitas'    => (int) $fila['visitas'],
            'visitantes' => (int) $fila['visitantes'],
        ];
    }

    /**
     * El gráfico necesita un punto por día, también los días sin visitas:
     * si se saltan, la línea miente sobre la forma del período.
     */
    $serie  = [];
    $cursor = $desde;
    while ($cursor <= $hoy) {
        $clave = $f($cursor);
        $serie[] = [
            'dia'        => $clave,
            'visitas'    => $por_dia[$clave]['visitas'] ?? 0,
            'visitantes' => $por_dia[$clave]['visitantes'] ?? 0,
        ];
        $cursor = $cursor->modify('+1 day');
    }

    // -----------------------------------------------------
    //  Rankings
    // -----------------------------------------------------

    /**
     * Las páginas se ordenan por visitas (cuántas veces se vio la página).
     * El resto se ordena por visitantes: el origen, el dispositivo y el país
     * son propiedades de la persona, no de la página vista, así que contar
     * páginas vistas le daría más peso a quien navegó más.
     */
    $ranking = static function (PDO $db, string $columna, string $orden, string $desde, string $hasta, int $limite): array {
        /**
         * `$columna` y `$orden` se interpolan en el SQL porque un nombre de
         * columna no puede ir como parámetro preparado. Por eso se validan
         * contra una lista blanca: nada de lo que llega por HTTP entra acá,
         * pero así queda imposible de romper también a futuro.
         */
        $columnas_validas = ['ruta', 'origen', 'dispositivo', 'navegador', 'sistema'];
        $ordenes_validos  = ['visitas', 'visitantes'];

        if (!in_array($columna, $columnas_validas, true) || !in_array($orden, $ordenes_validos, true)) {
            throw new InvalidArgumentException("Columna u orden no permitidos: $columna / $orden");
        }

        $limite = max(1, min(100, $limite));

        $consulta = $db->prepare(
            "SELECT $columna AS clave,
                    COUNT(*) AS visitas,
                    COUNT(DISTINCT visitante_hash) AS visitantes
               FROM visitas
              WHERE es_bot = 0 AND dia BETWEEN ? AND ? AND $columna IS NOT NULL AND $columna <> ''
              GROUP BY $columna
              ORDER BY $orden DESC, clave ASC
              LIMIT $limite"
        );
        $consulta->execute([$desde, $hasta]);

        return array_map(static fn ($f) => [
            'clave'      => (string) $f['clave'],
            'visitas'    => (int) $f['visitas'],
            'visitantes' => (int) $f['visitantes'],
        ], $consulta->fetchAll());
    };

    $d = $f($desde);
    $h = $f($hoy);

    $paginas      = $ranking($db, 'ruta', 'visitas', $d, $h, 15);
    $origenes     = $ranking($db, 'origen', 'visitantes', $d, $h, 12);
    $dispositivos = $ranking($db, 'dispositivo', 'visitantes', $d, $h, 6);
    $navegadores  = $ranking($db, 'navegador', 'visitantes', $d, $h, 10);

    // El país lleva el código ISO además del nombre, para la bandera.
    $consulta = $db->prepare(
        "SELECT pais_codigo, MAX(pais) AS pais,
                COUNT(*) AS visitas,
                COUNT(DISTINCT visitante_hash) AS visitantes
           FROM visitas
          WHERE es_bot = 0 AND dia BETWEEN ? AND ? AND pais_codigo IS NOT NULL
          GROUP BY pais_codigo
          ORDER BY visitantes DESC, pais ASC
          LIMIT 12"
    );
    $consulta->execute([$d, $h]);

    $paises = array_map(static fn ($f) => [
        'clave'      => (string) ($f['pais'] ?: $f['pais_codigo']),
        'codigo'     => (string) $f['pais_codigo'],
        'visitas'    => (int) $f['visitas'],
        'visitantes' => (int) $f['visitantes'],
    ], $consulta->fetchAll());

    // -----------------------------------------------------
    //  Últimas visitas
    // -----------------------------------------------------

    $recientes = $db->query(
        'SELECT creado_en, ruta, origen, dispositivo, navegador, sistema, pais, pais_codigo
           FROM visitas
          WHERE es_bot = 0
          ORDER BY id DESC
          LIMIT 25'
    )->fetchAll();

    responder([
        'ok'    => true,
        'rango' => [
            'dias'       => $dias,
            'desde'      => $d,
            'hasta'      => $h,
            'desde_prev' => $f($desde_prev),
            'hasta_prev' => $f($hasta_prev),
        ],
        'resumen'      => $resumen,
        'serie'        => $serie,
        'paginas'      => $paginas,
        'origenes'     => $origenes,
        'dispositivos' => $dispositivos,
        'navegadores'  => $navegadores,
        'paises'       => $paises,
        'recientes'    => $recientes,
        'geo_activo'   => (bool) cfg('geo'),
    ]);
} catch (PDOException $e) {
    error_log('[shinka/stats] ' . $e->getMessage());
    error_api(
        'sin_base',
        'No se pudieron leer las métricas. Revisá api/config.php o corré api/instalar.php.',
        500
    );
} catch (Throwable $e) {
    // Red de contención: el panel siempre recibe JSON, nunca una página de error.
    error_log('[shinka/stats] ' . $e->getMessage());
    error_api('error_interno', 'Error al calcular las métricas.', 500);
}
