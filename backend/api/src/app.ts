import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { pool } from "./db/postgres.js";
import { redis } from "./db/redis.js";
import { register as metricsRegister } from "./metrics/index.js";
import { registerRoutes } from "./routes/index.js";

export function buildApp() {
  const app = Fastify({ logger: true, trustProxy: true });

  app.register(cors, {
    origin: false
  });
  app.register(sensible);

  app.addHook("onRequest", async (request, reply) => {
    const requestId = request.headers["x-request-id"]?.toString() ?? randomUUID();
    request.headers["x-request-id"] = requestId;
    reply.header("x-request-id", requestId);
  });

  app.get("/healthz", async () => ({ ok: true }));
  app.get("/readyz", async (request, reply) => {
    try {
      await pool.query("SELECT 1");
      await redis.ping();
      return { ok: true };
    } catch (error) {
      request.log.error({ error }, "readiness check failed");
      return reply.code(503).send({ ok: false });
    }
  });
  app.get("/metrics", async (_request, reply) => {
    reply.header("content-type", metricsRegister.contentType);
    return metricsRegister.metrics();
  });
  app.register(registerRoutes, { prefix: "/v1" });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: "validation_error",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    request.log.error({ error }, "request_failed");
    return reply.code(500).send({ error: "internal_error" });
  });

  return app;
}
