import { FaCheck } from 'react-icons/fa';
import Boton from '../../components/boton/Boton.jsx';
import Reveal from '../../components/reveal/Reveal.jsx';
import Seo from '../../seo/Seo.jsx';
import JsonLd from '../../seo/JsonLd.jsx';
import { breadcrumbSchema, serviceSchema } from '../../seo/schemas.js';
import { pages, site } from '../../seo/siteConfig.js';
import './Servicios.css';

const servicios = [
  {
    id: 'landing-pages',
    etiqueta: 'Más elegido',
    titulo: 'Landing Pages',
    resumen:
      'Una página única, clara y persuasiva, diseñada para que el visitante haga una sola cosa: contactarte.',
    descripcion:
      'Las landing pages son ideales para presentar un servicio, lanzar una promoción o acompañar una campaña publicitaria. Trabajamos la jerarquía visual, los textos y los llamados a la acción para que cada visita tenga la mayor probabilidad posible de convertirse en una consulta.',
    imagen: '/images/landingexample.jpg',
    alt: 'Ejemplo de landing page profesional desarrollada por Shinka Studio',
    incluye: [
      'Diseño exclusivo adaptado a tu marca',
      'Formulario de contacto y botón de WhatsApp',
      'Optimización SEO y velocidad de carga',
      'Versión para celular, tablet y escritorio',
      'Integración con Google Analytics',
    ],
    ideal: 'Profesionales, estudios y servicios que necesitan presencia online ya.',
  },
  {
    id: 'ecommerce',
    titulo: 'Tiendas Online',
    resumen:
      'Un e-commerce completo y escalable para que tu negocio venda todos los días, sin horarios.',
    descripcion:
      'Desarrollamos tiendas online con catálogo de productos, carrito de compras, medios de pago y gestión de envíos. Incluimos un panel de administración para que cargues productos, actualices precios y controles tu stock sin depender de nadie.',
    imagen: '/images/ecommerceexample.jpg',
    alt: 'Ejemplo de tienda online con carrito de compras desarrollada por Shinka Studio',
    incluye: [
      'Catálogo con categorías, filtros y buscador',
      'Carrito y pasarela de pago (Mercado Pago)',
      'Panel para administrar productos y stock',
      'Cálculo de envíos y gestión de pedidos',
      'Fichas de producto optimizadas para Google',
    ],
    ideal: 'Comercios, marcas y emprendedores que venden productos.',
  },
  {
    id: 'sistemas',
    titulo: 'Sistemas a Medida',
    resumen:
      'Software web pensado para tu operación: automatiza tareas, ordena datos y te ahorra horas.',
    descripcion:
      'Construimos aplicaciones web y sistemas de gestión exclusivos para tu empresa. Desde un CRM para seguir clientes hasta portales internos, turnos o reportes: analizamos tus procesos y los convertimos en una herramienta que trabaja para vos.',
    imagen: '/images/sistemascompletosexample.jpg',
    alt: 'Ejemplo de sistema de gestión web a medida desarrollado por Shinka Studio',
    incluye: [
      'Relevamiento y análisis de tus procesos',
      'Usuarios, roles y permisos',
      'Reportes y paneles de control',
      'Integración con servicios que ya usás',
      'Soporte y evolución del sistema',
    ],
    ideal: 'Pymes y empresas que necesitan ordenar y automatizar su gestión.',
  },
];

const extras = [
  { titulo: 'Rediseño de sitios', texto: 'Modernizamos tu web actual sin perder el posicionamiento que ya ganaste.' },
  { titulo: 'Optimización SEO', texto: 'Auditamos y corregimos lo que impide que Google te muestre en los resultados.' },
  { titulo: 'Mantenimiento', texto: 'Actualizaciones, copias de seguridad y cambios de contenido mes a mes.' },
  { titulo: 'Hosting y dominio', texto: 'Te asesoramos y gestionamos la puesta online de punta a punta.' },
];

export default function Servicios() {
  const meta = pages.servicios;

  return (
    <>
      <Seo title={meta.title} description={meta.description} path={meta.path} />
      <JsonLd data={breadcrumbSchema([{ name: 'Servicios', path: '/servicios' }])} />
      {servicios.map((servicio) => (
        <JsonLd
          key={servicio.id}
          data={serviceSchema({
            name: servicio.titulo,
            description: servicio.resumen,
            path: `/servicios#${servicio.id}`,
          })}
        />
      ))}

      {/* ============ ENCABEZADO ============ */}
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Servicios</span>
          <h1>Desarrollo web a medida para tu negocio</h1>
          <p className="page-hero__lead">
            Programamos cada proyecto desde cero, sin plantillas. Elegí la solución
            que necesitás y te enviamos un presupuesto con alcance y plazos en menos
            de 24 horas hábiles.
          </p>
          <div className="page-hero__actions">
            <Boton to="/contacto" variant="accent" size="lg">
              Cotizar mi proyecto
            </Boton>
          </div>
        </div>
      </section>

      {/* ============ SERVICIOS EN DETALLE ============ */}
      <section className="section">
        <div className="container servicios-detalle">
          {servicios.map((servicio, index) => (
            <Reveal as="article" className="servicio" id={servicio.id} key={servicio.id}>
              <div className="servicio__media">
                <img
                  src={servicio.imagen}
                  alt={servicio.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width="800"
                  height="600"
                />
                {servicio.etiqueta && <span className="servicio__tag">{servicio.etiqueta}</span>}
              </div>

              <div className="servicio__body">
                <h2>{servicio.titulo}</h2>
                <p className="servicio__resumen">{servicio.resumen}</p>
                <p className="servicio__texto">{servicio.descripcion}</p>

                <h3 className="servicio__subtitulo">Qué incluye</h3>
                <ul className="servicio__lista">
                  {servicio.incluye.map((item) => (
                    <li key={item}>
                      <FaCheck aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="servicio__ideal">
                  <strong>Ideal para:</strong> {servicio.ideal}
                </p>

                <Boton to="/contacto" variant="primary">
                  Pedir presupuesto
                </Boton>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SERVICIOS COMPLEMENTARIOS ============ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">También hacemos</span>
            <h2>Servicios complementarios</h2>
            <p className="section-lead">
              Si ya tenés un sitio, también podemos ayudarte a mejorarlo y mantenerlo.
            </p>
          </div>

          <div className="extras">
            {extras.map(({ titulo, texto }, index) => (
              <Reveal className="extra card" key={titulo} delay={index * 80}>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-final">
        <div className="container cta-final__inner">
          <div className="cta-final__text">
            <h2>¿No sabés cuál de los tres necesitás?</h2>
            <p>
              Contanos qué hace tu negocio y te recomendamos la opción que mejor se
              ajusta a tu objetivo y a tu presupuesto. La consulta no tiene costo.
            </p>
          </div>
          <div className="cta-final__actions">
            <Boton to="/contacto" variant="accent" size="lg">
              Hablar con el equipo
            </Boton>
            <Boton
              href={`https://wa.me/${site.whatsapp}`}
              variant="ghost"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </Boton>
          </div>
        </div>
      </section>
    </>
  );
}
