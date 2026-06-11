import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../nav/Nav.jsx';
import logo from '../../assets/logo.png';
import './Header.css';

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="header-logo-link">
          <img src={logo} alt="Shinka Studio" className="header-logo-img" />
        </Link>
        
        <Nav />
      </div>
    </header>
  );
}
