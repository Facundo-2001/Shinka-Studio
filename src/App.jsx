import { Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/scrollToTop/ScrollToTop';
import Home from './pages/home/Home.jsx';
import Servicios from './pages/servicios/Servicios.jsx';
import SobreNosotros from './pages/sobreNosotros/SobreNosotros.jsx';
import Contacto from './pages/contacto/Contacto.jsx';
import NoEncontrado from './pages/noEncontrado/NoEncontrado.jsx';
import Admin from './pages/admin/Admin.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/*
          El panel va FUERA del Layout: tiene su propio marco y no lleva
          header público, footer ni botón de WhatsApp. Además, como el
          registro de visitas se monta en Layout, /admin queda fuera del
          conteo por construcción.
        */}
        <Route path="/admin" element={<Admin />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="sobre-nosotros" element={<SobreNosotros />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </>
  );
}
