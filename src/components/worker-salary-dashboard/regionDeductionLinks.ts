/**
 * Enlaces de apoyo para las deducciones autonomicas propias, que este motor no
 * calcula. No hay una URL estable por comunidad (cada agencia reorganiza su web
 * cada campana), asi que apuntamos a una busqueda ya preparada con el nombre de
 * la comunidad para que el usuario llegue a la fuente oficial vigente.
 */

export type RegionDeductionLink = {
  /** Nombre de la comunidad tal y como se muestra en el aviso. */
  label: string;
  /** Busqueda preparada de las deducciones autonomicas de esa comunidad. */
  href: string;
};

/** Nombres con acentos: se usan en el texto del aviso y en la busqueda. */
const REGION_SEARCH_LABELS: Record<string, string> = {
  andalucia: "Andalucía",
  aragon: "Aragón",
  asturias: "Asturias",
  illes_balears: "Illes Balears",
  canarias: "Canarias",
  cantabria: "Cantabria",
  castilla_la_mancha: "Castilla-La Mancha",
  castilla_y_leon: "Castilla y León",
  cataluna: "Cataluña",
  extremadura: "Extremadura",
  galicia: "Galicia",
  madrid: "Comunidad de Madrid",
  murcia: "Región de Murcia",
  la_rioja: "La Rioja",
  comunitat_valenciana: "Comunitat Valenciana",
};

function buildSearchHref(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Devuelve el enlace de busqueda para la comunidad indicada. Si no conocemos la
 * comunidad (o no hay ninguna seleccionada) se devuelve una busqueda generica.
 */
export function getRegionDeductionLink(region?: string): RegionDeductionLink {
  const label = region ? REGION_SEARCH_LABELS[region] : undefined;
  if (!label) {
    return {
      label: "tu comunidad autónoma",
      href: buildSearchHref("deducciones autonómicas IRPF por comunidad autónoma"),
    };
  }
  return {
    label,
    href: buildSearchHref(`deducciones autonómicas IRPF ${label}`),
  };
}

export default getRegionDeductionLink;
