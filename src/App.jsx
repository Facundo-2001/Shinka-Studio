import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home.jsx';
import Servicios from './pages/servicios/Servicios.jsx';
import SobreNosotros from './pages/sobreNosotros/SobreNosotros.jsx';
import Contacto from './pages/contacto/Contacto.jsx';
import IniciarSesion from './pages/login/IniciarSesion.jsx';
import CrearCuenta from './pages/login/CrearCuenta.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="sobre-nosotros" element={<SobreNosotros />} />
          <Route path="contacto" element={<Contacto />} />
          {/* Rutas de autenticación */}
          <Route path="login" element={<IniciarSesion />} />
          <Route path="crear-cuenta" element={<CrearCuenta />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
