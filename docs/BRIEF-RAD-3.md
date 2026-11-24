# RAD-3 · Incorporar el artefacto al sitio web

Brief para Claude Code. Rama: `RAD-3-Incorporar-el-artefacto-al-sitio-web`. Sitio en español.

## Antes de escribir código
1. Leer `AGENTS.md` y la guía de `node_modules/next/dist/docs/`: es Next.js 16 con `cacheComponents: true`, React 19 y Tailwind 4. No asumir APIs de versiones anteriores.
2. Abrir `docs/artefacto-referencia.html`: es el artefacto completo (HTML, CSS y JS) con las imágenes reemplazadas por `ASSET:imgNN`. Las imágenes ya están en `public/brand/artefacto/`.
3. Seguir `AGENTS.md`: datos de marca en `src/lib/site.ts`, componentes en `src/components/`, `app/` en la raíz.

## Estado actual del sitio
- `app/page.tsx` compone `SiteHeader`, `Hero`, `Services`, `Footer`.
- `src/lib/site.ts` tiene nombre, slogan, WhatsApp, maps y redes. Es la fuente única de esos datos.
- Paleta en `app/globals.css`: `moss #304538`, `lime #a4be00`, `mist #f0ffff`, `ink #0a0a0a`. Fuente Geist.
- Servicios hoy: 3 tarjetas fijas (Armado a medida, Mantenimiento, Actualización), sin precios.

## Decisiones tomadas con el usuario
- **Quién:** Claude Code aplica y prueba.
- **Estilo: mezcla.** Conservar header, footer, paleta y estructura actuales. Sumar del artefacto las secciones y el lenguaje visual (recortes lima en diagonal, paneles con título fijo, ticker). Tipografía display del artefacto (Archivo extendida) solo para títulos; el cuerpo sigue en la fuente actual. Cargarla con `next/font/google`, no con el `<link>` del artefacto.
- **Secciones a incorporar:** Presupuesto interactivo, Antes y después, Sucursales y opiniones, Nosotros / FAQ / formulario de contacto.
- **Precios:** salen del Google Sheet y cualquier cambio en la planilla debe verse en el sitio (ver abajo).
- **Sucursales:** no cambian. Quedan fijas en código.
- **Indicadores por zona norte y zona sur:** dejar una base. Ver sección propia: NO va en la página pública.

## Mapa de secciones (artefacto → proyecto)
| Artefacto | Componente nuevo | Notas |
|---|---|---|
| Loader lima | opcional, `Loader.tsx` | Solo primera visita de la sesión; respetar `prefers-reduced-motion`. Consultar si se quiere. |
| Ticker | `Ticker.tsx` | Con botón Pausar (accesibilidad). |
| Servicios y precios | reemplaza `Services.tsx` | Grupos con panel sticky + filas con precio y botón +. Datos desde el Sheet. |
| Presupuesto | `Quote.tsx` (client) | Estado de selección, total animado, mensaje a WhatsApp, selector de sucursal, minibarra móvil. |
| Trabajos | `BeforeAfter.tsx` (client) | Slider de comparación. Hoy son 3 marcos de ejemplo: faltan fotos reales de antes y después. |
| Sucursales | `Branches.tsx` | Datos fijos en `src/lib/branches.ts`. |
| Nosotros | `About.tsx` | Usa `img05.webp` (El Sabio). |
| FAQ | `Faq.tsx` | Texto en el artefacto; revisar que los precios citados salgan de los datos y no escritos a mano. |
| Contacto | reemplaza el bloque de `Footer.tsx` | Formulario que abre WhatsApp con el mensaje escrito. Mantener redes y mapa actuales del footer. |

Imágenes: `img01` loader, `img02` isotipo, `img03` logotipo, `img04` foto del hero (GPU Sapphire Nitro), `img05` El Sabio, `img06`/`img07` iconos de grupo. Los logos ya existen en `public/brand/web/`; reutilizarlos y no duplicar `img01–03` si son equivalentes.

## Precios desde Google Sheets
Planilla: `https://docs.google.com/spreadsheets/d/1O0LIwPQVG79rBAxJfZNddLDQntqE4YIlfUCnN0vKso8` (PRECIOS_SERVICIO, pestaña `PRECIOS_RADAZPC`, rango A1:B38).

