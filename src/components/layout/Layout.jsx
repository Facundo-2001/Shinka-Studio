import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import BotonWhatsApp from '../whatsapp/BotonWhatsApp';
import './Layout.css';

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido principal</a>

      <Header />

      <main id="contenido" className="layout-main">
        <Outlet />
      </main>

      <Footer />
      <BotonWhatsApp />
    </>
  );
}
