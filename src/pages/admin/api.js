/**
 * Cliente de la API del panel.
 *
 * Mismo origen, sin CORS. La sesión viaja en la cookie `shinka_panel`
 * (HttpOnly + SameSite=Lax): no hay token que guardar ni header que mandar,
 * solo `credentials: 'same-origin'`.
 *
 * La autorización vive en el servidor. Esto decide qué se dibuja, nunca si
 * los datos se entregan.
 */

const CABECERAS_JSON = { 'Content-Type': 'application/json' };

/** Error de la API con el código y el mensaje ya redactado por el servidor. */
export class ErrorApi extends Error {
  constructor({ error, mensaje, status }) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = error;
    this.status = status;
  }
}

async function pedir(url, opciones = {}) {
  let respuesta;

  try {
    respuesta = await fetch(url, { credentials: 'same-origin', ...opciones });
  } catch {
    throw new ErrorApi({
      error: 'sin_red',
      mensaje: 'No se pudo contactar con la API. Revisá que el servidor esté funcionando.',
      status: 0,
    });
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // Un 500 de PHP devuelve HTML, no JSON: `datos` queda en null y abajo
    // se arma un error con el código de estado.
  }

  if (!respuesta.ok || !datos || datos.ok !== true) {
    throw new ErrorApi({
      error: (datos && datos.error) || 'respuesta_invalida',
      mensaje:
        (datos && datos.mensaje) ||
        `La API respondió ${respuesta.status} y no se entendió la respuesta.`,
      status: respuesta.status,
    });
  }

  return datos;
}

/** Público: nunca devuelve 401. Dice si hay sesión y si ya se instaló la base. */
export const leerSesion = () => pedir('/api/sesion.php');

export const iniciarSesion = (usuario, password) =>
  pedir('/api/login.php', {
    method: 'POST',
    headers: CABECERAS_JSON,
    body: JSON.stringify({ usuario, password }),
  });

export const cerrarSesion = () =>
  pedir('/api/logout.php', { method: 'POST', headers: CABECERAS_JSON });

/** Privado: 401 `sin_sesion` si la sesión venció. El servidor acota los días a 1..365. */
export const leerEstadisticas = (dias) =>
  pedir(`/api/stats.php?dias=${encodeURIComponent(dias)}`);
