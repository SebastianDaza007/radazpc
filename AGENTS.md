<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Notas del proyecto (Radaz PC)

Landing de Radaz PC, mantenimiento y armado de PC en Salta Capital, Argentina. El sitio va en español.

## Stack
- Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript.
- Sin base de datos. Lectura de Google Sheets y autenticación de administradores en el servidor; ver `docs/OPERACION.md`.

## Estructura
- `app/`: rutas y layout. El App Router va en la raíz; no usar `src/app`.
- `src/components/`: componentes de UI.
- `src/lib/`: utilidades y configuración. `site.ts` tiene nombre, links y WhatsApp: usar esa fuente en vez de repetir URLs en componentes.
- `public/`: assets estáticos (logos e imágenes).
- `.agents/skills/ui-ux-pro-max/`: skill de diseño UI/UX, instalada con `ui-ux-pro-max-cli@2.15.0`.

## Marca
- Nombre: "Radaz PC". Slogan: "Tu experiencia, nuestra prioridad".
- Paleta del manual: `#304538` verde musgo, `#A4BE00` verde amarillo, `#F0FFFF` cian pálido, `#0A0A0A` negro.
- Tipografías del manual: Monument Extended (principal) y Helvetica (secundaria). Revisar licencias antes de usarlas en web.
- El manual de marca no está en el repo.

## Verificación
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
