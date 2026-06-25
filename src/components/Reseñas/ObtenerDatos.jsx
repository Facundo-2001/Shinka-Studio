import { useState, useEffect } from 'react';
import MostrarDatos from './MostrarDatos.jsx'; // Importamos el componente de presentación

// Este es un componente "inteligente" (smart/container).
// Se encarga de la lógica: obtener los datos y manejar los estados.
function ObtenerDatos() {
  // 1. Estados para los datos, la carga y los errores.
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Efecto para hacer la llamada a la API cuando el componente se monta.
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost/api-shinka/api.php');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReviews(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []); // El array vacío asegura que se ejecute solo una vez.

  // 3. Renderiza el componente de presentación y le pasa los datos y estados.
  return <MostrarDatos reviews={reviews} loading={loading} error={error} />;
}

export default ObtenerDatos;
