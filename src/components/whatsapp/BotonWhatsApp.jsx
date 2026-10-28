import { FaWhatsapp } from 'react-icons/fa';
import { site } from '../../seo/siteConfig.js';
import './BotonWhatsApp.css';

const mensaje = encodeURIComponent(
  'Hola Shinka Studio, vi su web y quiero hacer una consulta sobre un proyecto.'
);

export default function BotonWhatsApp() {
  return (
    <a
      className="wa-float"
      href={`https://wa.me/${site.whatsapp}?text=${mensaje}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
      <span className="wa-float__label">Consultanos</span>
    </a>
  );
}
