import type { CookieSerializeOptions } from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import { log } from "#infrastructure/log.js";
import timers from "node:timers/promises";
import process from "node:process";
import env from "#config/env.js";
import type { ProcessMessage } from "#ipcMessages.js";
import { ProcessMessagesType } from "#ipcMessages.js";

// TODO: comsider moving to a dtos
export const enum MessageType {
  Auth = "auth",
  AuthResponse = "auth-response",
  GoogleAuthStart = "google-auth-start",
}

export const refreshTokenCookieOptions: CookieSerializeOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 2,
  path: `/${env.API_PREFIX}/${env.API_VERSION}/auth`,
  secure: env.ENVIRONMENT === "production",
  // domain: env.API_HOST,
};

export const REFRESH_TOKEN = "refreshToken";

const filterNonEnglishCharacters = (string_: string): string =>
  string_.replaceAll(/[^\u0000-\u007F]/g, "");
// Remove all non word characters and convert to lower case, remove all non English characters
export const sanitizeString = (string_: string): string =>
  filterNonEnglishCharacters(string_).replaceAll(/\W/g, "").toLowerCase();

export const gracefulShutdownHandler = async (
  server: FastifyInstance,
  reason: string,
) => {
  log.system(`Graceful shutdown: ${reason}`);
  log.info("Wait 5 seconds before closing server");
  const serverCloneWaitTime = 5000;
  await timers.setTimeout(serverCloneWaitTime);

  try {
    if (process.send) {
      const message: ProcessMessage = { status: ProcessMessagesType.EXITING };
      process.send(message);
    } else {
      throw new Error("Process is not a child process");
    }

    await server.close();
    log.system("Close server, exit process successfully");
    process.exit(0);
  } catch (error: any) {
    log.fatal(error, "Close server, exit process with error");
    process.exit(1);
  }
};

export class UserNotFoundInRequestError extends Error {
  name = "UserNotFoundError" as const;
  constructor() {
    super("User not fouund in request");
    this.name = "UserNotFoundError";
  }
}
