import type { OAuth2Namespace } from "@fastify/oauth2";
import type { Agent } from "useragent";

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
  interface FastifyRequest {
    userAgent: Agent | undefined;
  }
  interface FastifyHandler {
    (request: FastifyRequest, reply: FastifyReply): Promise<any>;
  }
}
