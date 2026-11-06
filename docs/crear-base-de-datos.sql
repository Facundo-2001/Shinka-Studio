-- =====================================================================
--  BASE DE DATOS DE ANALÍTICA — SHINKA STUDIO
--  Sentencias para ejecutar en phpMyAdmin (Hostinger / hPanel)
-- =====================================================================
--
--  ANTES DE EJECUTAR ESTO, LEÉ ESTOS DOS PUNTOS
--
--  1) LA BASE SE CREA EN hPANEL, NO ACÁ.
--     En el hosting compartido de Hostinger el usuario de MySQL no tiene
--     privilegio CREATE DATABASE, así que un `CREATE DATABASE` desde
--     phpMyAdmin falla con "Access denied". La base se crea así:
--
--        hPanel → Bases de datos → Bases de datos MySQL
--        → "Crear una base de datos nueva"
--
--     Anotá los cuatro datos que te muestra ahí (nombre de la base,
--     usuario, contraseña y host, que casi siempre es `localhost`):
--     son los mismos que van en `public/api/config.php`.
--
--     Por eso este archivo NO tiene CREATE DATABASE ni USE: lo ejecutás
--     ya estando dentro de tu base.
--
--  2) CÓMO EJECUTARLO
--
--        hPanel → Bases de datos → phpMyAdmin → entrá a tu base
--        → pestaña "SQL" → pegá TODO este archivo → "Continuar"
--
--     Se puede ejecutar más de una vez sin romper nada: todas las
--     sentencias son `CREATE TABLE IF NOT EXISTS`, así que si una tabla
--     ya existe la saltea y no borra datos.
--
--  ALTERNATIVA: si preferís no tocar phpMyAdmin, `api/instalar.php` crea
--  estas mismas cuatro tablas solo. Este archivo es para hacerlo a mano.
--
--
--  QUÉ DATOS PERSONALES SE GUARDAN: ninguno. No se guarda la IP ni nada
--  que identifique a una persona. Para contar visitantes únicos se guarda
--  `visitante_hash`, que es sha256(sal + IP + navegador + día): no se
--  puede revertir y cambia todos los días.
-- =====================================================================


