import { FaGraduationCap, FaHandshake, FaPenNib, FaFlag } from 'react-icons/fa';
import Boton from '../../components/boton/Boton.jsx';
import Reveal from '../../components/reveal/Reveal.jsx';
import Seo from '../../seo/Seo.jsx';
import JsonLd from '../../seo/JsonLd.jsx';
import { breadcrumbSchema } from '../../seo/schemas.js';
import { pages } from '../../seo/siteConfig.js';
import './SobreNosotros.css';

const valores = [
  {
    icono: FaGraduationCap,
    titulo: 'Formación universitaria',
    texto:
      'Todo el equipo son Técnicos Universitarios en Programación recibidos en la UTN. Eso es lo que hace que un diseño cuidado además cargue rápido y no falle.',
  },
  {
    icono: FaHandshake,
    titulo: 'Trato directo',
    texto:
      'Hablás con quien programa tu sitio, no con un intermediario. Respuestas claras, sin tecnicismos innecesarios.',
  },
  {
    icono: FaPenNib,
    titulo: 'Diseño a medida',
    texto:
      'Nada de plantillas recicladas. Cada proyecto se dibuja desde cero según tu marca y tu rubro.',
  },
  {
    icono: FaFlag,
    titulo: 'Compromiso local',
    texto:
      'Creemos en el talento argentino. Trabajamos para que las pymes y los emprendedores del país compitan de igual a igual.',
  },
];

const datos = [
  { valor: '100%', etiqueta: 'Diseño propio, sin plantillas' },
  { valor: '24 h', etiqueta: 'Para responder tu consulta' },
  { valor: 'UTN', etiqueta: 'Formación técnica del equipo' },
  { valor: 'Todo el país', etiqueta: 'Alcance de nuestro servicio' },
];

export default function SobreNosotros() {
  const meta = pages.sobreNosotros;

  return (
    <>
      <Seo title={meta.title} description={meta.description} path={meta.path} />
      <JsonLd data={breadcrumbSchema([{ name: 'Sobre nosotros', path: '/sobre-nosotros' }])} />

      {/* ============ ENCABEZADO ============ */}
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Sobre nosotros</span>
          <h1>Un estudio obsesionado con cómo se ve tu negocio</h1>
          <p className="page-hero__lead">
            Somos Shinka Studio: un equipo argentino que diseña y programa sitios
            para pymes, comercios y emprendedores que no quieren parecer uno más
            del montón.
          </p>
        </div>
      </section>

      {/* ============ RELATO ============ */}
      <section className="section">
        <div className="container nosotros">
          <div className="nosotros__texto">
            <span className="eyebrow">Nuestra historia</span>
            <h2>Quiénes somos</h2>

            <p>
              <strong>Shinka Studio</strong> nació con una misión concreta: potenciar
              la industria nacional. Nos dedicamos a que las pequeñas empresas, las
              pymes, los comercios y los emprendedores particulares tengan una
              presencia digital a la altura de lo que hacen todos los días.
            </p>

            <p>
              Nuestro equipo está compuesto íntegramente por{' '}
              <span className="destacado">
                Técnicos Universitarios en Programación recibidos en la UTN
              </span>{' '}
              (Universidad Tecnológica Nacional). Esa formación es la que sostiene el
              diseño: una web puede verse increíble y aun así andar mal, y nosotros no
              entregamos ninguna de las dos mitades a medias.
            </p>

            <p>
              Creemos en el talento local y queremos ser el aliado tecnológico que te
              permita crecer. Entendemos los desafíos de un negocio argentino porque
              los vivimos de cerca, y estamos acá para transformarlos en
              oportunidades digitales concretas.
            </p>

            <div className="nosotros__acciones">
              <Boton to="/servicios" variant="primary">Ver nuestros servicios</Boton>
              <Boton to="/contacto" variant="outline">Trabajemos juntos</Boton>
            </div>
          </div>

          <Reveal className="nosotros__media">
            <img
              src="/images/home2.jpg"
              alt="Equipo de Shinka Studio trabajando en el desarrollo de un sitio web"
              loading="lazy"
              decoding="async"
              width="800"
              height="900"
            />
          </Reveal>
        </div>
      </section>

      {/* ============ DATOS ============ */}
      <section className="section section--dark">
        <div className="container datos">
          {datos.map(({ valor, etiqueta }, index) => (
            <Reveal className="dato" key={etiqueta} delay={index * 80}>
              <span className="dato__valor">{valor}</span>
              <span className="dato__etiqueta">{etiqueta}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ VALORES ============ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Nuestra forma de trabajar</span>
            <h2>Qué podés esperar de nosotros</h2>
            <p className="section-lead">
              Cuatro principios que aplicamos en cada proyecto, sin importar su tamaño.
            </p>
          </div>

          <div className="valores">
            {valores.map(({ icono: Icono, titulo, texto }, index) => (
              <Reveal className="valor card" key={titulo} delay={index * 90}>
                <span className="valor__icon"><Icono aria-hidden="true" /></span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-final">
        <div className="container cta-final__inner">
          <div className="cta-final__text">
            <h2>Contanos qué necesita tu negocio</h2>
            <p>
              Escuchamos tu idea, te damos nuestra opinión honesta y te pasamos un
              presupuesto claro. Sin compromiso y sin letra chica.
            </p>
          </div>
          <div className="cta-final__actions">
            <Boton to="/contacto" variant="accent" size="lg">
              Empezar mi proyecto
            </Boton>
          </div>
        </div>
      </section>
    </>
  );
}
