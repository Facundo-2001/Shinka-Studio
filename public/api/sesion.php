<?php
/**
 * GET /api/sesion.php — estado de la instalación y de la sesión.
 *
 * Lo llama el panel al cargar. Nunca devuelve 401: responder "no hay sesión"
 * es una respuesta válida, no un error.
 *
 * Devuelve tres banderas distintas a propósito, porque para el visitante los
 * tres problemas se ven igual pero se resuelven de forma muy distinta:
 *
 *   config_ok = false  → falta el archivo de configuración.
 *   base_ok   = false  → el archivo está, pero MySQL no responde (datos mal).
 *   instalado = false  → la base responde, pero todavía no hay administrador.
 *
 * Sin esta separación, "nunca corriste el instalador" y "la contraseña de
 * MySQL está mal" llegan al panel idénticos, y el cartel manda a reinstalar
 * cuando en realidad hay que revisar la conexión.
 */

declare(strict_types=1);

define('SHINKA_API', true);
require __DIR__ . '/lib/comun.php';

exigir_metodo('GET');

$config_ok = ruta_config() !== null;

if (!$config_ok) {
    responder([
        'ok'          => true,
        'autenticado' => false,
        'config_ok'   => false,
        'base_ok'     => false,
        'instalado'   => false,
        'usuario'     => null,
        'mensaje'     => 'Falta el archivo de configuración de la API.',
    ]);
}

$usuario   = usuario_actual();
$base_ok   = false;
$instalado = false;
$mensaje   = null;

try {
    $instalado = (bool) db()->query('SELECT COUNT(*) FROM admin_usuarios')->fetchColumn();
    $base_ok   = true;
} catch (PDOException $e) {
    error_log('[shinka/sesion] ' . $e->getMessage());

    /**
     * Hay que distinguir dos PDOException distintas: que la tabla no exista
     * todavía (la base responde, falta instalar) de que no se pueda conectar
     * (credenciales mal, MySQL caído). El código 42S02 es "tabla desconocida".
     */
    if ($e->getCode() === '42S02') {
        $base_ok = true;
        $mensaje = 'La base responde pero las tablas no están creadas.';
    } else {
        $mensaje = 'No se pudo conectar con la base de datos.';
    }
}

responder([
    'ok'          => true,
    'autenticado' => $usuario !== null,
    'config_ok'   => true,
    'base_ok'     => $base_ok,
    'instalado'   => $instalado,
    'usuario'     => $usuario !== null ? ['usuario' => $usuario['usuario']] : null,
    'mensaje'     => $mensaje,
]);
