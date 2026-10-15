# Tropic Rent a Car · web de reservas

Web de alquiler de coches para **Autos Tropic Canarias S.L.** (Tropic Rent a Car, Costa del Silencio, Tenerife). El cliente elige lugar, fechas y horas, ve los 14 grupos de vehículos con el **precio total y por día** y envía una **solicitud de reserva** por correo. No hay pago online ni calendario de disponibilidad: la empresa confirma cada solicitud con el cliente.

## Qué hace

- Buscador por lugar de recogida y devolución, fechas y horas.
- Resultados con precio total y por día, calculado por tramos de duración (1, 2-3, 4-6 y 7+ días) y sillas infantiles.
- Formulario de solicitud: llega un correo a la empresa y el cliente recibe un aviso automático de «solicitud en trámite».
- Páginas de flota, contacto con preguntas frecuentes, aviso legal, privacidad y cookies.
- Web en español e inglés (`/es/` y `/en/`), pensada primero para móvil.
- SEO básico: canonical, hreflang, sitemap, `robots.txt` y datos estructurados.

## Tecnología

| Pieza                          | Uso                                                          |
| ------------------------------ | ------------------------------------------------------------ |
| [Astro](https://astro.build) 7 | Sitio estático; solo `/api/solicitud` se ejecuta en servidor |
| TypeScript                     | Lógica de precios, validación y correos                      |
| Vitest                         | Tests de precios, búsqueda, solicitud, contenidos y SEO      |
| [Resend](https://resend.com)   | Envío de correos                                             |
| Cloudflare Workers             | Hosting, con `@astrojs/cloudflare` y `wrangler`              |

## Requisitos

- Node.js 22.12 o superior (hay un `.nvmrc`)
- npm

## Puesta en marcha

```bash
npm install
cp .env.example .env   # opcional en local
npm run dev            # http://localhost:4321
```

Sin `RESEND_API_KEY`, los correos **no se envían**: se imprimen en la terminal como `[correo simulado]`, así que se puede probar todo el flujo sin cuenta ni coste.

## Scripts

| Comando           | Qué hace                          |
| ----------------- | --------------------------------- |
| `npm run dev`     | Servidor de desarrollo            |
| `npm run build`   | Compila el sitio en `dist/`       |
| `npm run preview` | Sirve la compilación en local     |
| `npm run check`   | Comprueba tipos con `astro check` |
| `npm test`        | Ejecuta los tests con Vitest      |

## Variables de entorno

Nunca se suben a git. En local van en `.env`; en producción, en el panel de Cloudflare.

| Variable                  | Tipo              | Para qué                                                         |
| ------------------------- | ----------------- | ---------------------------------------------------------------- |
| `RESEND_API_KEY`          | Secreto, opcional | Clave de Resend. Sin ella, los correos se simulan                |
| `EMAIL_DESTINO`           | Secreto           | Correo donde la empresa recibe las solicitudes                   |
| `EMAIL_ORIGEN`            | Secreto           | Remitente, por ejemplo `Tropic Rent a Car <reservas@tu-dominio>` |
| `SITE_URL`                | Variable de build | URL pública (canonical, sitemap, `robots.txt`)                   |
| `PUBLIC_UMAMI_WEBSITE_ID` | Pública, opcional | Activa las estadísticas y el banner de cookies                   |
| `PUBLIC_UMAMI_SRC`        | Pública, opcional | Script de Umami (por defecto, el de Umami Cloud)                 |

Las variables `PUBLIC_*` y `SITE_URL` se incrustan al compilar: si las cambias, hay que volver a compilar y desplegar.

## Estructura

```text
src/
  components/   Buscador, tarjeta de grupo y banner de cookies
  data/         tarifas.json (14 grupos) y datos de la empresa
  i18n/         diccionarios ES/EN y textos largos (legales, preguntas frecuentes)
  layouts/      Base.astro (cabecera, pie, metaetiquetas)
  lib/          precios, búsqueda, solicitud, correos, SEO (con sus tests)
  pages/        rutas por idioma y /api/solicitud
  scripts/      JavaScript del navegador (resultados y solicitud)
  styles/       global.css
public/         _headers (cabeceras de seguridad)
```

## Cómo se calcula el precio

`precio total = días × tarifa del tramo + sillas infantiles × 5 € × días`

Los días se cuentan en bloques de 24 horas desde la hora de recogida. Las tarifas están en `src/data/tarifas.json` y la lógica en `src/lib/precios.ts`. El servidor **recalcula el precio** con los datos de la búsqueda y no se fía del que envía el navegador.

## Despliegue

Cloudflare Workers.

```bash
SITE_URL=https://tu-dominio npm run build
npx wrangler deploy
```

También se puede conectar el repositorio a Workers Builds (comando de build `npx astro build`, de despliegue `npx wrangler deploy`). Antes de publicar:

1. Configura las variables de entorno en Cloudflare.
2. Verifica el dominio en Resend (registros SPF y DKIM).
3. Comprueba que no quedan datos pendientes: `grep -rn PENDIENTE src` debe salir vacío.

`npx wrangler deploy --dry-run` valida la configuración sin publicar nada.

## Convenciones de Git

- Commits en español siguiendo [Conventional Commits](https://www.conventionalcommits.org): `feat(precios): calcula el total por tramos`.
- Una rama por fase (`fase-N-nombre`), fusionada con `--no-ff`, y una etiqueta `fase-N` al terminar.
- Las etiquetas `hito-N` marcan las entregas de pago del proyecto.

## Pendiente

- Datos de la empresa marcados como `PENDIENTE` en `src/data/empresa.ts`.
- Revisión profesional de los textos legales, que ahora son plantillas.
- Fotografías de los vehículos con derechos de uso e imagen para compartir (`og:image`).

## Licencia

Proyecto privado de Autos Tropic Canarias S.L. Todos los derechos reservados.
