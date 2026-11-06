import { fechaHora, nombreDispositivo, nombreOrigen } from '../formato.js';

/* =========================================================
   Últimas visitas.

   `creado_en` viene en hora de Buenos Aires con formato "Y-m-d H:i:s" y se
   formatea a mano: pasarlo por `new Date()` lo leería como hora local de
   quien mira el panel y correría todos los horarios.
========================================================= */

export default function TablaRecientes({ filas = [], mostrarPais = true }) {
  if (filas.length === 0) {
    return <p className="panel-vacio">Todavía no hay visitas registradas.</p>;
  }

  return (
    <div className="recientes">
      <div className="recientes__caja">
        <table className="recientes__tabla">
          <caption className="panel-oculto">Últimas visitas registradas</caption>
          <thead>
            <tr>
              <th scope="col">Cuándo</th>
              <th scope="col">Página</th>
              <th scope="col">Origen</th>
              <th scope="col">Dispositivo</th>
              <th scope="col">Navegador</th>
              {mostrarPais && <th scope="col">País</th>}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, indice) => (
              <tr key={`${fila.creado_en}-${indice}`}>
                <td className="recientes__cuando">{fechaHora(fila.creado_en)}</td>
                <th scope="row" className="recientes__ruta">{fila.ruta}</th>
                <td>{nombreOrigen(fila.origen)}</td>
                <td>{nombreDispositivo(fila.dispositivo)}</td>
                <td>
                  {fila.navegador}
                  {fila.sistema ? <span className="recientes__sistema"> · {fila.sistema}</span> : null}
                </td>
                {mostrarPais && <td>{fila.pais || '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="recientes__pie">Horarios de Buenos Aires.</p>
    </div>
  );
}
