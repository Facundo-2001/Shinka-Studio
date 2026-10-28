import { site, SITE_URL } from './siteConfig.js';

/* =========================================================
   Datos estructurados (schema.org)
========================================================= */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#organizacion`,
  name: site.name,
  legalName: site.legalName,
  url: SITE_URL,
  logo: site.logo,
  image: site.ogImage,
  description:
    'Estudio argentino de diseño y desarrollo web. Landing pages, tiendas online y sistemas de gestión a medida para pymes, comercios y emprendedores.',
  email: site.email,
  telephone: site.phone,
  foundingDate: String(site.foundingYear),
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'AR',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Argentina',
  },
  availableLanguage: ['es'],
  knowsAbout: [
    'Diseño web',
    'Desarrollo web',
    'Landing pages',
    'Tiendas online',
    'E-commerce',
    'Sistemas de gestión a medida',
    'Optimización SEO',
    'React',
  ],
  sameAs: [site.instagram, site.github],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phone,
    contactType: 'customer service',
    email: site.email,
    areaServed: 'AR',
    availableLanguage: ['Spanish'],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: site.name,
  inLanguage: 'es-AR',
  publisher: { '@id': `${SITE_URL}/#organizacion` },
};

export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Inicio', path: '/' }, ...trail].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '/' : item.path}`,
    })),
  };
}

export function serviceSchema({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: name,
    url: `${SITE_URL}${path}`,
    provider: { '@id': `${SITE_URL}/#organizacion` },
    areaServed: { '@type': 'Country', name: 'Argentina' },
  };
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
