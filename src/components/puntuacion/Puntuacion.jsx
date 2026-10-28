import './Puntuacion.css';

/**
 * Calificación con estrellas. Expone el valor como texto accesible
 * para lectores de pantalla además de mostrarlo visualmente.
 */
export default function Puntuacion({ puntuacion = 0, total = 5 }) {
  return (
    <div
      className="puntuacion"
      role="img"
      aria-label={`Calificación: ${puntuacion} de ${total} estrellas`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`puntuacion__estrella ${index < puntuacion ? 'is-llena' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
