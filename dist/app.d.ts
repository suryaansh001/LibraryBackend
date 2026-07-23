import fastify from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
export declare function buildApp(): fastify.FastifyInstance<import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>, import("node:http").IncomingMessage, import("node:http").ServerResponse<import("node:http").IncomingMessage>, fastify.FastifyBaseLogger, TypeBoxTypeProvider>;
declare const _app: fastify.FastifyInstance<import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>, import("node:http").IncomingMessage, import("node:http").ServerResponse<import("node:http").IncomingMessage>, fastify.FastifyBaseLogger, TypeBoxTypeProvider>;
export default _app;
export type LibraryOsApp = ReturnType<typeof buildApp>;
