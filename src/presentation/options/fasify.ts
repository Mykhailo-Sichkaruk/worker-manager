import type { ConnectionError, FastifyInstance } from "fastify";
import { fileURLToPath } from "node:url";
import env from "#config/env.js";
import path from "node:path";
import type { Socket } from "net";
import fs from "node:fs";
import http from "http";
import type { TransportTargetOptions } from "pino";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const consoleOutTrace: TransportTargetOptions = {
  level: "trace",
  target: "pino-pretty",
  options: {
    colorize: true,
    ignore: "pid,hostname",
    translateTime: "SYS:standard",
  },
};

const fileOutDebug: TransportTargetOptions = {
  level: "debug",
  target: "pino/file",
  options: {
    ignore: "pid,hostname",
    destination: `${env.LOGS_PATH}/fastify-debug.log`,
    translateTime: "SYS:standard",
  },
};

type Env = typeof env.ENVIRONMENT;
const envToTargets: Record<Env, TransportTargetOptions[]> = {
  development: [consoleOutTrace],
  production: [fileOutDebug],
  staging: [consoleOutTrace, fileOutDebug],
  test: [consoleOutTrace],
} as const;

const fastifyBaseOptions = {
  logger: {
    transport: {
      targets: envToTargets[env.ENVIRONMENT],
    },
  },
  ajv: {
    customOptions: {
      removeAdditional: true,
      useDefaults: false,
      coerceTypes: false,
      allErrors: false,
    },
  },
};

export const fastifyOptions = {
  ...fastifyBaseOptions,
  ...(env.ENVIRONMENT === "production" || env.ENVIRONMENT === "staging"
    ? {
        http2: true,
        https: {
          key: fs.readFileSync(path.join(__dirname, "../../../ssl.key")),
          cert: fs.readFileSync(path.join(__dirname, "../../../ssl.crt")),
          ca: fs.readFileSync(path.join(__dirname, "../../../ssl.ca")),
        },
        clientErrorHandler: function clientErrorHandler(
          err: ConnectionError,
          socket: Socket,
        ) {
          if (err.code === "ECONNRESET" || err.code.startsWith("ERR_SSL")) {
            return;
          }

          const body = JSON.stringify({
            error: http.STATUS_CODES["400"],
            message: "Client Error",
            statusCode: 400,
          });
          (this as any as FastifyInstance).log.info(err);

          if (socket.writable) {
            socket.end(
              [
                "HTTP/1.1 400 Bad Request",
                `Content-Length: ${body.length}`,
                `Content-Type: application/json\r\n\r\n${body}`,
              ].join("\r\n"),
            );
          }
        },
      }
    : {}),
};
