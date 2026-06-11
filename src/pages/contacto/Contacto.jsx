import React, { useState } from 'react';
import './Contacto.css';
import Boton from '../../components/boton/Boton.jsx';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // IMPORTANTE: El envío de emails no puede hacerse solo desde el frontend por seguridad.
    // Se necesita un backend o un servicio de terceros como EmailJS, Formspree o Getform.
    // Por ahora, mostraremos los datos en la consola como simulación.
    console.log('Datos del formulario a enviar:', formData);
    alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo a la brevedad.');
    
    // Limpiar el formulario después del envío
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });
  };

  return (
    <section className="contacto-section">
      <div className="contacto-container">
        <div className="contacto-header">
          <h2 className="contacto-title">Hablemos de tu Proyecto</h2>
          <p className="contacto-description">
            Completa el formulario y nuestro equipo se pondrá en contacto contigo para transformar tu idea en una realidad digital.
          </p>
        </div>
        <form className="contacto-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="asunto">Asunto</label>
            <input type="text" id="asunto" name="asunto" value={formData.asunto} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Tu Mensaje</label>
            <textarea id="mensaje" name="mensaje" rows="6" value={formData.mensaje} onChange={handleChange} required></textarea>
          </div>
          <Boton type="submit" variant="primary" className="form-submit-btn">
            Enviar Mensaje
          </Boton>
        </form>
      </div>
    </section>
  );
};

export default Contacto;
