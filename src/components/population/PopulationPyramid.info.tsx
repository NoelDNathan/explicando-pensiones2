import {
  CalendarDays,
  Clock3,
  Database,
  ExternalLink,
  FileDown,
  FileText,
  Globe2,
  HelpCircle,
  Info,
  ShieldCheck,
} from 'lucide-react'
import type { IndicatorInfoModalContent } from '../pension-overview/IndicatorInfoModal'

export const POPULATION_PYRAMID_INFO = {
  title: 'Informacion del indicador',
  subtitle: 'Piramide poblacional de Espana',
  tabs: [
    { label: 'Resumen' },
    { label: 'Fuentes', active: true },
    { label: 'Metodologia' },
    { label: 'Notas' },
    { label: 'Descargas' },
  ],
  sections: [
    {
      title: 'Fuente de informacion',
      icon: <Info size={16} />,
      items: [
        <><strong>INE ECP, tabla 56934:</strong> poblacion residente observada por fecha, sexo y edad, usada para 1975-2025 a 1 de enero.</>,
        <><strong>INE Proyecciones de Poblacion, tabla 36643:</strong> poblacion residente proyectada por sexo y edad, usada para 2026-2070.</>,
        <><strong>INE ECP, tabla 56937:</strong> poblacion por sexo, grupo de edad y pais de nacimiento, usada para diferenciar nacidos en Espana y nacidos en el extranjero en 2002-2025.</>,
        <><strong>Modelo propio por cohortes:</strong> capa metodologica 2026-2070 para lugar de nacimiento, calibrada contra totales oficiales del INE.</>,
      ],
    },
    {
      title: 'Metodologia',
      icon: <Database size={16} />,
      body: (
        <p>
          El componente representa la estructura de poblacion por edad y sexo en
          miles de personas. Cuando existe dato observado por lugar de nacimiento,
          divide cada barra entre nacidos en Espana y nacidos en el extranjero.
          Para anos futuros, la poblacion total por edad y sexo sigue la
          proyeccion oficial del INE; la capa por nacimiento es una estimacion
          separada, no una tabla oficial cruzada edad-sexo-nacimiento.
        </p>
      ),
      orderedItems: [
        <><strong>Recopilacion:</strong> descarga y conservacion de brutos oficiales del INE para poblacion observada, proyecciones y lugar de nacimiento.</>,
        <><strong>Limpieza:</strong> normalizacion de sexo, edad simple o grupo de edad, fecha de referencia y unidad en miles/personas.</>,
        <><strong>Union temporal:</strong> uso de observado hasta 2025 y proyeccion oficial desde 2026, sin mezclar ambos estados en un mismo punto.</>,
        <><strong>Capa por nacimiento:</strong> para 2002-2025 se usa dato observado; desde 2026 se envejece el stock de 2025, se aplican flujos migratorios y mortalidad por edad y sexo, y se calibra al total INE de nacidos en el extranjero.</>,
        <><strong>Visualizacion:</strong> barras hacia la izquierda para hombres, hacia la derecha para mujeres, eje central de edades, franja 20-64 como edad laboral de referencia visual y colores atenuados fuera de esa franja.</>,
      ],
    },
    {
      title: 'Definiciones clave',
      icon: <HelpCircle size={16} />,
      items: [
        <><strong>Edad:</strong> grupo quinquenal o edad simple agregada visualmente segun el dataset recibido por el componente.</>,
        <><strong>Edad de trabajar:</strong> franja visual 20-64 anos usada para lectura comparativa; no sustituye la definicion legal exacta de actividad o jubilacion.</>,
        <><strong>Nacidos en Espana / extranjero:</strong> clasificacion por lugar de nacimiento, no por nacionalidad administrativa.</>,
        <><strong>Estado del dato:</strong> observado para ECP, proyectado para proyecciones oficiales INE y modelizado para la capa futura por nacimiento.</>,
      ],
    },
    {
      title: 'Limitaciones y supuestos',
      icon: <ShieldCheck size={16} />,
      body: (
        <p>
          La proyeccion por sexo y edad procede del INE, pero el cruce futuro
          por lugar de nacimiento no esta disponible como tabla oficial completa.
          Por eso la capa nacidos en Espana/extranjero posterior a 2025 debe
          leerse como modelizacion propia. La franja 20-64 es una ayuda visual
          para interpretar sostenibilidad demografica y no equivale por si sola
          a cotizantes reales, empleo efectivo ni edad legal de jubilacion.
        </p>
      ),
    },
  ],
  stats: [
    { label: 'Ultima actualizacion', value: '1 de enero de 2025', icon: <CalendarDays size={26} /> },
    { label: 'Cobertura', value: 'Espana', icon: <Globe2 size={26} /> },
    { label: 'Frecuencia', value: 'Anual', icon: <Clock3 size={26} /> },
    { label: 'Nivel de confianza', value: 'Oficial + modelizado', icon: <ShieldCheck size={26} /> },
  ],
  downloads: [
    { label: 'CSV observado', icon: <FileText size={17} /> },
    { label: 'CSV proyeccion', icon: <FileText size={17} /> },
    { label: 'Ficha metodologica', icon: <FileDown size={17} /> },
    { label: 'Ver fuente original', icon: <ExternalLink size={18} /> },
  ],
  help: {
    title: 'Mas informacion',
    body: (
      <p>
        Antes de usar esta vista como dato editorial, revisar `data/metadata.md`,
        `data/inventory.md` y `data/methodology/transformations.md` para confirmar
        estado del dato, checksums y rupturas metodologicas.
      </p>
    ),
    href: 'mailto:info@pensionesenespana.es',
    linkLabel: 'info@pensionesenespana.es',
  },
  primaryActionLabel: 'Ver fuente original',
} satisfies IndicatorInfoModalContent
