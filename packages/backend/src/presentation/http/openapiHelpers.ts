type Operation = Record<string, unknown>;

export const unauthorizedResponse = {
  description: "No autorizado",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
} as const;

const bearerSecurity = [{ bearerAuth: [] }] as const;

const idPathParameter = [
  {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
] as const;

const schemaRef = (schemaName: string) => ({
  $ref: `#/components/schemas/${schemaName}`,
});

const jsonRequestBody = (schemaName: string) => ({
  required: true,
  content: {
    "application/json": {
      schema: schemaRef(schemaName),
    },
  },
});

export const withSecurity = <TOperation extends Operation>(operation: TOperation) => ({
  ...operation,
  security: bearerSecurity,
});

export const withJsonRequest = <TOperation extends Operation>(
  operation: TOperation,
  schemaName: string,
) => ({
  ...operation,
  requestBody: jsonRequestBody(schemaName),
});

export interface CrudPathConfig {
  collectionPath: string;
  itemPath: string;
  tag: string;
  listSummary: string;
  listSuccessDescription: string;
  listIncludeUnauthorized?: boolean;
  createSummary: string;
  createRequestSchema: string;
  createSuccessDescription: string;
  createBadRequestDescription: string;
  createIncludeUnauthorized?: boolean;
  getByIdSummary: string;
  getByIdSuccessDescription: string;
  updateSummary: string;
  updateRequestSchema: string;
  updateSuccessDescription: string;
  updateConflictDescription?: string;
  deleteSummary: string;
  deleteSuccessDescription: string;
  deleteConflictDescription?: string;
  notFoundDescription: string;
}

export const createCrudPaths = (config: CrudPathConfig) => {
  const listResponses: Record<number, unknown> = {
    200: { description: config.listSuccessDescription },
  };
  if (config.listIncludeUnauthorized) {
    listResponses[401] = unauthorizedResponse;
  }

  const createResponses: Record<number, unknown> = {
    201: { description: config.createSuccessDescription },
    400: { description: config.createBadRequestDescription },
  };
  if (config.createIncludeUnauthorized) {
    createResponses[401] = unauthorizedResponse;
  }

  return {
    [config.collectionPath]: {
      get: withSecurity({
        tags: [config.tag],
        summary: config.listSummary,
        responses: listResponses,
      }),
      post: withSecurity(
        withJsonRequest(
          {
            tags: [config.tag],
            summary: config.createSummary,
            responses: createResponses,
          },
          config.createRequestSchema,
        ),
      ),
    },
    [config.itemPath]: {
      get: withSecurity({
        tags: [config.tag],
        summary: config.getByIdSummary,
        parameters: idPathParameter,
        responses: {
          200: { description: config.getByIdSuccessDescription },
          404: { description: config.notFoundDescription },
        },
      }),
      put: withSecurity(
        withJsonRequest(
          {
            tags: [config.tag],
            summary: config.updateSummary,
            parameters: idPathParameter,
            responses: {
              200: { description: config.updateSuccessDescription },
              404: { description: config.notFoundDescription },
              ...(config.updateConflictDescription
                ? {
                    409: { description: config.updateConflictDescription },
                  }
                : {}),
            },
          },
          config.updateRequestSchema,
        ),
      ),
      delete: withSecurity({
        tags: [config.tag],
        summary: config.deleteSummary,
        parameters: idPathParameter,
        responses: {
          204: { description: config.deleteSuccessDescription },
          404: { description: config.notFoundDescription },
          ...(config.deleteConflictDescription
            ? {
                409: { description: config.deleteConflictDescription },
              }
            : {}),
        },
      }),
    },
  };
};
