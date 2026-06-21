import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import './Reseñas.css';

const Reseñas = ({ 
  imagenURL, 
  NombreDeNegocio, 
  puntaje, 
  resenaInicial = "", 
  canEdit = false, 
  onSaveReview 
}) => {
  // Estados para controlar la calificación seleccionada, el hover y el texto
  const [rating, setRating] = useState(puntaje);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(resenaInicial);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (index) => {
    if (canEdit) {
      setRating(index + 1);
    }
  };

  const handleMouseEnter = (index) => {
    if (canEdit) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (canEdit) {
      setHoverRating(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSaveReview) return;

    setIsSubmitting(true);
    try {
      // Envía los datos actualizados a la función contenedora que conecta con el backend
      await onSaveReview({ rating, reviewText });
    } catch (error) {
      console.error("Error al procesar la reseña:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-card">
      <div className="review-image-container">
        <img src={imagenURL} alt={NombreDeNegocio} className="review-image" />
      </div>

      <div className="review-content">
        <h3 className="business-name">{NombreDeNegocio}</h3>

        {/* Bucle de 5 posiciones para renderizar las estrellas */}
        <div className="stars-container">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            // Determina si se dibuja una estrella llena o vacía basándose en el estado o el hover
            const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating;

            return (
              <span
                key={index}
                className={`star-icon ${canEdit ? 'editable' : ''}`}
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {isFilled ? <FaStar /> : <FaRegStar />}
              </span>
            );
          })}
        </div>

        {/* Renderizado condicional basado en la autorización del usuario */}
        {canEdit ? (
          <form onSubmit={handleSubmit} className="review-form">
            <textarea
              className="review-textarea"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Escribe aquí tu testimonio o detalles sobre el servicio recibido..."
              required
            />
            <button type="submit" className="review-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Publicar Reseña'}
            </button>
          </form>
        ) : (
          // Si no puede editar, solo se muestra el texto de forma estática en modo lectura
          reviewText && <p className="review-text">"{reviewText}"</p>
        )}
      </div>
    </div>
  );
};

export default Reseñas;