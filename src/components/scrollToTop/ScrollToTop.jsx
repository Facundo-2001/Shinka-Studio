import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * En una SPA el scroll no se reinicia al cambiar de ruta.
 * Este componente lo lleva arriba en cada navegación.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  return null;
}
