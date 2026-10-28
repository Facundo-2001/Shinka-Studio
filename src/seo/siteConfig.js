/* =========================================================
   Configuración central de SEO.
   Es la única fuente de verdad: la usan los <meta> de cada
   página, el JSON-LD, el sitemap y el prerenderizado.
========================================================= */

export const SITE_URL = 'https://shinkastudio.dev';

export const site = {
  url: SITE_URL,
  name: 'Shinka Studio',
  legalName: 'Shinka Studio',
  locale: 'es_AR',
  lang: 'es-AR',
  logo: `${SITE_URL}/logos/logo.png`,
  ogImage: `${SITE_URL}/images/home1.jpg`,
  themeColor: '#0F2B47',
  email: 'shinkastudiosoporte@gmail.com',
  phone: '+5491168902781',
  phoneDisplay: '+54 9 11 6890-2781',
  whatsapp: '5491168902781',
  instagram: 'https://www.instagram.com/shinkastudio_',
  github: 'https://github.com/Facundo-2001',
  areaServed: 'Argentina',
  foundingYear: 2024,
};

/**
 * Metadatos por ruta. `path` debe coincidir con las rutas del router:
 * se usa para el sitemap y para generar un HTML estático por página.
 */
export const pages = {
  home: {
    path: '/',
    title: 'Shinka Studio | Diseño y Desarrollo Web Profesional en Argentina',
    description:
      'Agencia argentina de desarrollo web. Creamos landing pages, tiendas online y sistemas a medida para pymes y emprendedores. Sitios rápidos, optimizados para Google y listos para vender.',
    priority: '1.0',
    changefreq: 'weekly',
  },
  servicios: {
    path: '/servicios',
    title: 'Servicios de Desarrollo Web: Landing Pages, E-commerce y Sistemas | Shinka Studio',
    description:
      'Desarrollamos landing pages que convierten, tiendas online con pasarela de pago y sistemas de gestión a medida. Presupuesto sin cargo para toda Argentina.',
    priority: '0.9',
    changefreq: 'monthly',
  },
  sobreNosotros: {
    path: '/sobre-nosotros',
    title: 'Sobre Nosotros | Técnicos Universitarios en Programación (UTN) | Shinka Studio',
    description:
      'Somos un equipo de Técnicos Universitarios en Programación egresados de la UTN. Ayudamos a pymes, comercios y emprendedores argentinos a crecer en el mundo digital.',
    priority: '0.7',
    changefreq: 'yearly',
  },
  contacto: {
    path: '/contacto',
    title: 'Contacto | Pedí tu Presupuesto Web Sin Cargo | Shinka Studio',
    description:
      'Contactanos por WhatsApp, email o Instagram y recibí un presupuesto sin cargo para tu sitio web en menos de 24 horas hábiles. Atendemos toda Argentina.',
    priority: '0.8',
    changefreq: 'monthly',
  },
};

export const routeList = Object.values(pages);
