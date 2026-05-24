# Integracion ERP Compras + Power BI

## Endpoints disponibles

- `GET /api/powerbi/compras`
  - Dataset JSON consolidado para paneles.
  - Parametros opcionales: `from=YYYY-MM-DD`, `to=YYYY-MM-DD`.
- `GET /api/powerbi/compras/csv`
  - Exportacion tabular CSV para importacion en Power BI.
  - Soporta los mismos filtros `from`/`to`.
- `GET /api/powerbi/compras/sql`
  - Plantillas SQL recomendadas para vistas analiticas y DirectQuery.

## Seguridad

- Autenticacion principal: `Authorization: Bearer <access_token>`.
- Integracion server-to-server opcional: header `x-powerbi-key` cuando se configura `POWERBI_API_KEY`.
- CORS controlado por `CORS_ORIGINS` en backend.

## Conexion con clave (`POWERBI_API_KEY`)

### 1) Configurar la clave en backend

1. Definir `POWERBI_API_KEY` en el entorno del backend.
2. Reiniciar el servicio backend.
3. Verificar que el endpoint responda con clave:

```bash
curl -H "x-powerbi-key: TU_CLAVE" "http://<backend-host>:4000/api/powerbi/compras"
```

### 2) Conectar desde Power BI Desktop (recomendado)

1. Ir a `Obtener datos` -> `Web`.
2. Elegir `Avanzado`.
3. URL:
   `http://<backend-host>:4000/api/powerbi/compras`
4. Agregar header HTTP:
   - Nombre: `x-powerbi-key`
   - Valor: `TU_CLAVE`
5. Aceptar y cargar datos.

### 3) Alternativa por URL (solo pruebas)

Tambien puedes enviar la clave por query string:

- `http://<backend-host>:4000/api/powerbi/compras?powerbi_key=TU_CLAVE`
- `http://<backend-host>:4000/api/powerbi/compras/csv?powerbi_key=TU_CLAVE`

Nota: para entornos reales se recomienda usar header `x-powerbi-key` y evitar exponer la clave en URL.

## Modelo de datos entregado por `/api/powerbi/compras`

- `summary`: compras totales, ordenes pendientes, proveedores activos, productos comprados, CxP y pagos.
- `monthlyPurchases`: tendencia mensual de compras.
- `topProviders`: proveedores con mayor monto acumulado.
- `topProducts`: productos mas comprados por cantidad.
- `spendByCategory`: gastos por categoria de articulo.
- `ordersByStatus`: distribucion por estado documental.
- `orders`: detalle de ordenes y lineas para trazabilidad.

## Conexion en Power BI (REST/JSON)

1. Ir a `Obtener datos` -> `Web`.
2. URL: `http://<backend-host>:4000/api/powerbi/compras`.
3. Autenticar con token Bearer en header `Authorization`.
4. Expandir colecciones (`monthlyPurchases`, `topProviders`, `topProducts`, `spendByCategory`, `orders`).
5. Publicar y programar refresh.

## Conexion CSV

1. Ir a `Obtener datos` -> `Texto/CSV`.
2. URL: `http://<backend-host>:4000/api/powerbi/compras/csv`.
3. Aplicar parametros de rango de fechas cuando sea necesario.

## Sobre el archivo PBIDS

- El archivo `.pbids` acelera la conexion al origen de datos, pero **no incluye visuales prearmados**.
- Para abrir y ver graficos listos automaticamente, debes guardar un archivo `PBIX` o `PBIT` con el layout ya diseñado.
- En la pantalla de Reportes del ERP se descargan tres activos para estandarizar el armado:
  - conexion `.pbids`
  - tema empresarial `.json`
  - playbook de armado `.md` con paginas sugeridas y medidas DAX base

## Flujo recomendado para defensa

1. Abrir la conexion `.pbids`.
2. Aplicar el tema empresarial `.json`.
3. Construir paginas ejecutivas (Resumen, Riesgo financiero, Eficiencia operativa).
4. Guardar como `PBIX` (demo) y `PBIT` (plantilla reutilizable).

## Conexion SQL / DirectQuery

1. Solicitar plantillas desde `GET /api/powerbi/compras/sql`.
2. Crear vistas en PostgreSQL con esas consultas.
3. En Power BI usar conector PostgreSQL en modo DirectQuery o Import.

## Recomendaciones empresariales

- Crear vistas materializadas para periodos grandes y refresh incremental.
- Separar schema operacional vs schema analitico.
- Definir diccionario de datos y versionar cambios de campos.
- Monitorear refresh con `traceId` cuando haya errores 500.
