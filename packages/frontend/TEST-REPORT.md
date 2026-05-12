# Reporte de pruebas frontend

Fecha: 2026-04-30

## Entorno

- Runtime: Bun 1.3.11
- Framework: React 19 + TypeScript
- Runner: `bun test`
- DOM de pruebas: jsdom + Testing Library

## Resultado

| Comando | Resultado |
| --- | --- |
| `bun run typecheck` | OK, sin errores TypeScript |
| `bun test` | 83 pruebas aprobadas, 0 fallidas, 304 aserciones |
| `bun test --coverage` | 83 pruebas aprobadas, cobertura total 95.68% funciones y 99.17% lineas |
| `bun run build` | OK, bundle de produccion generado |

## Cobertura por rubrica

- Login y sesion: `LoginCard.test.tsx`, `guards.test.tsx`, `session.test.ts`, `http.test.ts`.
- CRUD y validaciones: `Proveedores.test.tsx`, `Articulos.test.tsx`, `Ordenes.ui.test.tsx`, `Ordenes.test.ts`.
- Dashboard y reportes: `Dashboard.test.tsx`, `Reportes.test.tsx`, `Auditoria.test.tsx`.
- Servicios y utilidades: `config.test.ts`, `validation.test.ts`, `useInactivityTimeout.test.tsx`.

## Cobertura global

```txt
All files: 95.68% funciones, 99.17% lineas
```

La cobertura supera el 30% solicitado por la rubrica.
