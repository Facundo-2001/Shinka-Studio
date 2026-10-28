import { Link } from 'react-router-dom';
import './Boton.css';

/**
 * Botón polimórfico: renderiza <Link>, <a> o <button> según las props.
 * Así evitamos anidar un <button> dentro de un <a>, que es HTML inválido
 * y confunde tanto a los lectores de pantalla como a los buscadores.
 */
export default function Boton({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  ...props
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
