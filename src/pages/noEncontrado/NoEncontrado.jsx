import Boton from '../../components/boton/Boton.jsx';
import Seo from '../../seo/Seo.jsx';
import './NoEncontrado.css';

export default function NoEncontrado() {
  return (
    <>
      <Seo
        title="Página no encontrada | Shinka Studio"
        description="La página que buscás no existe o cambió de dirección. Volvé al inicio para seguir navegando."
        path="/404"
        noindex
      />

      <section className="page-hero no-encontrado">
        <div className="container page-hero__inner">
          <span className="no-encontrado__codigo" aria-hidden="true">404</span>
          <h1>No encontramos esta página</h1>
          <p className="page-hero__lead">
            Puede que el enlace esté roto o que la página haya cambiado de dirección.
            Probá desde el inicio o contanos qué estabas buscando.
          </p>
          <div className="page-hero__actions">
            <Boton to="/" variant="accent" size="lg">Volver al inicio</Boton>
            <Boton to="/contacto" variant="ghost" size="lg">Contactarnos</Boton>
          </div>
        </div>
      </section>
    </>
  );
}
