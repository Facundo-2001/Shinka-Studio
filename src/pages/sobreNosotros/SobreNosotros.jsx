import React from 'react';
import './SobreNosotros.css';

export default function SobreNosotros() {
  return (
    <section className="sobre-nosotros-section" id="nosotros">
      <div className="sobre-nosotros-container">
        <h2 className="sobre-nosotros-title">Sobre Nosotros</h2>
        
        <p className="sobre-nosotros-text">
          En <strong>Shinka Studio</strong>, somos un estudio de desarrollo web profesional compuesto íntegramente por <span className="sobre-nosotros-highlight">Técnicos Universitarios recibidos en la UTN</span> (Universidad Tecnológica Nacional).
        </p>
        
        <p className="sobre-nosotros-text">
          Nuestra sólida formación académica, combinada con nuestra pasión por la tecnología, nos permite ir más allá del simple diseño de páginas. Construimos soluciones digitales robustas, seguras y escalables aplicando las mejores prácticas de la ingeniería de software.
        </p>

        <p className="sobre-nosotros-text">
          Entendemos el código a la perfección, pero nuestro verdadero objetivo es entender tu negocio para transformarlo y potenciar su crecimiento en el mundo digital.
        </p>
      </div>
    </section>
  );
}