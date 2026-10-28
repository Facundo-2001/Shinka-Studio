import { FaRocket, FaStore, FaCogs, FaSearch, FaMobileAlt, FaBolt } from 'react-icons/fa';
import Boton from '../../components/boton/Boton.jsx';
import Carrusel from '../../components/carrusel/Carrusel.jsx';
import Puntuacion from '../../components/puntuacion/Puntuacion.jsx';
import Reveal from '../../components/reveal/Reveal.jsx';
import Seo from '../../seo/Seo.jsx';
import JsonLd from '../../seo/JsonLd.jsx';
import { organizationSchema, websiteSchema, faqSchema } from '../../seo/schemas.js';
import { pages, site } from '../../seo/siteConfig.js';
import './Home.css';

const heroImages = [
  { src: '/images/home1.jpg', alt: 'Diseño web profesional desarrollado por Shinka Studio' },
  { src: '/images/home2.jpg', alt: 'Sitio web responsive creado por Shinka Studio' },
  { src: '/images/home3.jpg', alt: 'Desarrollo de tienda online a medida por Shinka Studio' },
];

const servicios = [
  {
    icono: FaRocket,
    titulo: 'Landing Pages',
    texto:
      'Páginas de una sola vista pensadas para convertir visitas en consultas. Ideales para lanzar un servicio o una campaña.',
    imagen: '/images/landingpage.jpg',
    alt: 'Diseño de landing page optimizada para conversión',
  },
  {
    icono: FaStore,
    titulo: 'Tiendas Online',
    texto:
      'E-commerce completo con carrito, pasarela de pago y gestión de stock para que vendas las 24 horas, todos los días.',
    imagen: '/images/ecommerce.png',
    alt: 'Desarrollo de tienda online con carrito y pasarela de pago',
  },
  {
    icono: FaCogs,
    titulo: 'Sistemas a Medida',
    texto:
      'Aplicaciones web y sistemas de gestión que automatizan tus procesos internos y ordenan la operación del negocio.',
    imagen: '/images/sistemascompletos.png',
    alt: 'Sistema de gestión web a medida para empresas',
  },
];

const diferenciales = [
  {
    icono: FaSearch,
    titulo: 'Optimizado para Google',
    texto: 'Estructura semántica, metadatos y datos estructurados para que tus clientes te encuentren.',
  },
  {
    icono: FaMobileAlt,
    titulo: 'Diseño responsive',
    texto: 'Tu sitio se ve impecable en celular, tablet y escritorio. Más de la mitad del tráfico es móvil.',
  },
  {
    icono: FaBolt,
    titulo: 'Carga veloz',
    texto: 'Código propio y liviano. Nada de plantillas pesadas que tardan en abrir y espantan visitas.',
  },
];

const proceso = [
  { paso: '01', titulo: 'Conversamos', texto: 'Entendemos tu negocio, tus clientes y qué necesitás lograr con el sitio.' },
  { paso: '02', titulo: 'Diseñamos', texto: 'Armamos la propuesta visual y la estructura de contenidos para que la apruebes.' },
  { paso: '03', titulo: 'Desarrollamos', texto: 'Programamos el sitio a medida, optimizado para buscadores y para celulares.' },
  { paso: '04', titulo: 'Publicamos', texto: 'Lo ponemos online, lo medimos y te acompañamos después del lanzamiento.' },
];

