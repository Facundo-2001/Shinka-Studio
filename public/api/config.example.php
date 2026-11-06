<?php
/**
 * Plantilla de configuración de la API.
 *
 * CÓMO USARLA
 *   1. Copiá este archivo con uno de estos dos nombres:
 *
 *        a) `config.php`, en esta misma carpeta. Es lo más directo.
 *
 *        b) `shinka-config.php`, UN NIVEL ARRIBA de `public_html`.
 *           Recomendado en el hosting: ahí no lo alcanza ningún redespliegue
 *           (si alguna vez borrás y volvés a subir `public_html/api`, el de
 *           la opción (a) se pierde) y no queda accesible por HTTP de ninguna
 *           forma, ni siquiera si el .htaccess fallara.
 *
 *      Si existen los dos, gana el de esta carpeta.
 *
 *   2. Completá los datos de la base MySQL que creaste en hPanel
 *      (hPanel → Bases de datos → MySQL: ahí están el nombre de la base,
 *      el usuario y la contraseña).
 *
 *   3. Pegá en `salt` una cadena larga y aleatoria. La genera por vos
 *      `instalar.php`, o cualquier gestor de contraseñas.
 *
 * El archivo que crees NO se versiona (está en .gitignore).
 */

return [
    'db' => [
        'host'    => 'localhost',
        'nombre'  => 'uXXXXXXXX_shinka',
        'usuario' => 'uXXXXXXXX_shinka',
        'password' => '',

        // Opcional. En el hosting es siempre 3306 y no hace falta tocarlo;
        // está para poder apuntar a una base local en otro puerto.
        'puerto'  => 3306,
    ],

    /**
     * Sal del hash de visitante. Con esto se cuentan visitantes únicos
     * SIN guardar la IP: se guarda sha256(sal + IP + navegador + día), que
     * no se puede revertir y cambia todos los días.
     *
     * IMPORTANTE: si la cambiás, los visitantes únicos de días anteriores
     * dejan de poder compararse con los nuevos. Se pone una vez y no se toca.
     */
    'salt' => 'CAMBIAR-POR-UNA-CADENA-LARGA-Y-ALEATORIA',

    /** Zona horaria con la que se cierra cada día en los informes. */
    'zona_horaria' => 'America/Argentina/Buenos_Aires',

    /**
     * País aproximado de la visita. Si está en true, el servidor le pregunta
     * el país a un servicio gratuito (ipwho.is) una sola vez por visitante y
     * lo guarda en caché 30 días. Si el servicio falla, el país queda vacío
     * y no se rompe nada. Ponelo en false si preferís no consultar nada externo.
     */
    'geo' => true,

    /** Dominios propios: si el referrer es uno de estos, la visita es navegación interna. */
    'dominios_propios' => ['shinkastudio.dev', 'www.shinkastudio.dev', 'localhost'],

    /** Minutos de inactividad antes de cerrar la sesión del panel. */
    'minutos_sesion' => 120,
];
