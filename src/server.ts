import { fastify } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { serverConfig } from "@config/ServerConfig";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(serverConfig);

app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  console.log(`HTTP server is running on port ${PORT}`);
});
