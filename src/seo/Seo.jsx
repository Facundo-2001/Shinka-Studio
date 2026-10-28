import { useEffect } from 'react';
import { site, SITE_URL } from './siteConfig.js';

/**
 * Sincroniza el <head> en la navegación del lado del cliente.
 * El HTML inicial de cada ruta ya viene con estas etiquetas escritas
 * de forma estática por scripts/prerender.mjs (eso es lo que leen los
 * crawlers que no ejecutan JavaScript); este componente mantiene el
 * head correcto cuando el usuario navega sin recargar la página.
 */

function setMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.tag || 'meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (key !== 'tag') el.setAttribute(key, value);
  });
}

export default function Seo({ title, description, path = '/', image, noindex = false }) {
  useEffect(() => {
    const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
    const ogImage = image || site.ogImage;

    document.title = title;

    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    });
    setMeta('link[rel="canonical"]', { tag: 'link', rel: 'canonical', href: canonical });

    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });

    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
  }, [title, description, path, image, noindex]);

  return null;
}
