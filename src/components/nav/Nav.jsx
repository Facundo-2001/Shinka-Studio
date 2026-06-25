import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Importamos el ícono de usuario
import './Nav.css';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="nav-container">
      <div className="hamburger" onClick={toggleMenu}>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
      </div>
      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li>
          <NavLink to="/" className="nav-btn-inicio" onClick={closeMenu}>Inicio</NavLink>
        </li>
        <li><NavLink to="/servicios" onClick={closeMenu}>Servicios</NavLink></li>
        <li><NavLink to="/sobre-nosotros" onClick={closeMenu}>Sobre Nosotros</NavLink></li>
        <li><NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink></li>
        {/* Ícono de usuario que enlaza a /login */}
        <li className="nav-user-icon-item">
          <NavLink to="/login" className="nav-user-icon" title="Iniciar Sesión" onClick={closeMenu}><FaUserCircle /></NavLink>
        </li>
      </ul>
    </nav>
  );
}
