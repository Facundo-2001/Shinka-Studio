import React from 'react';
import { Link } from 'react-router-dom';
import Boton from '../../components/boton/Boton.jsx';
import './Home.css'

const Home = () => {
  return (
    <section className="home-hero">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">
            Impulsamos las <span className="highlight-sales">Ventas</span> y el Crecimiento de tu Empresa
          </h1>
          <p className="home-description">
            Transformamos tu presencia digital en una máquina de generar clientes. Creamos soluciones tecnológicas estratégicas, diseñadas específicamente para multiplicar tus conversiones y llevar tu negocio al siguiente nivel.
          </p>
          <div className="home-actions">
            <Link to="/servicios" style={{ textDecoration: 'none' }}>
              <Boton variant="primary">Nuestros Servicios</Boton>
            </Link>
          </div>
        </div>
        <div className="home-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
            alt="Gráfico de crecimiento de ventas y análisis de datos" 
            className="home-image"
          />
        </div>
      </div>
    </section>
  );
};

export default Home;