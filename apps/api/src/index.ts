import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { auth } from "./auth.js";
import { createContext } from "./trpc/context.js";
import { appRouter } from "./trpc/router.js";

const server = Fastify({ logger: true });

await server.register(cors, { origin: true, credentials: true });

server.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  handler: async (request, reply) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const fetchRequest = new Request(url, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : JSON.stringify(request.body),
    });

    const response = await auth.handler(fetchRequest);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    reply.send(response.body ? await response.text() : null);
  },
});

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

const port = Number(process.env.PORT ?? 4000);

server.listen({ port, host: "0.0.0.0" }).catch((err) => {
  server.log.error(err);
  process.exit(1);
});