**Propuesta:**
1. En el Sheet: Archivo → Compartir → Publicar en la web → solo la pestaña de precios → formato CSV. El archivo pesa ~15 MB y puede tener otras pestañas: publicar SOLO la de precios.
2. En Next: función server `getPrices()` que hace `fetch` del CSV publicado, parsea y devuelve la estructura de grupos e ítems. Cachear con el mecanismo de Next 16 (`"use cache"` con `cacheLife` de unos 5–15 min). Revisar en la doc local cómo se declara con `cacheComponents`.
3. URL del CSV en variable de entorno (`PRICES_CSV_URL`), no en el código.
4. Fallback: si el fetch falla, usar un `src/lib/services.fallback.ts` con los precios actuales para que el sitio nunca quede sin precios.

**Problema del formato actual:** la planilla es una lista de lectura humana, no una tabla. Los grupos son filas con texto decorativo (caracteres de ancho completo y emojis), la columna B mezcla `$12,000`, `77500 - 85,000`, `Desde $ 50000`, `20 USD`, `-` y las notas "Consultar cotización" están dentro del texto de la descripción. Parsearlo es frágil: cambiar un emoji o un texto rompe la web.

**Recomendación:** agregar una pestaña nueva `WEB` en el Sheet con columnas explícitas: `id`, `grupo`, `nombre`, `descripcion`, `precio_min`, `precio_max`, `moneda` (ARS/USD), `desde` (sí/no), `consultar` (sí/no), `orden`, `visible`. Puede alimentarse con fórmulas desde `PRECIOS_RADAZPC`. El sitio lee esa pestaña. Si el usuario prefiere no tocar la planilla, parsear la actual con `normalize("NFKC")` en los encabezados de grupo y tests unitarios del parser con los 38 valores de hoy.

**Discrepancia a resolver (GPU):** el artefacto usa una tabla de limpieza de GPU por generación (30.000 / 32.500 / 35.500 / 38.000) que venía de otra planilla (`DATOS_GPU_PRECIO`). `PRECIOS_RADAZPC` dice `27500-35000` para la misma fila. Confirmar con el usuario cuál es la vigente antes de publicar. La tabla por generación también debería salir del Sheet.

Otros valores del artefacto que hay que contrastar con la planilla: Windows 8 y Windows 7 figuran juntos en el artefacto ($20.000); en la planilla son dos filas. Los rangos "77500 - 85,000" (mantenimiento completo) y OEM en USD (20 y 30) ya están contemplados en el artefacto.

## Indicadores por sucursal (base, sin publicar aún)
Fuente: planilla "REGISTRO DE GASTOS - RadazPC" (en realidad es un registro de pagos por trabajo). El ID de la planilla no se guarda en el repo (es público): va solo en una variable de entorno `INDICATORS_SHEET_ID`.

**Qué tiene la planilla hoy**
- Una pestaña por mes (`RP-MM-AA`, de 08-24 a 06-26) y una pestaña `Trabajos` con el catálogo de tipos (Diagnóstico, Mantenimiento, Instalación de Sistemas Operativos, Ensamble de Componentes, etc.).
- Columnas: Trabajo/s, Descripción, Estado (Completada, En curso, Sin empezar, Omitida), Nombre Cliente, Monto, Medio de Pago, Fecha de inicio, Fecha de entrega, MES. Desde 04-25 suma "Atendido Por" (Tomy, Seba) y desde 06-25 "Dispositivo" (PC ESCRITORIO, NOTEBOOK) y "Teléfono".
- **No existe una columna de sucursal.** Con estos datos no se puede separar zona norte de zona sur. "Atendido Por" no es un sustituto confiable sin confirmación del usuario.

**Problemas de calidad de datos (el código tiene que tolerarlos o el usuario debe corregirlos)**
- El orden de columnas cambia entre pestañas, y los encabezados tienen celdas combinadas.
- Montos como `$24.500,00`, `$5.000`, `90000` y `$ 50,000`, mezclados; hay que normalizar el formato argentino (punto de miles, coma decimal).
- Fechas `15/08/2024`, `30/09/24`, `9/3/25`, `6/5/26`: formato dd/mm con año de 2 o 4 dígitos.
- `RP-10-24` repite los 6 trabajos de `RP-09-24` con fechas de septiembre. Si se suman, septiembre se cuenta dos veces. Hay que dedupicar o corregir en la planilla.
- Hay filas vacías con solo "NOTEBOOK" o "PC ESCRITORIO", la fila "Total del Mes" dentro de los datos y totales que incluyen trabajos "Sin empezar" o "En curso".
- Hay huecos: no hay pestañas de oct-25 a feb-26 ni de jul-26 en adelante.
- Tipos de trabajo inconsistentes: `Varios`, `no especificado` o vacío.
- Pestaña `RP-3-26`: el total del mes dice 24.000 con solo dos filas con datos.

