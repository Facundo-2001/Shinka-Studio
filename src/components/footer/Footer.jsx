import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaEnvelope, FaGithub } from 'react-icons/fa';
import { site } from '../../seo/siteConfig.js';
import './Footer.css';

const servicios = [
  'Landing pages',
  'Tiendas online / E-commerce',
  'Sistemas de gestión a medida',
  'Rediseño y optimización SEO',
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <img
            src="/logos/logo.png"
            alt="Shinka Studio"
            width="200"
            height="100"
            className="footer__logo"
            loading="lazy"
          />
          <p className="footer__tagline">
            Estudio argentino de diseño y desarrollo web. Convertimos tu negocio en
            un sitio rápido, profesional y encontrable en Google.
          </p>

          <ul className="footer__social" aria-label="Redes sociales">
            <li>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                aria-label="Escribinos por WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                aria-label="Seguinos en Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} aria-label="Enviarnos un email">
                <FaEnvelope aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={site.github}
                aria-label="Ver nuestro GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <nav className="footer__col" aria-label="Enlaces del sitio">
          <h2 className="footer__title">Navegación</h2>
          <ul className="footer__list">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/sobre-nosotros">Sobre nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="footer__title">Servicios</h2>
          <ul className="footer__list footer__list--plain">
            {servicios.map((servicio) => (
              <li key={servicio}>{servicio}</li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h2 className="footer__title">Contacto</h2>
          <ul className="footer__list">
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li className="footer__plain">Atendemos toda Argentina</li>
            <li className="footer__plain">Lun a Vie, 9 a 19 h</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>&copy; {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
        <p>Impulsando el crecimiento digital de la industria nacional.</p>
      </div>
    </footer>
  );
}
