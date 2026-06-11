import React, { useState, useEffect, useCallback } from 'react';
import './Carrusel.css';

export default function Carrusel({ 
  images = [], 
  autoPlay = true, 
  interval = 4000 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para avanzar a la siguiente imagen
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // Función para retroceder a la imagen anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Efecto para manejar la reproducción automática
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    
    // Limpiamos el intervalo si el componente se desmonta o cambia
    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length, nextSlide]);

  if (!images || images.length === 0) {
    return null; // No renderizamos nada si no hay imágenes
  }

  return (
    <div className="carrusel-container">
      <div 
        className="carrusel-inner" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => {
          // Soportar tanto arreglos de strings (URLs) como de objetos {src, alt}
          const src = typeof img === 'string' ? img : img.src;
          const alt = typeof img === 'string' ? `Slide ${index + 1}` : (img.alt || `Slide ${index + 1}`);
          
          return (
            <div className="carrusel-slide" key={index}>
              <img src={src} alt={alt} />
            </div>
          );
        })}
      </div>
      
      {/* Botones de navegación */}
      <button className="carrusel-btn prev" onClick={prevSlide}>&#10094;</button>
      <button className="carrusel-btn next" onClick={nextSlide}>&#10095;</button>
      
      {/* Indicadores (Dots) */}
      <div className="carrusel-indicators">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${currentIndex === index ? 'active' : ''}`} 
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}
