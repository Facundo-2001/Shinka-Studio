import { useEffect, useState, useSyncExternalStore } from 'react';
import Boton from '../../components/boton/Boton';
import { ErrorApi, leerEstadisticas } from './api.js';
import { decimal, fechaLarga, nombreDispositivo, nombreOrigen, numero } from './formato.js';
import {
  definirRegistroDesactivado,
  leerEnServidor,
  registroDesactivado,
  suscribir,
} from '../../analitica/preferencias.js';
import GraficoSerie from './componentes/GraficoSerie.jsx';
import Ranking from './componentes/Ranking.jsx';
import TablaRecientes from './componentes/TablaRecientes.jsx';
import TarjetaResumen from './componentes/TarjetaResumen.jsx';

const RANGOS = [
  { dias: 7, etiqueta: '7 días' },
  { dias: 30, etiqueta: '30 días' },
  { dias: 90, etiqueta: '90 días' },
];

export default function Tablero({ onSesionVencida }) {
  const [dias, setDias] = useState(30);
  const [recarga, setRecarga] = useState(0);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [avisoRegistro, setAvisoRegistro] = useState(null);

  /**
   * El opt-out se lee del store externo, no de un estado copiado en un
   * efecto: así el prerenderizado en Node usa `leerEnServidor` y no hay
   * desajuste al hidratar.
   */
  const sinRegistro = useSyncExternalStore(suscribir, registroDesactivado, leerEnServidor);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const respuesta = await leerEstadisticas(dias);
        if (!activo) return;
        setDatos(respuesta);
        setError(null);
      } catch (fallo) {
        if (!activo) return;

        if (fallo instanceof ErrorApi && fallo.codigo === 'sin_sesion') {
          onSesionVencida('Tu sesión venció por inactividad. Volvé a entrar.');
          return;
        }

        setError(
          fallo instanceof ErrorApi ? fallo.message : 'No se pudieron cargar las métricas.'
        );
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [dias, recarga, onSesionVencida]);

  function cambiarRango(nuevo) {
    if (nuevo === dias) return;
    setCargando(true);
    setDias(nuevo);
  }

  function actualizar() {
    setCargando(true);
    setRecarga((n) => n + 1);
  }

  function alternarRegistro(evento) {
    const guardado = definirRegistroDesactivado(evento.target.checked);
    setAvisoRegistro(
      !guardado
        ? 'No se pudo guardar la preferencia en este navegador.'
        : evento.target.checked
          ? 'Listo: tus visitas en este navegador ya no se cuentan.'
          : 'Listo: tus visitas vuelven a contarse.'
    );
  }

  const resumen = datos && datos.resumen;
  const rango = datos && datos.rango;

  /* El servidor acota `dias` a 1..365, así que un rango de un solo día es
     alcanzable aunque el selector no lo ofrezca (basta con pedirle dias=1 a
     la API). Sin esto saldría "vs. los 1 días anteriores". */
  const periodo = dias === 1 ? 'el día anterior' : `los ${dias} días anteriores`;

  return (
    <div className="tablero">
      <div className="tablero__cabecera">
        <div>
          <h1 className="tablero__titulo">Visitas del sitio</h1>
          {rango && (
            <p className="tablero__rango">
              {rango.desde === rango.hasta
                ? `El ${fechaLarga(rango.desde)}`
                : `Del ${fechaLarga(rango.desde)} al ${fechaLarga(rango.hasta)}`}
            </p>
          )}
        </div>

        <div className="tablero__controles">
          <div className="tablero__rangos" role="group" aria-label="Período">
            {RANGOS.map((opcion) => (
              <button
                key={opcion.dias}
                type="button"
                className={`tablero__rango-boton${
                  opcion.dias === dias ? ' tablero__rango-boton--activo' : ''
                }`}
                aria-pressed={opcion.dias === dias}
                onClick={() => cambiarRango(opcion.dias)}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>

          <Boton variant="outline" size="sm" onClick={actualizar} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar'}
          </Boton>
        </div>
      </div>

      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}

      {cargando && !datos && <p className="panel-vacio">Cargando métricas…</p>}

      {resumen && (
        <>
          <section className="tablero__tarjetas">
            <TarjetaResumen
              heroica
              etiqueta="visitas"
              valor={numero(resumen.visitas)}
              cambio={resumen.visitas_variacion}
              periodo={periodo}
              pie={`${numero(resumen.visitas_hoy)} hoy`}
            />
            <TarjetaResumen
              etiqueta="visitantes únicos"
              valor={numero(resumen.visitantes)}
              cambio={resumen.visitantes_variacion}
              periodo={periodo}
              pie={`${numero(resumen.visitantes_hoy)} hoy`}
            />
            <TarjetaResumen
              etiqueta="páginas por visitante"
              valor={decimal(resumen.paginas_por_visitante)}
              pie={`${numero(resumen.visitas)} visitas de ${numero(resumen.visitantes)} visitantes`}
            />
            <TarjetaResumen
              etiqueta="histórico"
              valor={numero(resumen.historico.visitas)}
              pie={
                resumen.historico.primer_dia
                  ? `${numero(resumen.historico.visitantes)} visitantes desde el ${fechaLarga(
                      resumen.historico.primer_dia
                    )}`
                  : `${numero(resumen.historico.visitantes)} visitantes en total`
              }
            />
          </section>

          <section className="tablero__bloque">
            <h2 className="tablero__subtitulo">Evolución diaria</h2>
            <GraficoSerie serie={datos.serie} />
          </section>

          <div className="tablero__rejilla">
            <Ranking titulo="Páginas más vistas" filas={datos.paginas} metrica="visitas" />
            <Ranking
              titulo="De dónde llegan"
              filas={datos.origenes}
              metrica="visitantes"
              nombre={nombreOrigen}
            />
            <Ranking
              titulo="Dispositivo"
              filas={datos.dispositivos}
              metrica="visitantes"
              nombre={nombreDispositivo}
            />
            <Ranking titulo="Navegador" filas={datos.navegadores} metrica="visitantes" />
            {datos.geo_activo && (
              <Ranking titulo="País" filas={datos.paises} metrica="visitantes" />
            )}
          </div>

          <section className="tablero__bloque">
            <h2 className="tablero__subtitulo">Últimas visitas</h2>
            <TablaRecientes filas={datos.recientes} mostrarPais={datos.geo_activo} />
          </section>

          <footer className="tablero__pie">
            {resumen.bots > 0 && (
              <p className="tablero__nota">
                {numero(resumen.bots)} visitas de bots filtradas. No están incluidas en ninguno
                de los números de arriba.
              </p>
            )}

            <label className="tablero__opt-out">
              <input type="checkbox" checked={sinRegistro} onChange={alternarRegistro} />
              <span>No contar mis visitas desde este navegador</span>
            </label>

            {avisoRegistro && (
              <p className="tablero__nota" role="status">
                {avisoRegistro}
              </p>
            )}
          </footer>
        </>
      )}
    </div>
  );
}
