# Guía de despliegue — App MIPyV + Limpieza y Saneamiento (frente de carga)

Esta app es un conjunto de archivos estáticos (HTML/CSS/JS). No necesita
servidor propio: se aloja gratis en GitHub Pages, igual que tus otras apps
(SIEQ, app_limpieza, HMH Contraincendios). El "cerebro" de guardado vive en
un pequeño script pegado directamente en la planilla de Google.

La app tiene una pantalla de inicio para elegir el módulo:
- **MIPyV** (azul) — control de plagas y vectores, como ya lo veníamos armando.
- **Limpieza y Saneamiento** (verde) — reporte de trabajo de la propuesta
  PROP-HYS-045 (predios, insecticida doméstico, cañerías, tanques de agua,
  roedores/sellado, desagües pluviales) en los 11 CAPs del Área Externa.

## Paso 1 — Conectar la app a tu planilla (Apps Script)

1. Abrí la planilla **"MIP RED HZT - Base de Datos v2"**.
2. Extensiones → Apps Script.
3. Borrá el contenido de `Code.gs` y pegá el contenido completo de
   `Codigo_AppsScript.gs` (incluido en esta entrega).
4. Guardá (ícono de disquete).

## Paso 2 — Crear las hojas del módulo de Saneamiento

1. En el desplegable de funciones (arriba, al lado del ícono ▷), elegí
   **setupSaneamientoSheets**.
2. Clic en ▷ **Ejecutar**. La primera vez te va a pedir autorización:
   aceptá los permisos.
3. Te va a aparecer un cartel "Listo: hojas de Saneamiento creadas/verificadas."
   Esto agrega dos pestañas nuevas a la planilla: `trabajos_saneamiento`
   (un registro por cada intervención de varios días en un CAP) y
   `avances_saneamiento` (un registro por cada día de trabajo cargado).

## Paso 3 — Publicar el script como Web App

1. En el editor de Apps Script: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Ejecutar como: **Yo (tu cuenta)**.
4. Quién tiene acceso: **Cualquier usuario** (necesario para que la app de
   los operarios pueda enviar datos sin que ellos tengan que loguearse).
5. Clic en **Implementar**. Google va a pedir autorización la primera vez:
   aceptá los permisos (es tu propio script, sobre tu propia planilla).
6. Copiá la **URL de la aplicación web** que te da (termina en `/exec`).

## Paso 4 — Pegar la URL en la app

1. Abrí el archivo `data.js`.
2. Reemplazá:
   ```js
   APPS_SCRIPT_URL: "PEGAR_ACA_LA_URL_DEL_APPS_SCRIPT",
   ```
   por la URL que copiaste en el paso 3.

## Paso 5 — Publicar la app (GitHub Pages)

1. Creá un repositorio nuevo (o usá uno existente), por ejemplo `mipyv-app`.
2. Subí estos archivos a la raíz del repositorio:
   `index.html`, `app.js`, `data.js`, `icons.js`, `manifest.json`, `sw.js`,
   `icon-192.png`, `icon-512.png`.
3. Configuración del repositorio → Pages → Source: rama `main`, carpeta `/`.
4. GitHub te da una URL tipo `https://tu-usuario.github.io/mipyv-app/`.
5. Esa es la URL que Javier y Paulo abren desde el celular. Pueden
   "Agregar a pantalla de inicio" para que quede como ícono de app.

## Paso 6 — Activar la alerta diaria de seguimiento MIPyV (opcional pero recomendado)

1. En el editor de Apps Script: **Activadores (ícono de reloj) → Añadir activador**.
2. Función: `alertaSeguimientoDiaria`.
3. Tipo de origen del evento: **Activado por tiempo**.
4. Tipo de activador basado en tiempo: **Temporizador diario**, elegí el
   horario (ej. 8:00–9:00).
5. Guardar. A partir de ahí, si hay 2das intervenciones vencidas, te llega
   un mail automático. (Esta alerta es solo del módulo MIPyV por ahora.)

## Notas importantes

- **Sin conexión:** la app funciona igual en los dos módulos — guarda todo
  en el celular (localStorage) y lo manda solo cuando detecta señal. El
  botón "Sincronizar" en la barra superior también fuerza el envío manual.
- **Trabajos de varios días (Saneamiento):** si Javier inicia un trabajo en
  un CAP y Paulo lo tiene que continuar otro día desde su propio celular,
  la app intenta traer la lista de "trabajos abiertos" desde la planilla
  automáticamente al entrar a esa pantalla — pero **solo si hay conexión en
  ese momento**. Si Paulo está sin señal y el trabajo se inició desde el
  teléfono de Javier, no lo va a ver hasta que tenga señal. Es una
  limitación a tener en cuenta al coordinar quién sigue cada tarea.
- **Fotos:** por ahora la app las adjunta como imagen local (base64) al
  registro que se envía; en la planilla queda anotado que existe una foto.
  Si más adelante querés que las fotos se guarden directamente en una
  carpeta de Drive, es un agregado sencillo al `Codigo_AppsScript.gs`
  (puedo sumarlo cuando quieras).
- **Catálogos MIPyV:** productos, plagas, dosis/frecuencia, establecimientos
  y sectores están hoy hardcodeados en `data.js` como copia de respaldo
  offline. El backend (`doGet`) ya expone esos mismos catálogos en vivo
  desde la planilla — el siguiente paso natural es que la app los lea de
  ahí al abrir (con `data.js` como fallback si no hay señal).
- **Íconos de plagas/productos/tareas:** son ilustraciones simples por
  silueta y color (no fotos reales), para evitar depender de imágenes con
  derechos de autor. Si preferís fotos reales, sacá las fotos vos y las
  reemplazamos en `icons.js` o como archivos de imagen aparte — decime y
  lo ajusto.

