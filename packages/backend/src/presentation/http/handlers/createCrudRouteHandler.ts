import { json, noContent, parseJsonBody } from "src/presentation/http/response";

type StatusFromMessage = (message: string) => number;

interface CrudRouteConfig<TCreateDto, TUpdateDto, TEntity, TContext> {
  basePath: string;
  createContext: () => TContext;
  serialize: (entity: TEntity) => unknown;
  list: (context: TContext, request: Request) => Promise<TEntity[]>;
  getById: (context: TContext, id: string, request: Request) => Promise<TEntity>;
  create: (context: TContext, dto: TCreateDto, request: Request) => Promise<TEntity>;
  update: (context: TContext, id: string, dto: TUpdateDto, request: Request) => Promise<TEntity>;
  remove: (context: TContext, id: string, request: Request) => Promise<void>;
  validateCreateDto?: (value: unknown) => TCreateDto;
  validateUpdateDto?: (value: unknown) => TUpdateDto;
  resolveGetStatus?: StatusFromMessage;
  resolveCreateStatus: StatusFromMessage;
  resolveUpdateStatus: StatusFromMessage;
  resolveDeleteStatus: StatusFromMessage;
}

const resolveErrorMessage = (error: unknown, fallback = "Error interno"): string =>
  error instanceof Error ? error.message : fallback;

const extractItemId = (pathname: string, basePath: string): string | null => {
  if (!pathname.startsWith(`${basePath}/`)) {
    return null;
  }

  const id = pathname.slice(basePath.length + 1);
  if (!id || id.includes("/")) {
    return null;
  }

  return id;
};

export const createCrudRouteHandler = <TCreateDto, TUpdateDto, TEntity, TContext>(
  config: CrudRouteConfig<TCreateDto, TUpdateDto, TEntity, TContext>,
) => {
  const {
    basePath,
    createContext,
    serialize,
    list,
    getById,
    create,
    update,
    remove,
    validateCreateDto,
    validateUpdateDto,
    resolveGetStatus = () => 404,
    resolveCreateStatus,
    resolveUpdateStatus,
    resolveDeleteStatus,
  } = config;

  return async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method === "GET" && pathname === basePath) {
      try {
        const context = createContext();
        const entities = await list(context, request);
        return json(entities.map(serialize), 200, origin);
      } catch (error) {
        const message = resolveErrorMessage(error);
        return json({ message }, 500, origin);
      }
    }

    const itemId = extractItemId(pathname, basePath);

    if (request.method === "GET" && itemId) {
      try {
        const context = createContext();
        const entity = await getById(context, itemId, request);
        return json(serialize(entity), 200, origin);
      } catch (error) {
        const message = resolveErrorMessage(error);
        return json({ message }, resolveGetStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === basePath) {
      try {
        const context = createContext();
        const dto = await parseJsonBody<TCreateDto>(request, validateCreateDto);
        const entity = await create(context, dto, request);
        return json(serialize(entity), 201, origin);
      } catch (error) {
        const message = resolveErrorMessage(error);
        return json({ message }, resolveCreateStatus(message), origin);
      }
    }

    if (request.method === "PUT" && itemId) {
      try {
        const context = createContext();
        const dto = await parseJsonBody<TUpdateDto>(request, validateUpdateDto);
        const entity = await update(context, itemId, dto, request);
        return json(serialize(entity), 200, origin);
      } catch (error) {
        const message = resolveErrorMessage(error);
        return json({ message }, resolveUpdateStatus(message), origin);
      }
    }

    if (request.method === "DELETE" && itemId) {
      try {
        const context = createContext();
        await remove(context, itemId, request);
        return noContent(origin);
      } catch (error) {
        const message = resolveErrorMessage(error);
        return json({ message }, resolveDeleteStatus(message), origin);
      }
    }

    return null;
  };
};
