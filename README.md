
Un gestor mínimo (MVP) estilo Jira construido con NestJS — pensado como ejercicio técnico para integrar un "adapter" externo (API de backend) y exponer endpoints de autenticación, workspaces, projects y boards.

Este README explica cómo levantar, probar y contribuir al proyecto, además de recomendaciones para reducir advertencias de TypeScript/ESLint que aparecen actualmente en el repositorio.

## Contenido
- Descripción
- Tecnologías
- Requisitos
- Instalación y ejecución
- Scripts útiles
- Tests y cobertura
- Linter y sugerencias para reducir warnings
- Estructura del proyecto
- Notas de diseño y próximos pasos

## Descripción

`poe-jira-mngr` es una API escrita en TypeScript usando NestJS que actúa como un gestor de proyectos simple. La aplicación delega operaciones de dominio (usuarios, workspaces, proyectos, tableros e incidencias) a un servicio adaptador externo (el "adapter") a través de `AdapterClientService`.

El objetivo principal del repo es demostrar integración con un backend adaptador, manejo de errores, controladores y tests unitarios/e2e con mocks.

## Tecnologías

- Node.js + npm
- TypeScript
- NestJS
- Jest (tests unitarios y e2e)
- ESLint + @typescript-eslint
- @nestjs/axios (HttpService) y rxjs

## Requisitos

- Node.js 18+ (o la versión que uses en tu entorno)
- npm

Comprueba tu versión de Node y npm:

```bash
node -v
npm -v
```

## Instalación

1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd poe-jira-mngr
```

2. Instalar dependencias

```bash
npm install
```

## Variables de entorno

La aplicación lee opcionalmente `ADAPTER_BASE_URL` desde `ConfigService` para apuntar al adapter remoto. Si no está presente, por defecto usa `http://localhost:3001`.

Para ejecutar contra un adapter custom, exporta la variable de entorno antes de iniciar la app:

```bash
export ADAPTER_BASE_URL=https://mi-adapter
```

## Scripts útiles (package.json)

- npm run start: inicia la app (NestJS)
- npm run start:dev: inicia con watch
- npm run build: compila TS con Nest
- npm run lint: corre ESLint y aplica --fix
- npm run test: corre Jest (unit)
- npm run test:e2e: corre tests e2e (config en test/jest-e2e.json)
- npm run test:cov: corre tests y genera cobertura

Ejemplo: correr tests y ver cobertura

```bash
npm run test:cov
```

## Cómo ejecutar localmente

Levantar en modo desarrollo:

```bash
npm run start:dev
```

Probar endpoints con curl o Postman en el puerto por defecto que muestre Nest (usualmente 3000 si no se cambia).

## Tests

El proyecto incluye suites unitarias y algunos tests e2e con un adapter mock para ejecutar flujos completos sin dependencias externas.

- Tests unitarios: `npm run test`
- Tests e2e (en banda): `npm run test:e2e`
- Cobertura: `npm run test:cov`

Si necesitas ejecutar solo un test, usa `--testNamePattern` con Jest o el flag `--testPathPattern`.

## Linter y advertencias (ESLint)

Se usa ESLint con reglas de `@typescript-eslint`. Actualmente el proyecto muestra varias advertencias del tipo `@typescript-eslint/no-unsafe-*` que provienen de:

- Mocks de tests o objetos sin tipar (por ejemplo `adapter` mocks en specs)
- Acceso a `req: any` en controllers (peticiones sin tipar)
- Respuestas del `HttpService` (axios) que inicialmente se trataban como `any`

Recomendaciones para reducir warnings:

- Tipar las respuestas del adapter y usar generics en `HttpService` (p. ej. `http.post<AdapterUser>(...)`) — esto ya está parcialmente aplicado en `src/adapter-client/adapter-client.service.ts`.
- Tipar los mocks en los tests (usar los tipos exportados: `AdapterUser`, `Workspace`, `Project`, `Issue`, `IssuePayload`, `MovePayload`).
- Evitar `@Req() req: any` en controladores; usar `Request & { user?: { id: number; ... } }` o una interfaz propia para `AuthUser`.
- En casos donde el campo es privado en la clase y necesitas acceder en tests, usar casts controlados `(service as unknown as { http: HttpService })` en lugar de `any`.
- Mantener `no-unsafe-*` como advertencias mientras se va tipando gradualmente; abordarlas por prioridad en código de producción primero.

Si quieres, puedo ayudarte a reducir más advertencias aplicando tipos a los archivos de tests y controladores restantes.

## Estructura del proyecto (resumen)

Directorio principal `src/` (lo importante):

- `src/app.module.ts` — módulo raíz
- `src/main.ts` — bootstrap de la app
- `src/auth/` — autenticación (controlador, servicio, jwt strategy)
- `src/adapter-client/` — cliente que habla con el adapter externo; aquí están los tipos de dominio y la lógica HTTP
- `src/workspaces/` — endpoints y lógica para workspaces
- `src/projects/` — endpoints y lógica para proyectos
- `src/boards/` — endpoints y lógica para tableros e incidencias
- `test/` — tests e2e alternativos

## Notas de diseño y decisiones

- El `AdapterClientService` centraliza llamadas al adapter y transforma errores de la capa HTTP en excepciones HTTP de Nest (Unauthorized, Conflict, BadGateway, BadRequest).
- Se prefirió introducir type-guards (p. ej. `isAdapterError`) y generics en las llamadas HTTP para reducir el uso de `any`.
- Tests e2e usan una implementación en memoria `AdapterMock` para simular el comportamiento del adapter, lo que facilita pruebas deterministas.

## Próximos pasos / Cómo puedo ayudar más

- Puedo continuar tipando los tests restantes (alta ganancia: `src/adapter-client/adapter-client.service.spec.ts`, `src/boards/*.spec.ts`, `src/workspaces/*.spec.ts`) para bajar el número de advertencias ESLint.
- Si prefieres ajustar la configuración de ESLint (por ejemplo demover reglas `no-unsafe-*` a `warning` o cambiarlas a `off`), puedo proponer un cambio seguro en `eslint.config.mjs`.
- Añadir un archivo `.env.example` con variables de configuración recomendadas.

## Contribuir

1. Crea un branch con un nombre descriptivo
2. Abre un pull request explicando el cambio y su motivación
3. Ejecuta `npm run lint` y `npm run test` antes de enviar

## Contacto

Si necesitas que haga cambios concretos (p. ej. bajar más warnings, integrar CI, mejorar cobertura), dime qué prioridad tienen y los implemento.

---

Versión del README generada: 2026-01-18

Repository containing the backend of the Jira mvp project.