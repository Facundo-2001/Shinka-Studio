/**
 * Interruptor "no contar mis visitas".
 *
 * Vive en localStorage y es por navegador: le permite a quien administra el
 * sitio excluirse de sus propias métricas sin tocar el servidor.
 *
 * Se expone como un store externo (`suscribir` + `leer`) para poder leerlo
 * con `useSyncExternalStore`. Así el panel no necesita copiarlo a estado en
 * un efecto, y el prerenderizado en Node usa `leerEnServidor`, que no toca
 * localStorage.
 */

export const CLAVE_SIN_REGISTRO = 'shinka_sin_registro';

/** ¿Este navegador pidió quedar fuera del registro de visitas? */
export function registroDesactivado() {
  try {
    return localStorage.getItem(CLAVE_SIN_REGISTRO) === '1';
  } catch {
    // Ventana privada, cookies bloqueadas o almacenamiento lleno.
    return false;
  }
}

/** Instantánea para el render del servidor: en Node no hay localStorage. */
export const leerEnServidor = () => false;

const oyentes = new Set();

/** Suscripción para useSyncExternalStore. Escucha también otras pestañas. */
export function suscribir(oyente) {
  oyentes.add(oyente);

  const alCambiarOtraPestania = (evento) => {
    if (evento.key === null || evento.key === CLAVE_SIN_REGISTRO) oyente();
  };

  window.addEventListener('storage', alCambiarOtraPestania);

  return () => {
    oyentes.delete(oyente);
    window.removeEventListener('storage', alCambiarOtraPestania);
  };
}

/**
 * Activa o desactiva el registro. Devuelve false si no se pudo guardar
 * (ventana privada o almacenamiento bloqueado).
 */
export function definirRegistroDesactivado(desactivado) {
  let guardado = true;

  try {
    if (desactivado) {
      localStorage.setItem(CLAVE_SIN_REGISTRO, '1');
    } else {
      localStorage.removeItem(CLAVE_SIN_REGISTRO);
    }
  } catch {
    guardado = false;
  }

  // El evento `storage` solo llega a las otras pestañas: a esta hay que avisarle.
  oyentes.forEach((oyente) => oyente());

  return guardado;
}
