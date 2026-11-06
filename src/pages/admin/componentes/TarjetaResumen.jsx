import { variacion as formatearVariacion } from '../formato.js';

/* =========================================================
   Tarjeta de resumen.

   `heroica` marca la única cifra grande de toda la vista: si todas gritan,
   ninguna se escucha. El resto va en tamaño normal.

   `cambio` puede ser null y eso NO es 0%: significa que el período anterior
   fue cero y no hay con qué comparar. Se dice con palabras, en gris.
========================================================= */

export default function TarjetaResumen({
  etiqueta,
  valor,
  cambio,
  periodo,
  pie,
  heroica = false,
}) {
  const texto = formatearVariacion(cambio);

  return (
    <article className={`tarjeta${heroica ? ' tarjeta--heroica' : ''}`}>
      <p className="tarjeta__etiqueta">{etiqueta}</p>
      <p className="tarjeta__valor">{valor}</p>

      {cambio !== undefined && (
        <p className={`tarjeta__cambio${texto === null ? ' tarjeta__cambio--sin-dato' : ''}`}>
          {texto === null ? 'Sin comparación: el período anterior fue cero.' : `${texto} vs. ${periodo}`}
        </p>
      )}

      {pie && <p className="tarjeta__pie">{pie}</p>}
    </article>
  );
}