const clientes = [
  {
    nombre: 'Kontra Korriente',
    rubro: 'Sitio web para venta de títeres artesanales',
    puntuacion: 5,
    imagenes: [
      { src: '/images/kontrakorriente.jpg', alt: 'Sitio web de Kontra Korriente, inicio' },
      { src: '/images/kontrakorriente2.jpg', alt: 'Sitio web de Kontra Korriente, catálogo de títeres' },
      { src: '/images/kontrakorriente3.jpg', alt: 'Sitio web de Kontra Korriente, detalle de producto' },
    ],
  },
  {
    nombre: 'Lucía Sánchez',
    rubro: 'Web de servicios de estética y maquillaje profesional',
    puntuacion: 4,
    imagenes: [
      { src: '/images/luciasanchez1.jpg', alt: 'Sitio web de Lucía Sánchez, portada' },
      { src: '/images/luciasanchez2.jpg', alt: 'Sitio web de Lucía Sánchez, servicios de estética' },
      { src: '/images/luciasanchez3.jpg', alt: 'Sitio web de Lucía Sánchez, galería de trabajos' },
    ],
  },
  {
    nombre: 'Lauty’s Coffee',
    rubro: 'Sitio web para una cafetería de especialidad',
    puntuacion: 5,
    imagenes: [
      { src: '/images/coffe1.jpeg', alt: 'Sitio web de Lauty’s Coffee, portada' },
      { src: '/images/coffe2.jpeg', alt: 'Sitio web de Lauty’s Coffee, carta de la cafetería' },
      { src: '/images/coffe3.jpeg', alt: 'Sitio web de Lauty’s Coffee, sección de contacto' },
    ],
  },
];

const preguntas = [
  {
    question: '¿Cuánto cuesta hacer una página web en Argentina?',
    answer:
      'El precio depende del tipo de proyecto. Una landing page es la opción más accesible, una tienda online implica catálogo y medios de pago, y un sistema a medida se cotiza según sus funcionalidades. Analizamos tu caso y te enviamos un presupuesto sin cargo y sin compromiso.',
  },
  {
    question: '¿Cuánto tarda el desarrollo de un sitio web?',
    answer:
      'Una landing page suele estar lista en 1 a 2 semanas, una tienda online entre 3 y 6 semanas, y un sistema a medida se define según el alcance. Siempre acordamos un plazo por escrito antes de empezar.',
  },
  {
    question: '¿El sitio va a aparecer en Google?',
    answer:
      'Sí. Todos nuestros desarrollos se entregan con SEO técnico: títulos y descripciones optimizados, estructura semántica, datos estructurados, sitemap y buen rendimiento de carga, que son los factores que Google evalúa para posicionar un sitio.',
  },
  {
    question: '¿Trabajan con clientes de todo el país?',
    answer:
      'Sí. Trabajamos de forma remota con pymes, comercios y emprendedores de toda la Argentina. Coordinamos todo por videollamada, WhatsApp y email.',
  },
  {
    question: '¿Puedo actualizar el contenido yo mismo?',
    answer:
      'Sí. Según el proyecto incorporamos un panel de administración para que cargues productos, precios o novedades sin depender de nosotros, y te capacitamos en su uso.',
  },
];

