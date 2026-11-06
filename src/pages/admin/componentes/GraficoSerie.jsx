import { useRef, useState } from 'react';
import Boton from '../../../components/boton/Boton';
import useConsultaMedia from '../useConsultaMedia.js';
import { escalaBonita, fechaCorta, fechaLarga, numero } from '../formato.js';

/* =========================================================
   Serie temporal: visitas y visitantes por día.

   El cian de `visitantes` da 2,12:1 de contraste sobre blanco, por debajo
   del mínimo de 3:1. Por eso el color NUNCA es el único canal: hay leyenda,
   etiqueta directa en el extremo de cada línea, tooltip y tabla. Si se saca
   la tabla, el gráfico queda inaccesible.

   DOS VIEWBOX, UNO POR BREAKPOINT
   Un SVG escala entero con su ancho, tipografía incluida. Con un viewBox
   fijo de 820 dibujado en un teléfono de 390px, la escala queda en ~0,4x:
   el texto de 13px se ve de 5px y el gráfico, de 124px de alto, es una
   línea decorativa. Por eso el viewBox angosto no es el ancho achicado sino
   otra proporción, más alta que ancha, y de un tamaño parecido al real en
   pantalla. Así 13px vuelven a verse como 13px y no hay que compensar nada
   en el CSS.
========================================================= */

const VB = {
  ancho: { ancho: 820, alto: 320 },
  angosto: { ancho: 360, alto: 330 },
};

const PAD = {
  // En el ancho, `derecha` es la calle de las etiquetas del extremo.
  ancho: { arriba: 24, derecha: 104, abajo: 40, izquierda: 56 },
  angosto: { arriba: 16, derecha: 24, abajo: 34, izquierda: 44 },
};

const SERIES = [
  { clave: 'visitas', nombre: 'Visitas', color: 'var(--brand-600)' },
  { clave: 'visitantes', nombre: 'Visitantes', color: 'var(--accent-500)' },
];

