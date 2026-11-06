import { useCallback, useEffect, useState } from 'react';
import Seo from '../../seo/Seo';
import Boton from '../../components/boton/Boton';
import { ErrorApi, cerrarSesion, iniciarSesion, leerSesion } from './api.js';
import Login from './Login.jsx';
import MarcoAdmin from './MarcoAdmin.jsx';
import Tablero from './Tablero.jsx';
import './Admin.css';
import './Tablero.css';

/* =========================================================
   Panel de administración (/admin).

   Esta ruta se prerenderiza igual que el resto del sitio, así que el
   componente se ejecuta en Node durante el build: durante el render no se
   puede tocar window, document, localStorage ni fetch. Todo eso vive en
   efectos, y el estado inicial dibuja un esqueleto de carga coherente.

   La autorización es del servidor. Esto solo decide qué se dibuja: la API
   corta con 401 antes de tocar datos si no hay sesión.
========================================================= */

/**
 * Los tres problemas de instalación se ven igual desde afuera y se arreglan
 * de forma distinta, por eso la API los separa en banderas y acá tiene cada
 * uno su cartel. `detalle` es el texto de respaldo: cuando la API manda su
 * propio `mensaje`, gana el de la API.
 */
const CARTELES = {
  'sin-config': {
    titulo: 'Falta el archivo de configuración',
    detalle: 'La API no encuentra su archivo de configuración.',
    quehacer: (
      <>
        Copiá <code>api/config.example.php</code> como <code>api/config.php</code>, o como{' '}
        <code>shinka-config.php</code> un nivel arriba de <code>public_html</code>, y completá
        los datos de la base.
      </>
    ),
  },
  'sin-base': {
    titulo: 'La base de datos no responde',
    detalle: 'El archivo de configuración está, pero MySQL no contesta.',
    quehacer: (
      <>
        Revisá el host, el nombre de la base, el usuario y la contraseña en la configuración
        de la API.
      </>
    ),
  },
  instalar: {
    titulo: 'Falta terminar la instalación',
    detalle: 'La base responde, pero todavía no hay ninguna cuenta de administrador.',
    quehacer: (
      <>
        Abrí <code>/api/instalar.php</code> para crear la cuenta. Acordate de borrar ese
        archivo del hosting cuando termines.
      </>
    ),
  },
};

/**
 * Traduce las banderas de la API al estado que hay que dibujar.
 *
 * Compara contra `false` a propósito: si alguna vez responde una versión de
 * la API que todavía no manda `config_ok` / `base_ok`, la bandera ausente se
 * da por buena y el panel cae en el camino viejo (instalado / login) en vez
 * de acusar un problema de configuración que no existe.
 */
function diagnosticar(datos) {
  if (datos.config_ok === false) return 'sin-config';
  if (datos.base_ok === false) return 'sin-base';
  if (!datos.instalado) return 'instalar';
  return datos.autenticado ? 'panel' : 'login';
}

export default function Admin() {
  const [fase, setFase] = useState('cargando');
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);
  const [mensajeApi, setMensajeApi] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const datos = await leerSesion();
        if (!activo) return;

        const siguiente = diagnosticar(datos);

        setMensajeApi(datos.mensaje || null);
        setUsuario(siguiente === 'panel' ? datos.usuario : null);
        if (siguiente === 'panel') setError(null);
        setFase(siguiente);
      } catch (fallo) {
        if (!activo) return;
        setError(fallo instanceof ErrorApi ? fallo.message : 'No se pudo contactar con la API.');
        setFase('sin-api');
      }
    })();

    return () => {
      activo = false;
    };
  }, [intento]);

  /** Vuelve a consultar la sesión: esqueleto primero, pedido después. */
  function volverAConsultar() {
    setError(null);
    setMensajeApi(null);
    setFase('cargando');
    setIntento((n) => n + 1);
  }

  async function entrar(nombre, password) {
    setEnviando(true);
    setError(null);
    try {
      const datos = await iniciarSesion(nombre, password);
      setUsuario(datos.usuario);
      setFase('panel');
    } catch (fallo) {
      // El mensaje lo redacta el servidor, con el conteo de intentos incluido.
      setError(fallo instanceof ErrorApi ? fallo.message : 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  async function salir() {
    setSaliendo(true);
    try {
      await cerrarSesion();
    } catch {
      // Si el logout no llegó, igual se vuelve al login: la cookie puede
      // seguir viva, pero quien esté frente a la pantalla no ve datos.
    } finally {
      setSaliendo(false);
      setUsuario(null);
      setError(null);
      setFase('login');
    }
  }

  const sesionVencida = useCallback((mensaje) => {
    setUsuario(null);
    setError(mensaje);
    setFase('login');
  }, []);

  const cartel = CARTELES[fase];

  return (
    <>
      <Seo
        title="Panel | Shinka Studio"
        description="Panel de administración."
        path="/admin"
        noindex
      />

      <MarcoAdmin usuario={fase === 'panel' ? usuario : null} onSalir={salir} saliendo={saliendo}>
        {fase === 'cargando' && <Esqueleto />}

        {fase === 'sin-api' && (
          <div className="admin__aviso">
            <h1 className="admin__aviso-titulo">No se pudo contactar con la API</h1>
            <p className="admin__aviso-texto">{error}</p>
            <Boton variant="primary" size="md" onClick={volverAConsultar}>
              Reintentar
            </Boton>
          </div>
        )}

        {cartel && (
          <div className="admin__aviso">
            <h1 className="admin__aviso-titulo">{cartel.titulo}</h1>
            {/* Si la API mandó su propio diagnóstico, se muestra tal cual. */}
            <p className="admin__aviso-texto">{mensajeApi || cartel.detalle}</p>
            <p className="admin__aviso-texto">{cartel.quehacer}</p>
            <Boton variant="outline" size="md" onClick={volverAConsultar}>
              Volver a comprobar
            </Boton>
          </div>
        )}

        {fase === 'login' && <Login onEntrar={entrar} error={error} enviando={enviando} />}

        {fase === 'panel' && <Tablero onSesionVencida={sesionVencida} />}
      </MarcoAdmin>
    </>
  );
}

/** Lo que se ve mientras se consulta la sesión, y lo que entrega el prerenderizado. */
function Esqueleto() {
  return (
    <div className="esqueleto" aria-hidden="true">
      <div className="esqueleto__linea esqueleto__linea--titulo" />
      <div className="esqueleto__tarjetas">
        <div className="esqueleto__bloque" />
        <div className="esqueleto__bloque" />
        <div className="esqueleto__bloque" />
        <div className="esqueleto__bloque" />
      </div>
      <div className="esqueleto__grafico" />
    </div>
  );
}