-- ---------------------------------------------------------------------
--  TABLA 1 de 4 — visitas
--  Una fila por página vista. Es la tabla que crece.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitas (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    creado_en       DATETIME        NOT NULL,                       -- momento exacto
    dia             DATE            NOT NULL,                       -- día local, para agrupar
    ruta            VARCHAR(255)    NOT NULL,                        -- '/', '/servicios', ...
    visitante_hash  CHAR(64)        NOT NULL,                        -- hash diario, no reversible

    origen          VARCHAR(80)     NOT NULL DEFAULT 'directo',       -- 'google', 'instagram', ...
    referrer        VARCHAR(255)    NULL,                             -- URL completa de origen
    dispositivo     VARCHAR(16)     NOT NULL DEFAULT 'desconocido',   -- movil|tablet|escritorio
    navegador       VARCHAR(32)     NOT NULL DEFAULT 'Otro',          -- 'Chrome', 'Safari', ...
    sistema         VARCHAR(32)     NOT NULL DEFAULT 'Otro',          -- 'Android', 'Windows', ...
    pais_codigo     CHAR(2)         NULL,                             -- 'AR'
    pais            VARCHAR(64)     NULL,                             -- 'Argentina'

    es_bot          TINYINT(1)      NOT NULL DEFAULT 0,               -- 1 = no cuenta como visita

    PRIMARY KEY (id),

    -- Los cuatro índices son los que usan las consultas del panel.
    -- Sin ellos el panel funciona igual, pero se vuelve lento al crecer.
    KEY idx_dia       (dia, es_bot),
    KEY idx_ruta      (ruta, dia),
    KEY idx_visitante (visitante_hash, dia),
    KEY idx_origen    (origen, dia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  TABLA 2 de 4 — admin_usuarios
--  Quién puede entrar al panel. Normalmente tiene una sola fila.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_usuarios (
    id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario        VARCHAR(64)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,   -- bcrypt costo 12. Nunca la contraseña en claro.
    creado_en      DATETIME     NOT NULL,
    ultimo_acceso  DATETIME     NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  TABLA 3 de 4 — admin_intentos
--  Freno de fuerza bruta: 8 intentos fallidos por IP cada 15 minutos.
--  Se limpia sola (el login borra lo que tiene más de un día).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_intentos (
    id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ip_hash   CHAR(64)        NOT NULL,
    creado_en DATETIME        NOT NULL,

    PRIMARY KEY (id),
    KEY idx_ip (ip_hash, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  TABLA 4 de 4 — geo_cache
--  País por IP, para no consultar el servicio externo más de una vez
--  por visitante cada 30 días.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS geo_cache (
    ip_hash        CHAR(64)    NOT NULL,
    pais_codigo    CHAR(2)     NULL,
    pais           VARCHAR(64) NULL,
    actualizado_en DATETIME    NOT NULL,

    PRIMARY KEY (ip_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--  COMPROBACIÓN
--  Ejecutá esto después y tienen que aparecer las cuatro tablas.
-- =====================================================================
SHOW TABLES;


-- =====================================================================
--  EL USUARIO DEL PANEL NO SE CREA DESDE ACÁ
-- =====================================================================
--
--  La contraseña se guarda con bcrypt y MySQL no sabe calcular bcrypt:
--  no hay ninguna función SQL que lo haga. Así que el usuario se da de
--  alta desde PHP, que sí sabe.
--
--  Con las tablas ya creadas, abrí una sola vez:
--
--        https://shinkastudio.dev/api/instalar.php
--
--  Va a ver que las tablas existen y que no hay ningún administrador, y
--  te va a pedir usuario y contraseña. Después BORRÁ ese archivo del
--  hosting.
--
--  Si alguna vez necesitás hacerlo a mano, el INSERT es este, pero el
--  hash lo tenés que generar con PHP
--  (`password_hash('tu-clave', PASSWORD_BCRYPT, ['cost' => 12])`),
--  no a ojo:
--
--    INSERT INTO admin_usuarios (usuario, password_hash, creado_en)
--    VALUES ('facu', '$2y$12$EL-HASH-GENERADO-CON-PHP', NOW());
--
--  Un hash inventado a mano no va a validar nunca: bcrypt lleva su propia
--  sal adentro del string.


-- =====================================================================
--  CONSULTAS ÚTILES PARA MIRAR A MANO
--  Están comentadas: descomentá la que quieras y ejecutala sola.
-- =====================================================================

--  Visitas y visitantes únicos de los últimos 30 días
--  SELECT dia,
--         COUNT(*)                       AS visitas,
--         COUNT(DISTINCT visitante_hash) AS visitantes
--    FROM visitas
--   WHERE es_bot = 0
--     AND dia > DATE_SUB(CURDATE(), INTERVAL 30 DAY)
--   GROUP BY dia
--   ORDER BY dia DESC;

--  Páginas más vistas de todos los tiempos
--  SELECT ruta, COUNT(*) AS visitas
--    FROM visitas
--   WHERE es_bot = 0
--   GROUP BY ruta
--   ORDER BY visitas DESC;

--  De dónde llega la gente
--  SELECT origen, COUNT(DISTINCT visitante_hash) AS visitantes
--    FROM visitas
--   WHERE es_bot = 0
--   GROUP BY origen
--   ORDER BY visitantes DESC;

--  Cuánto tráfico era de robots (no entra en ningún número del panel)
--  SELECT es_bot, COUNT(*) FROM visitas GROUP BY es_bot;

--  Total histórico
--  SELECT COUNT(*)                       AS visitas,
--         COUNT(DISTINCT visitante_hash) AS visitantes,
--         MIN(dia)                       AS desde
--    FROM visitas
--   WHERE es_bot = 0;


-- =====================================================================
--  BORRAR LOS DATOS DE PRUEBA
--  Vacía las visitas SIN borrar el usuario del panel. Ojo: no se deshace.
-- =====================================================================
--  TRUNCATE TABLE visitas;
--  TRUNCATE TABLE geo_cache;
