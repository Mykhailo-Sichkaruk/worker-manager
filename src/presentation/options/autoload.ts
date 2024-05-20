import type { AutoloadPluginOptions } from "@fastify/autoload";
import env from "#config/env.js";
import * as path from "path";

const __dirname = import.meta.dirname;

export const autoloadOptions: AutoloadPluginOptions = {
  dir: path.join(__dirname, "../routes"),
  forceESM: true,
  options: { prefix: `/${env.API_PREFIX}/${env.API_VERSION}/` },
};