export default function Home() {
  const meta = pages.home;

  return (
    <>
      <Seo title={meta.title} description={meta.description} path={meta.path} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={faqSchema(preguntas)} />

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero__inner container">
          <div className="hero__content">
            <p className="hero__eyebrow">Desarrollo web en Argentina</p>
            <h1 className="hero__title">
              Diseño y desarrollo web que hace <span>crecer tu negocio</span>
            </h1>
            <p className="hero__lead">
              Creamos landing pages, tiendas online y sistemas a medida para pymes,
              comercios y emprendedores. Sitios rápidos, profesionales y preparados
              para que tus clientes te encuentren en Google.
            </p>

            <div className="hero__actions">
              <Boton to="/contacto" variant="accent" size="lg">
                Pedir presupuesto sin cargo
              </Boton>
              <Boton to="/servicios" variant="ghost" size="lg">
                Ver servicios
              </Boton>
            </div>

            <ul className="hero__trust">
              <li>Presupuesto en 24 h hábiles</li>
              <li>Equipo de técnicos UTN</li>
              <li>Atendemos todo el país</li>
            </ul>
          </div>

          <div className="hero__media">
            <Carrusel
              images={heroImages}
              priority
              label="Proyectos web desarrollados por Shinka Studio"
            />
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIALES ============ */}
      <section className="section strip">
        <div className="container strip__grid">
          {diferenciales.map(({ icono: Icono, titulo, texto }, index) => (
            <Reveal className="strip__item" key={titulo} delay={index * 90}>
              <span className="strip__icon"><Icono aria-hidden="true" /></span>
              <div>
                <h2 className="strip__title">{titulo}</h2>
                <p>{texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SERVICIOS ============ */}
      <section className="section section--alt" id="servicios">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Qué ofrecemos</span>
            <h2>Servicios de desarrollo web a medida</h2>
            <p className="section-lead">
              Elegí el tipo de proyecto que necesita tu negocio. Programamos todo a
              medida: sin plantillas genéricas ni costos ocultos.
            </p>
          </div>

          <div className="servicios-home">
            {servicios.map(({ icono: Icono, titulo, texto, imagen, alt }, index) => (
              <Reveal as="article" className="servicio-home card" key={titulo} delay={index * 110}>
                <div className="servicio-home__media">
                  <img src={imagen} alt={alt} loading="lazy" decoding="async" width="600" height="400" />
                  <span className="servicio-home__icon"><Icono aria-hidden="true" /></span>
                </div>
                <div className="servicio-home__body">
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                  <Boton to="/servicios" variant="outline" size="sm" className="servicio-home__link">
                    Conocer más
                  </Boton>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROCESO ============ */}
      <section className="section section--dark proceso">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Cómo trabajamos</span>
            <h2>De la idea al sitio publicado en cuatro pasos</h2>
            <p className="section-lead">
              Un proceso claro, con plazos definidos y comunicación directa en cada etapa.
            </p>
          </div>

          <ol className="proceso__grid">
            {proceso.map(({ paso, titulo, texto }, index) => (
              <Reveal as="li" className="proceso__item" key={paso} delay={index * 90}>
                <span className="proceso__num">{paso}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ PORTFOLIO ============ */}
      <section className="section" id="proyectos">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Portfolio</span>
            <h2>Quiénes confiaron en nosotros</h2>
            <p className="section-lead">
              Proyectos reales de negocios argentinos que hoy tienen su presencia
              digital trabajando para ellos.
            </p>
          </div>

          <div className="clientes">
            {clientes.map(({ nombre, rubro, puntuacion, imagenes }, index) => (
              <Reveal as="article" className="cliente" key={nombre} delay={index * 110}>
                <Carrusel
                  images={imagenes}
                  label={`Proyecto web de ${nombre}`}
                  interval={5000 + index * 600}
                />
                <div className="cliente__overlay">
                  <h3>{nombre}</h3>
                  <p>{rubro}</p>
                  <Puntuacion puntuacion={puntuacion} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PREGUNTAS FRECUENTES ============ */}
      <section className="section section--alt" id="faq">
        <div className="container faq">
          <div className="section-head section-head--left">
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2>Lo que más nos consultan</h2>
            <p className="section-lead">
              Si tu duda no está acá, escribinos por WhatsApp y te respondemos sin vueltas.
            </p>
          </div>

          <div className="faq__list">
            {preguntas.map(({ question, answer }) => (
              <details className="faq__item" key={question}>
                <summary>
                  <h3>{question}</h3>
                  <span className="faq__chevron" aria-hidden="true" />
                </summary>
                <p className="faq__answer">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="cta-final">
        <div className="container cta-final__inner">
          <div className="cta-final__text">
            <h2>¿Listo para tener la web que tu negocio merece?</h2>
            <p>
              Contanos tu idea y te enviamos una propuesta con alcance, plazos y
              precio en menos de 24 horas hábiles. Sin compromiso.
            </p>
          </div>
          <div className="cta-final__actions">
            <Boton to="/contacto" variant="accent" size="lg">
              Quiero mi presupuesto
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
