import { log } from "#infrastructure/log.js";
import { gracefulShutdownHandler } from "./utils/utils.js";
import process from "node:process";
import env from "#config/env.js";

import errorHandler from "./plugins/errorHandler.js";

import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import underPressure from "@fastify/under-pressure";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCookie from "@fastify/cookie";
import fastifyUserAgent from "fastify-user-agent";
import fastifyAutoload from "@fastify/autoload";

import { fastifySwaggerOptions } from "./options/swagger.js";
import { corsOptions } from "./options/cors.js";
import { cookieOptions } from "./options/cookies.js";
import { fastifyOptions } from "./options/fasify.js";
import { autoloadOptions } from "./options/autoload.js";
import { rateLimitOptions } from "./options/rateLimit.js";
import { underPressureOptions } from "./options/underPressure.js";

// NOTE: This is a workaround to avoid fastify import earlier that the openTelemetry
// import { fastify } from "fastify";
import type * as FastifyType from "fastify";
import Module from "node:module";
import { ProcessMessage, ProcessMessagesType } from "#ipcMessages.js";
const require = Module.createRequire(import.meta.url);
const { fastify } = require("fastify") as typeof FastifyType;

export const startHttpServer = async () => {
  const server = await fastify(fastifyOptions);

  try {
    server.setErrorHandler(errorHandler);
    await server.register(cors, corsOptions);
    await server.register(fastifyCookie, cookieOptions);
    await server.register(underPressure, underPressureOptions);
    await server.register(rateLimit, rateLimitOptions);
    await server.register(fastifySwagger, fastifySwaggerOptions);
    await server.register(helmet, { contentSecurityPolicy: false });
    await server.register(fastifySwaggerUi, { routePrefix: "/docs" });
    await server.register(fastifyUserAgent);
    await server.register(fastifyAutoload, autoloadOptions);
    await server.ready();

    server.swagger({ yaml: true });
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
  log.system(
    `${env.ENVIRONMENT} HTTP service started: ${await server.listen({
      port: Number(env.APP_PORT),
      host: env.APP_HOST,
    })}`,
  );

  log.info({}, server.printRoutes());

  process.on(
    "uncaughtException",
    async (error: NodeJS.ErrnoException, origin) => {
      if (
        error.code === "ECONNRESET" ||
        error.code === "ERR_SSL_APPLICATION_DATA_AFTER_CLOSE_NOTIFY" ||
        error.code === "ERR_SSL_TLSV1_ALERT_DECODE_ERROR"
      )
        return;

      log.system(error, origin);
      await gracefulShutdownHandler(server, "uncaughtException");
    },
  );

  process.on("message", async (message: ProcessMessage) => {
    if (message.status === ProcessMessagesType.FORCE_GRACEFUL_SHUTDOWN) {
      await gracefulShutdownHandler(server, "Forced shutdown");
    }
  });

  return server;
};
