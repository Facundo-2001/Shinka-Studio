import { useState } from 'react';
import Boton from '../../components/boton/Boton';

/* =========================================================
   Login del panel.

   Los mensajes de error los redacta el servidor (incluido el conteo de
   intentos que quedan) y se muestran tal cual: no se inventan textos acá,
   para que lo que lee la persona coincida con lo que de verdad pasó.
========================================================= */

export default function Login({ onEntrar, error, enviando = false }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  function alEnviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    onEntrar(usuario.trim(), password);
  }

  return (
    <div className="login">
      <form className="login__caja" onSubmit={alEnviar}>
        <h1 className="login__titulo">Panel de métricas</h1>
        <p className="login__intro">Entrá con tu usuario para ver las visitas del sitio.</p>

        <label className="login__campo">
          <span className="login__etiqueta">Usuario</span>
          <input
            className="login__input"
            type="text"
            name="usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            required
          />
        </label>

        <label className="login__campo">
          <span className="login__etiqueta">Contraseña</span>
          <input
            className="login__input"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="login__error" role="alert">
            {error}
          </p>
        )}

        <Boton
          type="submit"
          variant="primary"
          size="md"
          className="login__boton"
          disabled={enviando}
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </Boton>
      </form>
    </div>
  );
}
