import React from 'react';
import { Link } from 'react-router-dom';
import Boton from '../../components/boton/Boton.jsx';
import './Home.css'
import Carrusel from '../../components/carrusel/Carrusel.jsx';
import ObtenerDatos from '../../components/Reseñas/ObtenerDatos.jsx';

const heroImages = [
  '/images/home1.jpg',
  '/images/home2.jpg',
  '/images/home3.jpg'
]

const Home = () => {
  return (
    <div className="home-container">
      <main>
        {/* SECCIÓN HERO */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>TRANSFORMANDO TU HUELLA DIGITAL</h1>
            <p>Creamos soluciones digitales para ayudarte a llevar tu negocio al siguiente nivel</p>
            
            <div className="hero-buttons">
              <Link to="/servicios" style={{ textDecoration: 'none' }}>
                <Boton variant="outline">SERVICIOS</Boton>
              </Link>
              <Link to="/sobre-nosotros" style={{ textDecoration: 'none' }}>
                <Boton variant="outline">NOSOTROS</Boton>
              </Link>
              <Link to="/contacto" style={{ textDecoration: 'none' }}>
                <Boton variant="primary">QUIERO UNA WEB &gt;</Boton>
              </Link>
            </div>
          </div>

          {/* Contenedor del Carrusel a la derecha */}
          <div className="hero-carrusel">
            <Carrusel images={heroImages} />
          </div>
        </section>

        {/* SECCIÓN DE SERVICIOS (Las 3 tarjetas) */}
        <section className="services-section">
          
          <article className="service-card">
            <div className="card-image bg-landing">
              <div className="card-info">
                <h3>Landing Page</h3>
                <p>Páginas de una sola vista</p>
              </div>
            </div>
          </article>

          <article className="service-card">
            <div className="card-image bg-ecommerce">
              <div className="card-info">
                <h3>E-Commerce</h3>
                <p>Tiendas online completas y escalables</p>
              </div>
            </div>
          </article>

          <article className="service-card">
            <div className="card-image bg-systems">
              <div className="card-info">
                <h3>Sistemas Completos</h3>
                <p>Aplicaciones web complejas y portales a medida</p>
              </div>
            </div>
          </article>

        </section>
      
      <section className= "quienes-confiaron">
        <h2>¿QUIÉNES CONFIARON EN NOSOTROS?</h2>
        <ObtenerDatos />
      </section>
      </main>
      
    </div>
  );
};

export default Home;