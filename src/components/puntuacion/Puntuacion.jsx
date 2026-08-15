import React from 'react';
import './Puntuacion.css';

/**
 * Componente de presentación ("dumb") que renderiza una calificación con estrellas.
 * @param {object} props
 * @param {number} props.puntuacion - Un número entero del 1 al 5 que representa la calificación.
 */
const Puntuacion = ({ puntuacion = 0 }) => {
  const totalEstrellas = 5;
  const estrellasRenderizadas = [];

  for (let i = 1; i <= totalEstrellas; i++) {
    // Añade una estrella llena si el índice es menor o igual a la puntuación, de lo contrario, añade una vacía.
    const tipoEstrella = i <= puntuacion ? 'llena' : 'vacia';
    estrellasRenderizadas.push(<span key={i} className={`estrella ${tipoEstrella}`}>★</span>);
  }

  return <div className="puntuacion-container">{estrellasRenderizadas}</div>;
};

export default Puntuacion;