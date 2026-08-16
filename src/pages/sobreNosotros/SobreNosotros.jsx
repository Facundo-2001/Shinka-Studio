import React from 'react';
import './SobreNosotros.css';

export default function SobreNosotros() {
  return (
    <section className="sobre-nosotros-section" id="nosotros">
      <div className="sobre-nosotros-container">
        <h2 className="sobre-nosotros-title">¿Quienes Somos?</h2>
        
        <p className="sobre-nosotros-text">
          Somos <strong>Shinka Studio</strong>, un equipo nuevo en el mercado con una misión clara: potenciar la industria nacional. Nos dedicamos a ayudar a pequeñas empresas, pymes, comercios y emprendedores particulares a impulsar su negocio en el mundo digital.
        </p>
        
        <p className="sobre-nosotros-text">
          Nuestro equipo está compuesto íntegramente por <span className="sobre-nosotros-highlight">Técnicos Universitarios en Programación recibidos en la UTN</span> (Universidad Tecnológica Nacional). Esta sólida formación académica nos brinda las herramientas para crear soluciones web robustas, seguras y a medida.
        </p>

        <p className="sobre-nosotros-text">
          Creemos en el talento local y queremos ser el aliado tecnológico que te permita crecer. Entendemos tus desafíos y estamos aquí para transformarlos en oportunidades digitales.
        </p>
      </div>
    </section>
  );
}