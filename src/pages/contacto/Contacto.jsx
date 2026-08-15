import React, { useState } from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope, FaInstagram } from 'react-icons/fa';
import './Contacto.css';
import Boton from '../../components/boton/Boton.jsx';

  
const Contacto = () => {
return (
    <main className="contact-main">
      {/* Título Principal */}
      <section className="contact-hero">
        <h1>Contáctanos</h1>
      </section>
      <p>Estamos aquí para ayudarte. utiliza uno de los siguientes canales para comunicarte con nosotros.</p>
      <section className="contact-content container">
        {/* Lado Izquierdo: Tarjetas de Información y Mapa */}
        <div className="contact-info-grid">
          <div className="contact-card">
            <FaPhone className="contact-icon" />
            <h3>Teléfono</h3>
            <p>207-8767-452</p>
          </div>

          <div className="contact-card">
            <FaWhatsapp className="contact-icon" />
            <h3>WhatsApp</h3>
            <p>082-123-234-345</p>
          </div>
          
          <div className="contact-card">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>
            <p>support@shinkastudio.com</p>  
          </div>
        
          <div className="contact-card">
            <FaInstagram className="contact-icon" />
            <h3>Instagram</h3>
            <p>@shinkastudio_</p>
          </div>

        </div>

      </section>
    </main>
  );
};

export default Contacto;
