# Datos y administración de Radaz PC

## Dos fuentes independientes

- Precios públicos: `PRICES_SHEET_ID` y `PRICES_SHEET_GID` identifican la pestaña `PRECIOS_RADAZPC`. Se lee directamente su CSV exportado, sin crear una pestaña WEB ni editar precios en el código. `PRICES_CSV_URL` permite usar un CSV publicado alternativo y tiene prioridad.
- Indicadores privados: `INDICATORS_SHEET_ID` identifica el registro de pagos. El servidor descubre las pestañas existentes `RP-MM-AA` o `RP-M-AA`, desde agosto de 2024 hasta el mes actual. `Trabajos` queda excluida. `INDICATORS_SHEET_TABS` permite limitar la selección explícitamente.

La configuración real está en `.env.local`, excluida de Git. En el hosting hay que cargar las mismas variables en su configuración privada y volver a desplegar. Nunca usar prefijos `NEXT_PUBLIC_` para estos valores.

## Actualización de precios

Editar la descripción en A o el precio en B de la planilla habitual. Se admiten importes, rangos, `Desde`, USD y filas para consultar. Un precio vacío se muestra como consulta; no se reemplaza con el valor antiguo. Windows 7 y Windows 8 permanecen separados.

Google `gviz` descarta algunos valores de las columnas con tipos mezclados. Por eso se usa `export?format=csv&gid=...`, que preserva rangos y USD. No sustituir esa exportación por gviz.

Next renueva los precios en segundo plano con las visitas después de 10 minutos; puede servirse la versión anterior mientras termina la renovación. Una página ya abierta debe recargarse para ver los datos nuevos. No hay un evento en tiempo real enviado por Google.

Si Google falla o el formato no es válido, el sitio usa `src/lib/services.fallback.ts`. Ese catálogo de contingencia es estático y puede estar desactualizado; la actualización automática depende de poder leer la planilla.

## Indicadores mensuales

Entrar por `/admin/login` (también accesible desde `/admin`). Tras autenticarse se abre `/indicadores` con el último mes registrado seleccionado. Se pueden cambiar el mes y la sucursal, consultar ingresos de trabajos completados, cantidad de trabajos, ticket promedio y distribución por servicio, dispositivo, pago y persona que atendió.

Los períodos se asignan por **fecha de inicio**, no por fecha de cobro. Los importes incluyen solo estado `Completada`. No se calculan gastos ni ganancia neta porque la fuente actual registra trabajos/pagos. Los meses sin filas aparecen como `Sin registros`.

La lectura se renueva en segundo plano con las visitas después de 15 minutos. Si alguna pestaña existente no puede descargarse, no se presenta una suma parcial como completa. Los datos brutos se procesan en el servidor; el navegador recibe solo agregados. La identidad del cliente se utiliza únicamente como huella para evitar duplicados entre pestañas, conservando trabajos distintos con la misma fecha e importe.

No se deduce la sucursal por quién atendió. Para separar Aguaray y Zona Norte hay que completar una columna `Sucursal` o `Zona`; las filas antiguas sin dato quedan en `Sin asignar`.

La protección del panel no cambia los permisos de Google: las planillas compartidas por enlace conservan ese acceso. Para restringir el registro de clientes en Google será necesario agregar autenticación de servicio del servidor antes de quitarle el acceso por enlace.

## Administrador sin base de datos

La versión actual tiene una cuenta administradora compartida, configurada por servidor:

- `ADMIN_USERNAME`: usuario.
- `ADMIN_PASSWORD_HASH`: huella scrypt con sal aleatoria, sin contraseña en texto plano.
- `ADMIN_SESSION_SECRET`: secreto aleatorio para firmar sesiones.

`npm run admin:setup` crea la cuenta local con una contraseña aleatoria, muestra la contraseña una sola vez y guarda únicamente la huella y el secreto en `.env.local`. Se niega a sobrescribir una cuenta existente. Para cambiarla, usar `npm run admin:setup -- --reset`, guardar la nueva contraseña y reiniciar el servidor. Cambiar usuario, huella o secreto invalida las sesiones anteriores. La configuración de producción se cambia por separado en el hosting.

Las sesiones vencen a las 8 horas y usan cookies HttpOnly, SameSite Strict y Secure en producción. Las acciones de login se ejecutan en el servidor y conservan la protección de origen de Next. Hay demoras crecientes tras intentos fallidos. Este límite usa memoria del proceso y una cookie por navegador: en hosting con varias instancias no sustituye un limitador compartido. La cuenta no tiene registro público ni recuperación por correo. Para cuentas personales, roles o revocación individual hará falta almacenamiento persistente o un proveedor de identidad.

## Verificación

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run verify:prices
npm run verify:indicators
npm run verify:auth
npm run verify:sheets
```

La última prueba consulta ambas planillas con `.env.local`; no guarda clientes, CSV ni copias de las planillas en el repositorio. Las demás pruebas usan datos inventados. Para comprobar propagación sin tocar la planilla real, la prueba de precios modifica un CSV ficticio y comprueba que cambie el presupuesto.
