import React from 'react';
import './Servicios.css';
import { Link } from 'react-router-dom';
import Boton from '../../components/boton/Boton.jsx';

export default function Servicios() {
  return (
    <section className="servicios-section" id="servicios">
      <div className="servicios-container">
        
        <div className="servicios-header">
          <h2 className="servicios-title">Desarrollo a Medida para tu Crecimiento</h2>
          <p className="servicios-description">
            No usamos plantillas genéricas. Nos encargamos de crear soluciones digitales estratégicas y personalizadas que se adaptan exactamente a las necesidades y objetivos de tu empresa.
          </p>
        </div>

        <div className="servicios-grid">
          {/* Tarjeta 1: Landing Pages */}
          <div className="servicio-card card-landing">
            <img 
              src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=800&auto=format&fit=crop" 
              alt="Diseño de Landing Pages" 
              className="servicio-img"
            />
            <h3 className="servicio-card-title">Landing Pages</h3>
            <p className="servicio-card-text">
              Páginas web de una sola vista, altamente optimizadas y diseñadas para captar la atención de tus visitantes. Ideales para promocionar un servicio específico, captar leads o presentar tu marca de forma profesional y directa.
            </p>
          </div>

          {/* Tarjeta 2: E-commerce */}
          <div className="servicio-card card-ecommerce">
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop" 
              alt="Desarrollo de E-commerce" 
              className="servicio-img"
            />
            <h3 className="servicio-card-title">E-commerce</h3>
            <p className="servicio-card-text">
              Tiendas online completas y escalables. Desarrollamos plataformas seguras con carritos de compra, integración de pasarelas de pago y sistemas de gestión de inventario para que vendas tus productos 24/7.
            </p>
          </div>

          {/* Tarjeta 3: Sistemas a Medida */}
          <div className="servicio-card card-sistemas">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" 
              alt="Desarrollo de Sistemas a Medida" 
              className="servicio-img"
            />
            <h3 className="servicio-card-title">Sistemas Completos</h3>
            <p className="servicio-card-text">
              Desarrollamos aplicaciones web complejas y portales a medida. Automatizamos procesos internos, creamos sistemas de gestión (CRM/ERP) y soluciones tecnológicas exclusivas para hacer más eficiente tu negocio.
            </p>
          </div>
        </div>

        {/* Llamado a la acción central */}
        <div className="servicios-cta-container">
          <Link to="/contacto" style={{ textDecoration: 'none' }}>
            <Boton variant="primary">Quiero cotizar mi proyecto</Boton>
          </Link>
        </div>

      </div>
    </section>
  );
}