import React from 'react';
import './Reseñas.css'; // Importamos los nuevos estilos

// Este es un componente "tonto" (dumb/presentational).
// Solo se encarga de mostrar los datos que recibe por props.
function MostrarDatos({ reviews, loading, error }) {
  // Si está cargando, muestra un mensaje.
  if (loading) {
    return <div className="loading-message">Cargando reseñas...</div>;
  }

  // Si hubo un error, muestra el mensaje de error.
  if (error) {
    return <div className="error-message">Error al cargar los datos: {error}</div>;
  }

  // Si todo fue bien, mostramos las reseñas.
  return (
    <div className="reviews-container">
      {reviews.length > 0 ? (
        reviews.map(review => (
          <div key={review.id} className="review-card">
            <h3>{review.NombreDeNegocio}</h3>
            <p>Puntaje: {'⭐'.repeat(review.puntaje)}</p>
            <p>"{review.resenaInicial}"</p>
          </div>
        ))
      ) : (
        <p className="no-reviews-message">No hay reseñas para mostrar.</p>
      )}
    </div>
  );
}

export default MostrarDatos;
