Setup recomendado para entorno de desarrollo:

## Entorno de desarrollo sin Nix
1. Instalar Docker y Docker Compose
2. Instalar Bun
3. Instalar Swagger CLI globalmente
4. Instalar typescript-language-server globalmente

## Entorno de desarrollo con Nix

1. Instalar Docker y Docker Compose
2. Instalar gestor de paquetes Nix (Habilitar comando Nix y Flakes)
3. Instalar Direnv
4. Correr `direnv allow`

Ahora cada vez que entres al directorio de proyecto en la consola lo siguiente se instala y se hace disponible:
1. Variables de entorno
2. Bun
3. Herramientas CLI (Swagger CLI, typescript-language-server, etc)

Dentro de éste entorno puedes lanzar tu editor preferido y tendrá disponible todas las tareas necesarias

## Estructura del proyecto

- `/`
    - `package.json`, `bunfig.toml` La definición de Bun Workspace de proyecto
    - `flake.nix`, `default.nix` La definición de proyecto Nix
    - `.envrc` La definición de cargado de variables de entorno de Direnv
    - `packages/` Donde se encuentran los paquetes del proyecto
        - `api/` Donde se encuentra la definición de API OpenAPI
        - `frontend/` Donde se encuentra el código para el frontend
        - `backend/` Donde se encuentra el código del backend
    - `docker/` Donde se encuentran las definiciones de contenedores
        - `docker-compose.yml` Donde se encuentra la definición de Docker Compose
        - `backend/` Donde se encuentra la definición del contenedor de backend
        - `nginx/` Donde se encuentra la definición del servidor y reverse-proxy nginx

