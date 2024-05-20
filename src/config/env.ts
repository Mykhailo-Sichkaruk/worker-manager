import { load } from "ts-dotenv";

const env = load(
  {
    ENVIRONMENT: ["development", "production", "test", "staging"] as const,
    RABBITMQ_URL: String,
    APP_HOST: String,
    APP_PORT: String,
    API_PREFIX: String,
    API_VERSION: String,
    API_HOST: String,
    LOGS_PATH: String,
    COOKIE_SECRET: String,
  },
  {
    path: ".env",
    encoding: "utf8",
    overrideProcessEnv: false,
  },
);

export default env;
