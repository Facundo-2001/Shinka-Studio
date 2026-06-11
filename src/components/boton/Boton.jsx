import React from 'react';
import './Boton.css';

export default function Boton({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  // Determinamos la clase de la variante a utilizar
  const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary';

  return (
    <button 
      className={`btn ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}