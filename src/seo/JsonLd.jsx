/**
 * Inserta datos estructurados (schema.org) en la página.
 * Google los usa para entender de qué trata el sitio y para habilitar
 * resultados enriquecidos. Los esquemas viven en ./schemas.js
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