**Privacidad (obligatorio)**
- La planilla tiene nombres y teléfonos de clientes. Nada de eso llega al navegador: el servidor lee la planilla, agrega los datos (por mes, tipo de trabajo, dispositivo, medio de pago, atendido por) y entrega solo totales.
- No copiar la planilla al repo (es público) ni dejarla en `public/`. Agregar los ejemplos de prueba con datos inventados.
- La ruta `app/indicadores/` va protegida (login simple o contraseña con variable de entorno) y con `robots: noindex`, fuera del sitemap. Mientras no esté la autenticación, no desplegar la ruta.
- La planilla compartida por enlace es visible para cualquiera que tenga el link. Recomendar al usuario cambiarla a acceso restringido y leerla desde el servidor con una cuenta de servicio.

**Qué hacer ahora**
- Tipos TypeScript del modelo (`Job`: fecha, tipo, dispositivo, monto, medio de pago, estado, atendidoPor, sucursal?) y una capa `src/lib/indicators.ts` con fuente intercambiable (Sheets o JSON de ejemplo).
- Parser tolerante con tests unitarios sobre los casos raros de arriba.
- Página `app/indicadores/page.tsx` con filtro de sucursal (deshabilitado hasta tener el dato), mes, tarjetas de KPI (ingresos, cantidad de trabajos completados, ticket promedio, % transferencia vs efectivo), ingresos por mes, trabajos por tipo, notebook vs PC.
- Campo `sucursal` opcional en el modelo, a la espera de la respuesta del usuario.

**Para habilitar norte y sur** el usuario debe elegir una: (a) agregar una columna `Sucursal` en cada pestaña a partir de ahora y completar el historial, (b) decidir que "Atendido Por" define la sucursal, o (c) llevar un registro separado por sucursal.

## Datos de sucursales (fijos, vienen del artefacto)
- Aguaray: Aguaray 26, Salta. Tel 0387 565-9971. WhatsApp 5493875659971. 5,0 con 100 opiniones. Cierra 23:00.
- Zona Norte: Barrio Universidad Católica, Mz. 507 Casa 18, San Mateo Apóstol esquina San Pedro Apóstol, Salta. Tel 0387 527-8489. WhatsApp 5493875278489. 5,0 con 58 opiniones. Cierra 23:00.
- Las valoraciones son "al 14/10/2026" según las fichas de Google. Mostrar esa fecha.
- Hoy `site.ts` tiene un solo WhatsApp (link de mensaje). El presupuesto y el formulario usan el WhatsApp de la sucursal elegida. Extender `site.ts` o crear `branches.ts`, sin repetir URLs en componentes.

## Reglas de calidad
- Server Components por defecto; `"use client"` solo en `Quote`, `BeforeAfter`, `Faq` (si usa estado) y el formulario.
- Accesibilidad que ya trae el artefacto y hay que conservar: enlace "Saltar al contenido", `aria-live` en el total, foco visible, botones con `aria-label`, `prefers-reduced-motion`.
- Usar `next/image` para las imágenes.
- Los textos de FAQ y "Nosotros" son del artefacto; no inventar cifras ni reseñas nuevas.
- No publicar el aviso "Los tres marcos son de ejemplo" ni los textos de muestra del presupuesto en producción: reemplazar por fotos reales o esconder la sección hasta tenerlas.

## Verificación
```
npm run lint
npx tsc --noEmit
npm run build
npm run dev   # revisar en 375 px y en escritorio
```
Probar: sumar y quitar servicios, que el total y el mensaje de WhatsApp coincidan, que cambiar un precio en el Sheet se vea tras el tiempo de caché, y que el sitio siga funcionando con el fetch caído (fallback).

Commits con el prefijo `RAD-3:` para que Jira los vincule.

## Pendientes del usuario
- [ ] Publicar la pestaña de precios como CSV y pasar la URL (o aprobar la pestaña `WEB`).
- [ ] Confirmar el precio vigente de limpieza de GPU.
- [ ] Decidir cómo se identifica la sucursal en el registro (columna nueva, "Atendido Por" u otro) y qué es "zona sur".
- [ ] Revisar `RP-10-24` (duplica septiembre) y los huecos de meses.
- [ ] Restringir el acceso de la planilla de registro.
- [ ] Fotos reales de antes y después.
