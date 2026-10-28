import { NavLink } from 'react-router-dom';
import './Nav.css';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/servicios', label: 'Servicios' },
  { to: '/sobre-nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Nav({ isOpen = false, onNavigate }) {
  return (
    <nav
      id="menu-principal"
      className={`nav ${isOpen ? 'nav--open' : ''}`}
      aria-label="Navegación principal"
    >
      <ul className="nav__list">
        {links.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              onClick={onNavigate}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <NavLink to="/contacto" className="nav__cta" onClick={onNavigate}>
        Pedir presupuesto
      </NavLink>
    </nav>
  );
}
