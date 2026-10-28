import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../nav/Nav.jsx';
import './Header.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerramos el menú al cambiar de ruta (incluye ir y volver con el navegador).
  // Se ajusta durante el render, el patrón que React recomienda para derivar
  // estado de un valor cambiante, en lugar de hacerlo dentro de un efecto.
  const [rutaDelMenu, setRutaDelMenu] = useState(pathname);
  if (rutaDelMenu !== pathname) {
    setRutaDelMenu(pathname);
    setIsMenuOpen(false);
  }

  // Bloqueamos el scroll del fondo mientras el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        <Link to="/" className="header__logo" aria-label="Shinka Studio, ir al inicio">
          <img
            src="/logos/logo-compacto.png"
            alt="Shinka Studio"
            width="424"
            height="205"
            className="header__logo-img"
          />
        </Link>

        <Nav isOpen={isMenuOpen} onNavigate={() => setIsMenuOpen(false)} />

        <button
          type="button"
          className={`header__burger ${isMenuOpen ? 'is-open' : ''}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="menu-principal"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span className="header__burger-bar" />
          <span className="header__burger-bar" />
          <span className="header__burger-bar" />
        </button>
      </div>
    </header>
  );
}
