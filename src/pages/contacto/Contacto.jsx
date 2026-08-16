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
          <a href="tel:+5491178929045" className="contact-card">
            <FaPhone className="contact-icon" />
            <h3>Teléfono</h3>
          </a>

          <a href="https://wa.me/5491178929045" target="_blank" rel="noopener noreferrer" className="contact-card">
            <FaWhatsapp className="contact-icon" />
            <h3>WhatsApp</h3>
          </a>
          
          <a href="mailto:shinkastudiosoporte@gmail.com" className="contact-card">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>  
          </a>
        
          <a href="https://www.instagram.com/shinkastudio_" target="_blank" rel="noopener noreferrer" className="contact-card">
            <FaInstagram className="contact-icon" />
            <h3>Instagram</h3>
          </a>

        </div>

      </section>
    </main>
  );
};

export default Contacto;
