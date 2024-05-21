import type { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import env from "#config/env.js";

const openapi: Partial<OpenAPIV3.Document | OpenAPIV3_1.Document> = {
  openapi: "3.1.0",
  info: {
    title: "Worker Manager API",
    version: "1.0.0",
    description: "API to schedule tests images execution",
  },
  servers: [
    {
      url: env.API_HOST,
      description: "Remote server",
    },
  ],
};

export const fastifySwaggerOptions: FastifyDynamicSwaggerOptions = {
  mode: "dynamic",
  openapi,
};
