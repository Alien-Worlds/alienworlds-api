import { FastifyTestEnvironment } from "./fastify.environment";
import { ApiTestEnvironment } from "./api-test-environment";

export const createApiTestEnvironment = (): ApiTestEnvironment => new FastifyTestEnvironment();
