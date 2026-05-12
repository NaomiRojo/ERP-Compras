# Frontend ERP

SPA funcional del modulo ERP de compras construida con React, TypeScript, Bun, React Router y MUI.

## Alcance para la rubrica

- Login real contra `POST /api/auth/login`, verificacion 2FA y registro de usuario.
- Sesion persistente en `localStorage` o `sessionStorage`, refresh token y expiracion por inactividad.
- Interceptor HTTP centralizado en `src/api/http.ts` para inyectar `Authorization: Bearer <token>`.
- Rutas protegidas en `src/router/guards.tsx` y navegacion por rol en `src/router/views.ts`.
- Dashboard ejecutivo, layout ERP responsivo y modulos de compras.
- CRUD funcional de proveedores, articulos y ordenes de compra con validaciones y mensajes UI.
- Reportes operativos con filtros, graficos, alertas, exportacion CSV e impresion/PDF desde `src/screens/Reportes.tsx`.
- Separacion de responsabilidades entre APIs, hooks de orquestacion, componentes UI y pantallas.
- Reporte de pruebas: [`TEST-REPORT.md`](/home/naomi/erp-final/packages/frontend/TEST-REPORT.md).

El prototipo UX/UI final se debe anexar desde Figma para que coincida visualmente con login, dashboard y modulos principales.

## Desarrollo

```bash
bun install
bun run dev
```

## Validacion

```bash
bun run typecheck
bun test --coverage
bun run build
```

## Entorno local

Usa [`packages/frontend/.env.local`](/home/naomi/erp-final/packages/frontend/.env.local):

```bash
BUN_PUBLIC_API_URL=http://localhost:4000
```

Si no defines la variable, el frontend usa `http://localhost:4000` por defecto.
