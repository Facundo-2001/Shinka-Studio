import { numero } from '../formato.js';

/* =========================================================
   Ranking de barras horizontales.

   Una sola serie, así que no lleva leyenda ni color por fila: todas las
   barras van en --brand-600 y la comparación la da el largo.

   Las cinco listas de la API usan la misma clave `clave`, por eso un solo
   componente sirve para páginas, orígenes, dispositivos, navegadores y
   países. Lo que cambia es la métrica que ordena: `paginas` viene ordenado
   por visitas (es una propiedad de la página vista) y el resto por
   visitantes (son propiedades de la persona).
========================================================= */

export default function Ranking({
  titulo,
  filas = [],
  metrica = 'visitantes',
  nombre = (clave) => clave,
  vacio = 'Todavía no hay datos en este período.',
}) {
  const etiquetaMetrica = metrica === 'visitas' ? 'visitas' : 'visitantes';
  const tope = filas.reduce((maximo, fila) => Math.max(maximo, fila[metrica]), 0);

  return (
    <section className="ranking">
      <h3 className="ranking__titulo">{titulo}</h3>

      {filas.length === 0 ? (
        <p className="panel-vacio">{vacio}</p>
      ) : (
        <ul className="ranking__lista">
          {filas.map((fila) => {
            const valor = fila[metrica];
            const ancho = tope > 0 ? Math.max((valor / tope) * 100, 1.5) : 0;

            return (
              <li key={fila.clave} className="ranking__fila" tabIndex={0}>
                <span className="ranking__etiqueta">{nombre(fila.clave)}</span>

                <div className="ranking__pista">
                  <div className="ranking__barra" style={{ width: `${ancho}%` }} />
                  <span className="ranking__valor" style={{ left: `${ancho}%` }}>
                    {numero(valor)}
                  </span>
                </div>

                <span className="ranking__detalle">
                  {numero(fila.visitas)} visitas · {numero(fila.visitantes)} visitantes
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {filas.length > 0 && (
        <p className="ranking__pie">Ordenado por {etiquetaMetrica}.</p>
      )}
    </section>
  );
}
