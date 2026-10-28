import { useState } from 'react';
import { FaWhatsapp, FaEnvelope, FaInstagram, FaPhone } from 'react-icons/fa';
import Boton from '../../components/boton/Boton.jsx';
import Seo from '../../seo/Seo.jsx';
import JsonLd from '../../seo/JsonLd.jsx';
import { breadcrumbSchema } from '../../seo/schemas.js';
import { pages, site, SITE_URL } from '../../seo/siteConfig.js';
import './Contacto.css';

const canales = [
  {
    icono: FaWhatsapp,
    titulo: 'WhatsApp',
    detalle: site.phoneDisplay,
    nota: 'La vía más rápida. Respondemos en el día.',
    href: `https://wa.me/${site.whatsapp}`,
    externo: true,
    destacado: true,
  },
  {
    icono: FaEnvelope,
    titulo: 'Email',
    detalle: site.email,
    nota: 'Ideal para enviarnos material o documentación.',
    href: `mailto:${site.email}`,
  },
  {
    icono: FaPhone,
    titulo: 'Teléfono',
    detalle: site.phoneDisplay,
    nota: 'Lunes a viernes, de 9 a 19 h.',
    href: `tel:${site.phone}`,
  },
  {
    icono: FaInstagram,
    titulo: 'Instagram',
    detalle: '@shinkastudio_',
    nota: 'Mirá nuestros últimos trabajos.',
    href: site.instagram,
    externo: true,
  },
];

const tiposProyecto = [
  'Landing page',
  'Tienda online / E-commerce',
  'Sistema a medida',
  'Rediseño de un sitio existente',
  'Todavía no lo tengo definido',
];

const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contacto | Shinka Studio',
  url: `${SITE_URL}/contacto`,
  description:
    'Canales de contacto de Shinka Studio: WhatsApp, email, teléfono e Instagram. Presupuestos sin cargo para toda Argentina.',
  mainEntity: { '@id': `${SITE_URL}/#organizacion` },
};

const estadoInicial = { nombre: '', email: '', tipo: tiposProyecto[0], mensaje: '' };

export default function Contacto() {
  const meta = pages.contacto;
  const [form, setForm] = useState(estadoInicial);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previo) => ({ ...previo, [name]: value }));
  };

  // Sin backend: armamos el mensaje y abrimos WhatsApp con todo pre-cargado.
  const handleSubmit = (event) => {
    event.preventDefault();

    const texto = [
      `Hola Shinka Studio, soy ${form.nombre.trim()}.`,
      `Tipo de proyecto: ${form.tipo}.`,
      form.email.trim() ? `Mi email: ${form.email.trim()}.` : null,
      '',
      form.mensaje.trim(),
    ]
      .filter(Boolean)
      .join('\n');

    window.open(
      `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      <Seo title={meta.title} description={meta.description} path={meta.path} />
      <JsonLd data={breadcrumbSchema([{ name: 'Contacto', path: '/contacto' }])} />
      <JsonLd data={contactPageSchema} />

      {/* ============ ENCABEZADO ============ */}
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Contacto</span>
          <h1>Pedí tu presupuesto sin cargo</h1>
          <p className="page-hero__lead">
            Contanos qué necesitás y te respondemos en menos de 24 horas hábiles con
            una propuesta concreta: alcance, plazos y precio. Atendemos a clientes de
            toda la Argentina.
          </p>
        </div>
      </section>

      {/* ============ CANALES + FORMULARIO ============ */}
      <section className="section">
        <div className="container contacto">
          <div className="contacto__canales">
            <div className="section-head section-head--left">
              <span className="eyebrow">Escribinos</span>
              <h2>Elegí el canal que prefieras</h2>
            </div>

            <ul className="canales">
              {canales.map(({ icono: Icono, titulo, detalle, nota, href, externo, destacado }) => (
                <li key={titulo}>
                  <a
                    className={`canal ${destacado ? 'canal--destacado' : ''}`}
                    href={href}
                    {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="canal__icon"><Icono aria-hidden="true" /></span>
                    <span className="canal__body">
                      <span className="canal__titulo">{titulo}</span>
                      <span className="canal__detalle">{detalle}</span>
                      <span className="canal__nota">{nota}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="contacto__form-wrap">
            <h2 className="contacto__form-title">Contanos sobre tu proyecto</h2>
            <p className="contacto__form-text">
              Completá el formulario y se abrirá WhatsApp con tu consulta ya
              redactada. Solo tenés que enviarla.
            </p>

            <form className="form" onSubmit={handleSubmit}>
              <div className="form__group">
                <label htmlFor="nombre">Nombre y apellido *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ej.: María González"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="form__group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tunombre@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form__group">
                <label htmlFor="tipo">¿Qué necesitás?</label>
                <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                  {tiposProyecto.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="form__group">
                <label htmlFor="mensaje">Contanos un poco más *</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="5"
                  required
                  placeholder="A qué se dedica tu negocio, qué querés lograr con el sitio, si ya tenés dominio..."
                  value={form.mensaje}
                  onChange={handleChange}
                />
              </div>

              <Boton type="submit" variant="primary" size="lg" className="form__submit">
                Enviar por WhatsApp
              </Boton>

              <p className="form__nota">
                ¿Preferís el correo?{' '}
                <a href={`mailto:${site.email}`}>Escribinos a {site.email}</a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