export default function GraficoSerie({ serie = [] }) {
  const svgRef = useRef(null);
  const [activo, setActivo] = useState(null);
  const [verTabla, setVerTabla] = useState(false);
  const angosto = useConsultaMedia('(max-width: 40rem)');

  if (serie.length === 0) {
    return <p className="panel-vacio">Todavía no hay visitas registradas en este período.</p>;
  }

  const vb = angosto ? VB.angosto : VB.ancho;
  const pad = angosto ? PAD.angosto : PAD.ancho;

  const anchoTrama = vb.ancho - pad.izquierda - pad.derecha;
  const altoTrama = vb.alto - pad.arriba - pad.abajo;
  const base = pad.arriba + altoTrama;

  /* En el viewBox angosto no hay calle para las etiquetas del extremo: la
     leyenda de arriba ya identifica las dos series. */
  const conEtiquetasExtremo = !angosto;

  /* Con poco ancho los marcadores se tocan y el gráfico se vuelve una hilera
     de puntos. En rangos largos quedan solo los extremos y el punto activo. */
  const topeMarcadores = angosto ? 10 : 31;

  const maximo = serie.reduce(
    (tope, punto) => Math.max(tope, punto.visitas, punto.visitantes),
    0
  );
  const escala = escalaBonita(maximo);

  const ultimo = serie.length - 1;

  const x = (indice) =>
    serie.length === 1
      ? pad.izquierda + anchoTrama / 2
      : pad.izquierda + (indice / ultimo) * anchoTrama;

  const y = (valor) => base - (valor / escala.maximo) * altoTrama;

  const linea = (clave) =>
    serie.map((punto, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(punto[clave])}`).join(' ');

  const area = (clave) => `${linea(clave)} L ${x(ultimo)} ${base} L ${x(0)} ${base} Z`;

  /* --- Marcas del eje X: primera, última y algunas intermedias --- */
  const cantidadMarcas = Math.min(serie.length, 4);
  const indicesX =
    serie.length === 1
      ? [0]
      : Array.from({ length: cantidadMarcas }, (_, i) =>
          Math.round((i / (cantidadMarcas - 1)) * ultimo)
        ).filter((valor, i, lista) => lista.indexOf(valor) === i);

  /* --- Etiquetas directas en el extremo, separadas si se cruzan --- */
  const etiquetas = SERIES.map((s) => ({ ...s, y: y(serie[ultimo][s.clave]) })).sort(
    (a, b) => a.y - b.y
  );
  if (etiquetas[1].y - etiquetas[0].y < 18) {
    etiquetas[0].y -= 9;
    etiquetas[1].y += 9;
  }

  /* --- Puntero y teclado --- */
  function alMover(evento) {
    const svg = svgRef.current;
    if (!svg) return;
    const caja = svg.getBoundingClientRect();
    if (caja.width === 0) return;

    const xVb = ((evento.clientX - caja.left) / caja.width) * vb.ancho;
    const proporcion = (xVb - pad.izquierda) / anchoTrama;
    const indice = Math.round(proporcion * ultimo);
    setActivo(Math.max(0, Math.min(ultimo, indice)));
  }

  function alTeclear(evento) {
    if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return;
    evento.preventDefault();
    const paso = evento.key === 'ArrowRight' ? 1 : -1;
    setActivo((previo) => {
      const desde = previo === null ? (paso > 0 ? -1 : serie.length) : previo;
      return Math.max(0, Math.min(ultimo, desde + paso));
    });
  }

  const punto = activo === null ? null : serie[activo];
  const porcentajeX = punto === null ? 0 : (x(activo) / vb.ancho) * 100;
  const ancla = porcentajeX > 72 ? 'fin' : porcentajeX < 16 ? 'inicio' : 'centro';

  const resumenAccesible = `Visitas y visitantes por día, del ${fechaLarga(
    serie[0].dia
  )} al ${fechaLarga(serie[ultimo].dia)}. Máximo del período: ${numero(maximo)}.`;

  return (
    <figure className="grafico">
      <figcaption className="grafico__cabecera">
        <ul className="grafico__leyenda">
          {SERIES.map((s) => (
            <li key={s.clave} className="grafico__leyenda-item">
              <span
                className="grafico__punto"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.nombre}
            </li>
          ))}
        </ul>

        <Boton
          variant="outline"
          size="sm"
          onClick={() => setVerTabla((v) => !v)}
          aria-expanded={verTabla}
        >
          {verTabla ? 'Ocultar tabla' : 'Ver tabla'}
        </Boton>
      </figcaption>

      <div className="grafico__lienzo">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${vb.ancho} ${vb.alto}`}
          className="grafico__svg"
          role="img"
          aria-label={resumenAccesible}
          tabIndex={0}
          onPointerMove={alMover}
          onPointerLeave={() => setActivo(null)}
          onBlur={() => setActivo(null)}
          onKeyDown={alTeclear}
        >
          {/* Grilla y marcas del eje Y, en números redondos y completos */}
          {escala.ticks.map((valor) => (
            <g key={valor}>
              <line
                x1={pad.izquierda}
                x2={pad.izquierda + anchoTrama}
                y1={y(valor)}
                y2={y(valor)}
                className="grafico__grilla"
              />
              <text x={pad.izquierda - 10} y={y(valor) + 4} className="grafico__tick-y">
                {numero(valor)}
              </text>
            </g>
          ))}

          {/* Eje X */}
          <line
            x1={pad.izquierda}
            x2={pad.izquierda + anchoTrama}
            y1={base}
            y2={base}
            className="grafico__eje"
          />

          {indicesX.map((indice) => (
            <text key={indice} x={x(indice)} y={base + 22} className="grafico__tick-x">
              {fechaCorta(serie[indice].dia)}
            </text>
          ))}

          {/* Crosshair */}
          {activo !== null && (
            <line
              x1={x(activo)}
              x2={x(activo)}
              y1={pad.arriba}
              y2={base}
              className="grafico__crosshair"
            />
          )}

          {/* Relleno de área al 10% y línea de 2px */}
          {SERIES.map((s) => (
            <path key={`a-${s.clave}`} d={area(s.clave)} fill={s.color} fillOpacity="0.1" />
          ))}

          {SERIES.map((s) => (
            <path
              key={`l-${s.clave}`}
              d={linea(s.clave)}
              fill="none"
              stroke={s.color}
              className="grafico__linea"
            />
          ))}

          {/* Marcadores con anillo blanco, para que se lean al cruzarse */}
          {SERIES.map((s) =>
            serie.map((p, i) => {
              const visible =
                serie.length <= topeMarcadores || i === 0 || i === ultimo || i === activo;
              if (!visible) return null;
              return (
                <circle
                  key={`m-${s.clave}-${i}`}
                  cx={x(i)}
                  cy={y(p[s.clave])}
                  r={i === activo ? 6 : 4.5}
                  fill={s.color}
                  className="grafico__marcador"
                />
              );
            })
          )}

          {/* Etiqueta directa: el texto va en gris, la identidad la da el punto */}
          {conEtiquetasExtremo &&
            etiquetas.map((s) => (
              <g key={`e-${s.clave}`}>
                <circle
                  cx={x(ultimo) + 14}
                  cy={s.y}
                  r="4"
                  fill={s.color}
                  className="grafico__marcador"
                />
                <text x={x(ultimo) + 24} y={s.y + 4} className="grafico__etiqueta-directa">
                  {s.nombre}
                </text>
              </g>
            ))}
        </svg>

        {punto !== null && (
          <div
            className={`grafico__tooltip grafico__tooltip--${ancla}`}
            style={{ left: `${porcentajeX}%` }}
            role="status"
          >
            <p className="grafico__tooltip-dia">{fechaLarga(punto.dia)}</p>
            <ul className="grafico__tooltip-lista">
              {SERIES.map((s) => (
                <li key={s.clave}>
                  <span
                    className="grafico__punto"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  <span>{s.nombre}</span>
                  <strong>{numero(punto[s.clave])}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {verTabla && (
        <div className="grafico__tabla-caja">
          <table className="grafico__tabla">
            <caption className="panel-oculto">Visitas y visitantes por día</caption>
            <thead>
              <tr>
                <th scope="col">Día</th>
                <th scope="col">Visitas</th>
                <th scope="col">Visitantes</th>
              </tr>
            </thead>
            <tbody>
              {serie.map((p) => (
                <tr key={p.dia}>
                  <th scope="row">{fechaLarga(p.dia)}</th>
                  <td>{numero(p.visitas)}</td>
                  <td>{numero(p.visitantes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
