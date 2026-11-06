import Boton from '../../components/boton/Boton';

/* =========================================================
   Marco del panel: logo, usuario y salir.

   Va fuera del Layout del sitio, así que no tiene header público, footer
   ni botón de WhatsApp. El logo enlaza al sitio para poder volver.
========================================================= */

export default function MarcoAdmin({ usuario, onSalir, saliendo = false, children }) {
  return (
    <div className="admin">
      <header className="admin__barra">
        <a className="admin__marca" href="/">
          <img
            className="admin__logo"
            src="/logos/logo-compacto.png"
            alt="Shinka Studio"
            width="36"
            height="36"
          />
          <span className="admin__marca-texto">
            Panel
            <span className="admin__marca-sitio">shinkastudio.dev</span>
          </span>
        </a>

        {usuario && (
          <div className="admin__usuario">
            <span className="admin__usuario-nombre">{usuario.usuario}</span>
            <Boton variant="outline" size="sm" onClick={onSalir} disabled={saliendo}>
              {saliendo ? 'Saliendo…' : 'Salir'}
            </Boton>
          </div>
        )}
      </header>

      <main className="admin__contenido">{children}</main>
    </div>
  );
}
