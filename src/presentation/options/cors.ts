import type { FastifyCorsOptions } from "@fastify/cors";
import env from "#config/env.js";

export const corsOptions: FastifyCorsOptions = {
  // origin: [env.API_HOST, `chrome-extension://${env.CHROME_EXTENSION_ID}`],
  // methods: [ "OPTIONS", "GET", "POST", "PUT", "DELETE" ],
  allowedHeaders: ["Content-Type", "Authorization"],
  hideOptionsRoute: false,
  strictPreflight: true,
};
