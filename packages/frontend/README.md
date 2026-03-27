# Frontend ERP

Frontend inicial del modulo de compras.

## Desarrollo

```bash
bun install
bun run dev
```

## Entorno local

Usa [`packages/frontend/.env.local`](/home/naomi/erp-final/packages/frontend/.env.local):

```bash
BUN_PUBLIC_API_URL=http://localhost:4000
```

El frontend hace una comprobacion simple contra `GET /health` para verificar la conexion con el backend local.
