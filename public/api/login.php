<?php
/**
 * POST /api/login.php — abre la sesión del panel.
 *
 * Cuerpo: { "usuario": "...", "password": "..." }
 * Respuesta: { "ok": true, "usuario": { "usuario": "..." } }
 *
 * Protección contra fuerza bruta: 8 intentos fallidos por IP cada 15 minutos.
 */

declare(strict_types=1);

define('SHINKA_API', true);
require __DIR__ . '/lib/comun.php';

exigir_metodo('POST');
exigir_origen_propio();

$cuerpo   = cuerpo_json();
$usuario  = trim((string) ($cuerpo['usuario'] ?? ''));
$password = (string) ($cuerpo['password'] ?? '');

if ($usuario === '' || $password === '') {
    error_api('datos_incompletos', 'Completá usuario y contraseña.', 422);
}

try {
    $db = db();
    $ip = ip_cliente();

    $restantes = intentos_restantes($db, $ip);
    if ($restantes <= 0) {
        error_api(
            'demasiados_intentos',
            'Demasiados intentos fallidos. Probá de nuevo en 15 minutos.',
            429
        );
    }

    $consulta = $db->prepare(
        'SELECT id, usuario, password_hash FROM admin_usuarios WHERE usuario = ? LIMIT 1'
    );
    $consulta->execute([$usuario]);
    $fila = $consulta->fetch();

    /**
     * Si el usuario no existe igual se gasta el tiempo de un bcrypt, para que
     * el tiempo de respuesta no revele qué usuarios están dados de alta.
     */
    if (is_array($fila)) {
        $valido = password_verify($password, (string) $fila['password_hash']);
    } else {
        password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT, ['cost' => COSTO_BCRYPT]);
        $valido = false;
    }

    if (!$valido) {
        registrar_intento_fallido($db, $ip);

        $quedan = max(0, $restantes - 1);
        error_api(
            'credenciales_invalidas',
            $quedan > 0
                ? "Usuario o contraseña incorrectos. Te quedan $quedan intentos."
                : 'Usuario o contraseña incorrectos. Se agotaron los intentos: esperá 15 minutos.',
            401
        );
    }

    limpiar_intentos($db, $ip);

    // Sesión nueva: se regenera el id para evitar fijación de sesión.
    iniciar_sesion_panel();
    session_regenerate_id(true);

    $_SESSION['admin_id']      = (int) $fila['id'];
    $_SESSION['admin_usuario'] = $fila['usuario'];
    $_SESSION['visto_en']      = time();

    $db->prepare('UPDATE admin_usuarios SET ultimo_acceso = NOW() WHERE id = ?')
        ->execute([(int) $fila['id']]);

    responder([
        'ok'      => true,
        'usuario' => ['usuario' => $fila['usuario']],
    ]);
} catch (PDOException $e) {
    error_log('[shinka/login] ' . $e->getMessage());
    error_api(
        'sin_base',
        'No se pudo conectar con la base de datos. Revisá api/config.php o corré api/instalar.php.',
        500
    );
}
