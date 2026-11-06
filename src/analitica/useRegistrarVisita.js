import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { registroDesactivado } from './preferencias.js';

/**
 * Registra una visita al montar y en cada cambio de ruta.
 *
 * Se monta en Layout, no en App: así el panel (/admin, que va fuera del
 * Layout) queda fuera del conteo por construcción. El servidor igual
 * descarta /admin y /admin/* por si acaso.
 *
 * El pedido falla siempre en silencio: un error de analítica no puede
 * romper la página ni ensuciar la consola del visitante.
 */
export default function useRegistrarVisita() {
  const { pathname } = useLocation();

  /**
   * Última ruta enviada. Hace falta porque en desarrollo StrictMode monta
   * los efectos dos veces y sin esto cada visita se contaría doble. El ref
   * sobrevive al doble montaje simulado; el efecto, no.
   */
  const ultimaRuta = useRef(null);

  useEffect(() => {
    if (ultimaRuta.current === pathname) return;
    ultimaRuta.current = pathname;

    if (registroDesactivado()) return;

    fetch('/api/track.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      // keepalive deja el pedido en vuelo si la pestaña se cierra enseguida.
      keepalive: true,
      body: JSON.stringify({
        ruta: pathname,
        // Se manda crudo: la atribución de primer contacto la hace el
        // servidor, por visitante y por día. Resolverlo acá inflaría los
        // orígenes en cada navegación interna de la SPA.
        referrer: document.referrer,
      }),
    }).catch(() => {});
    // La respuesta es 204 sin cuerpo: no hay nada que leer.
  }, [pathname]);
}
