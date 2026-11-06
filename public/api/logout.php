<?php
/**
 * POST /api/logout.php — cierra la sesión del panel.
 * Siempre responde ok, haya sesión o no.
 */

declare(strict_types=1);

define('SHINKA_API', true);
require __DIR__ . '/lib/comun.php';

exigir_metodo('POST');
exigir_origen_propio();

cerrar_sesion_panel();

responder(['ok' => true]);
