import React, { useState, useEffect } from 'react';

// Las tablas que tienes permitidas en tu API
const TABLAS_PERMITIDAS = ['USUARIOS', 'TRABAJOS', 'REVIEWS'];

function Conexion() {
  // Estados para manejar los datos, el estado de carga y los errores
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para saber qué tabla estamos consultando
  const [tablaActual, setTablaActual] = useState('USUARIOS');

  // useEffect se ejecuta cuando el componente se monta y cada vez que 'tablaActual' cambia
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Empezamos a cargar
      setError(null);   // Limpiamos errores anteriores
      setData(null);    // Limpiamos datos anteriores

      try {
        // Construimos la URL de la API dinámicamente
        const API_URL = `http://localhost:3000/api/tabla/${tablaActual}`;

        const response = await fetch(API_URL);

        // Si la respuesta no es exitosa (ej: 403, 404, 500)
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }

        const result = await response.json();

        // Verificamos el flag 'success' de nuestra API
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'La API indicó un fallo.');
        }
      } catch (err) {
        // Capturamos cualquier error de red o de la lógica anterior
        setError(err.message);
      } finally {
        // Se ejecuta siempre, al final del try/catch
        setLoading(false); // Terminamos de cargar
      }
    };

    fetchData();
  }, [tablaActual]); // El array de dependencias: vuelve a ejecutar el efecto si 'tablaActual' cambia

  return (
    <div>
      <h1>Conexión con API de Oracle</h1>
      <div>
        <h3>Selecciona una tabla para consultar:</h3>
        {TABLAS_PERMITIDAS.map(tabla => (
          <button key={tabla} onClick={() => setTablaActual(tabla)} disabled={loading}>
            {tabla}
          </button>
        ))}
      </div>

      <hr />

      <h2>Resultados para: {tablaActual}</h2>

      {/* Renderizado condicional */}
      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && (
        <ul>
          {data.length > 0 ? data.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          )) : <p>La tabla no tiene datos.</p>}
        </ul>
      )}
    </div>
  );
}

export default Conexion;