import type { GroupMeta, PriceCatalog, ServiceItem } from "./services.types.ts";

function item(
  id: string,
  name: string,
  description: string,
  extra: Partial<ServiceItem> = {},
): ServiceItem {
  return {
    id,
    name,
    description,
    currency: "ARS",
    from: false,
    ask: false,
    ...extra,
  };
}

/** Group copy, keyed by slugified group title (see `slugify`). The CSV parser uses it too. */
export const GROUP_META: Record<string, GroupMeta> = {
  "mantenimiento-y-limpieza": {
    icon: "gpu",
    blurb: "Limpieza a fondo, orden de cables y cambio de pasta térmica Arctic MX-4.",
  },
  "sistemas-operativos-y-software": {
    icon: "pc",
    blurb: "Windows optimizado, programas de edición y diseño, drivers, BIOS y recuperación de datos.",
  },
  "ensamble-overclock-y-undervolt": {
    icon: "gpu",
    blurb: "Armado de tu PC con los componentes que ya compraste y ajustes finos de rendimiento y temperatura.",
  },
};

export const FALLBACK_CATALOG: PriceCatalog = {
  groups: [
    {
      id: "mantenimiento-y-limpieza",
      title: "Mantenimiento y limpieza",
      ...GROUP_META["mantenimiento-y-limpieza"],
      items: [
        item("diag", "Revisión y diagnóstico", "Diagnóstico de errores en la integridad de la PC.", { min: 12000 }),
        item("mfull", "Mantenimiento completo con placa de video", "Limpieza del gabinete completo, orden de cables y cambio de pasta térmica Arctic MX-4. Incluye placa de video.", { min: 77500, max: 85000, ask: true }),
        item("mbasic", "Mantenimiento básico, sin placa de video", "Limpieza básica, orden de cables y pasta térmica Arctic MX-4 en el procesador.", { min: 50000 }),
        item("mnote", "Mantenimiento de notebook", "Con cambio de pasta térmica Arctic MX-4.", { min: 50000, from: true, ask: true }),
        item("paste", "Cambio de pasta térmica", "Arctic MX-4 o ID-Cooling Frost X25.", { min: 17000 }),
        // TODO(RAD-3): confirmar con el dueño el precio vigente de limpieza de GPU.
        // Fuente de verdad: planilla PRECIOS_RADAZPC (27.500 a 35.000). Se descartó la tabla por generación de DATOS_GPU_PRECIO.
        item("gpu", "Limpieza de GPU con cambio de pasta térmica", "Alcohol isopropílico y pasta Arctic MX-4 o ID-Cooling Frost X25. El precio depende de la generación. Los thermal pads se cotizan aparte.", { min: 27500, max: 35000, ask: true }),
      ],
    },
    {
      id: "sistemas-operativos-y-software",
      title: "Sistemas operativos y software",
      ...GROUP_META["sistemas-operativos-y-software"],
      items: [
        item("w11", "Windows 10 LTSC / 11 Pro con optimización", "Instalación y optimización del sistema operativo.", { min: 35000 }),
        item("w11o", "Windows 10/11 Pro, optimización y Office 2024", "Sistema operativo optimizado más Office 2024, con licencia digital.", { min: 50000 }),
        item("w78", "Windows 7 u 8 optimizado", "Libre de bloatware, con mínimos procesos y consumo del sistema al mínimo.", { min: 20000 }),
        item("lic", "Licencia de Windows 10/11 digital", "Licencia digital para tu equipo.", { min: 10000 }),
        item("oem10", "Licencia de Windows 10 OEM", "Se cotiza según el momento.", { min: 20, currency: "USD", ask: true }),
        item("oem11", "Licencia de Windows 11 OEM", "Se cotiza según el momento.", { min: 30, currency: "USD", ask: true }),
        item("office", "Instalación de Office", "El valor depende de la versión.", { min: 15000, max: 30000 }),
        item("edit", "Combo edición: Premiere Pro, Lightroom y Photoshop", "Instalación y configuración de los tres programas.", { min: 20000 }),
        item("adobe", "Pack Adobe CC completo", "Instalación de más de 15 programas.", { min: 25000 }),
        item("acad", "AutoCAD 2025", "Instalación y configuración.", { min: 50000 }),
        item("opt", "Optimización del sistema", "Menos consumo y carga de discos y procesador, sin procesos innecesarios ni archivos basura. Mejora Windows y la GPU.", { min: 15000 }),
        item("bios", "Actualización de BIOS", "", { min: 15000 }),
        item("drv", "Actualización de drivers", "", { min: 7500 }),
        item("data", "Recuperación de datos", "", { min: 10000 }),
        item("disk", "Verificación de unidades de almacenamiento", "Salud, velocidad e integridad de los sectores.", { min: 5000 }),
        item("custom", "Programas personalizados", "Contanos qué necesitás instalar y te pasamos el valor.", { ask: true }),
      ],
    },
    {
      id: "ensamble-overclock-y-undervolt",
      title: "Ensamble, overclock y undervolt",
      ...GROUP_META["ensamble-overclock-y-undervolt"],
      items: [
        item("asm", "Ensamblaje con componentes ya comprados", "", { min: 30000 }),
        item("asmp", "Ensamblaje con cambio de pasta de fábrica por Arctic MX-4", "", { min: 45000 }),
        item("used", "Ayuda para comprar componentes usados", "CPU, placa de video, RAM y más.", { min: 5000, max: 7000, ask: true }),
        item("occ", "Overclock de CPU", "", { min: 4000 }),
        item("uvc", "Undervolt de CPU", "", { min: 4000 }),
        item("ocuvc", "Overclock y undervolt de CPU", "", { min: 6000 }),
        item("uvg", "Undervolt de GPU", "", { min: 4000 }),
        item("ocuvg", "Overclock y undervolt de GPU", "", { min: 6000 }),
        item("fan", "Curva de ventilación", "", { min: 5000 }),
      ],
    },
  ],
};
