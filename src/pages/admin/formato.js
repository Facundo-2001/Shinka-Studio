/**
 * Formato en español de Argentina y mapas de etiquetas del panel.
 *
 * Las fechas se parsean a mano a propósito: la API manda "Y-m-d H:i:s" en
 * hora de Buenos Aires y `new Date("2026-11-06 11:42:08")` lo interpretaría
 * como hora local de quien mira, corriendo los valores.
 */

const LOCALE = 'es-AR';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/* =========================================================
   Números
========================================================= */

/** Miles con punto: 9000 -> "9.000". */
export function numero(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—';
  return valor.toLocaleString(LOCALE);
}

/** Decimales con coma: 2.71 -> "2,71". */
export function decimal(valor, digitos = 2) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—';
  return valor.toLocaleString(LOCALE, {
    minimumFractionDigits: digitos,
    maximumFractionDigits: digitos,
  });
}

/**
 * Variación con signo: 23.4 -> "+23,4%".
 * Devuelve null cuando la API manda null (el período anterior fue 0).
 * null significa "sin comparación", NO 0%.
 */
export function variacion(valor) {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return null;
  const signo = valor > 0 ? '+' : '';
  return `${signo}${valor.toLocaleString(LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/* =========================================================
   Fechas
========================================================= */

const PATRON = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/;

function partes(valor) {
  const encontrado = PATRON.exec(String(valor ?? ''));
  if (!encontrado) return null;
  return {
    anio: Number(encontrado[1]),
    mes: Number(encontrado[2]),
    dia: Number(encontrado[3]),
    hora: encontrado[4] ?? null,
    minuto: encontrado[5] ?? null,
  };
}

/** "2026-10-08" -> "8 oct". */
export function fechaCorta(valor) {
  const p = partes(valor);
  if (!p) return String(valor ?? '—');
  return `${p.dia} ${MESES_CORTOS[p.mes - 1]}`;
}

/** "2026-10-08" -> "8 de octubre de 2026". */
export function fechaLarga(valor) {
  const p = partes(valor);
  if (!p) return String(valor ?? '—');
  return `${p.dia} de ${MESES[p.mes - 1]} de ${p.anio}`;
}

/** "2026-11-06 11:42:08" -> "6 nov, 11:42" (hora de Buenos Aires). */
export function fechaHora(valor) {
  const p = partes(valor);
  if (!p) return String(valor ?? '—');
  if (p.hora === null) return fechaCorta(valor);
  return `${p.dia} ${MESES_CORTOS[p.mes - 1]}, ${p.hora}:${p.minuto}`;
}

/* =========================================================
   Etiquetas
========================================================= */

/**
 * Orígenes reconocidos. Cualquier otro valor que mande la API es un dominio
 * crudo y se muestra tal cual.
 */
const ORIGENES = {
  directo: 'Directo',
  interno: 'Navegación interna',
  google: 'Google',
  yahoo: 'Yahoo',
  ecosia: 'Ecosia',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  bing: 'Bing',
  duckduckgo: 'DuckDuckGo',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  reddit: 'Reddit',
  email: 'Email',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
};

export const nombreOrigen = (clave) => ORIGENES[clave] ?? String(clave ?? '—');

/** Los datos vienen sin tilde; en pantalla va "Móvil". */
const DISPOSITIVOS = {
  movil: 'Móvil',
  tablet: 'Tablet',
  escritorio: 'Escritorio',
  desconocido: 'Desconocido',
};

export const nombreDispositivo = (clave) => DISPOSITIVOS[clave] ?? String(clave ?? '—');

/* =========================================================
   Escala de los gráficos
========================================================= */

/**
 * Techo y marcas "redondas" para el eje Y (0 / 500 / 1.000), siempre en
 * números enteros: las métricas son conteos y un tick de 0,25 visitas no
 * significa nada.
 */
export function escalaBonita(maximo, pasos = 4) {
  const marcas = (paso) =>
    Array.from({ length: pasos + 1 }, (_, i) => paso * i);

  if (!Number.isFinite(maximo) || maximo <= 0) {
    return { maximo: pasos, ticks: marcas(1) };
  }

  const crudo = maximo / pasos;
  const magnitud = 10 ** Math.floor(Math.log10(crudo));
  const normalizado = crudo / magnitud;
  const multiplo = [1, 2, 2.5, 5, 10].find((m) => normalizado <= m) ?? 10;
  const paso = Math.max(1, Math.ceil(multiplo * magnitud));

  return { maximo: paso * pasos, ticks: marcas(paso) };
}
