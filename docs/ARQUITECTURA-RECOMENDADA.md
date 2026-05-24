# Arquitectura Recomendada del Modulo de Compras

## Frontend

- **Capa UI**: `screens/` para composicion por vista, `components/` para piezas reutilizables.
- **Capa de estado de dominio**: hooks de workspace (`useERPWorkspace`) con operaciones de lectura/escritura y refresco centralizado.
- **Capa de acceso a datos**: `api/` con funciones tipadas, manejo unificado de errores y auth.
- **Diseño escalable**: tema central (`theme.ts`) + estilos globales + componentes de tabla/formulario reutilizables.

## Backend

- **Hexagonal/Clean**:
  - `domain/`: entidades y contratos.
  - `application/`: casos de uso y DTOs.
  - `infrastructure/`: persistencia, auth, integraciones externas.
  - `presentation/http`: handlers, serializers, middlewares y OpenAPI.
- **Seguridad**:
  - JWT + control por roles.
  - API key opcional para integraciones server-to-server (Power BI).
  - CORS restrictivo por origen permitido.

## Reutilizacion de Componentes

- `DataTable`: ordenamiento, filtros y paginacion en una sola pieza.
- `CrudToolbar`, `FormField`, `FormActions`, `EditorPanel`: formularios y flujos CRUD consistentes.
- `NotificationsProvider`: toasts unificados para feedback de usuario.

## Rendimiento

- `useMemo`/`useCallback` en transformaciones y handlers pesados.
- Carga paralela de recursos ERP en frontend.
- Endpoints analiticos dedicados para evitar recalculo en Power BI.
- Recomendado para siguiente fase: cache por endpoint analitico y refresh incremental.

## UX/UI Empresarial

- Layout responsivo con sidebar, topbar y tarjetas KPI.
- Modo claro/oscuro persistente.
- Estados vacios, loading y errores visuales estandarizados (404/500/toasts).

## Sesiones y Seguridad Operativa

- Sesion con refresh token.
- Cierre por inactividad (`useInactivityTimeout`).
- Mensajes amigables para errores 4xx/5xx.
- Trazabilidad con `traceId` en errores internos de backend.
