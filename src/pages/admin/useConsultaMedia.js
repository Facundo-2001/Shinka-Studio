import { useCallback, useSyncExternalStore } from 'react';

/**
 * Lee un breakpoint con `window.matchMedia`.
 *
 * Es una pregunta, no una medición: no hace falta saber cuántos píxeles mide
 * el contenedor, solo de qué lado del breakpoint estamos. Por eso no hay
 * ResizeObserver, ni espera al primer layout, ni re-render en cada cambio de
 * tamaño: el navegador avisa únicamente cuando se cruza el umbral.
 *
 * En el prerenderizado no existe `window`, así que la instantánea de
 * servidor devuelve false (escritorio). El HTML estático sale con la versión
 * ancha y en el teléfono se corrige al hidratar.
 */
export default function useConsultaMedia(consulta) {
  const suscribir = useCallback(
    (oyente) => {
      const mq = window.matchMedia(consulta);
      mq.addEventListener('change', oyente);
      return () => mq.removeEventListener('change', oyente);
    },
    [consulta]
  );

  const leer = useCallback(() => window.matchMedia(consulta).matches, [consulta]);

  return useSyncExternalStore(suscribir, leer, () => false);
}
