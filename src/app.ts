import crypto from 'node:crypto';

import fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { Static} from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

import { config } from './config/env.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { mainPlugin } from './shared/plugins/main.plugin.js';
import { requestIdPlugin } from './shared/middleware/request-id.js';
import { sendSuccess } from './shared/utils/response.util.js';
import { pingDatabase } from './config/database.js';

const healthResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: Type.Object({
    status: Type.Literal('ok'),
    db: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
    version: Type.String()
  }),
  requestId: Type.String()
});

type HealthResponse = Static<typeof healthResponseSchema>;

function parseBodyLimit(value: string): number {
  const match = /^(\d+)(b|kb|mb|gb)$/i.exec(value);
  if (match === null) {
    return 1_048_576;
  }

  const sizeValue = match[1]!;
  const unitValue = match[2]!;
  const size = Number.parseInt(sizeValue, 10);
  const unit = unitValue.toLowerCase();

  if (unit === 'b') {
    return size;
  }

  if (unit === 'kb') {
    return size * 1024;
  }

  if (unit === 'mb') {
    return size * 1024 * 1024;
  }

  return size * 1024 * 1024 * 1024;
}

export function buildApp() {
  const app = fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined
    },
    requestIdHeader: 'x-request-id',
    genReqId: (request) => {
      const headerId = request.headers['x-request-id'];
      return typeof headerId === 'string' && headerId.trim().length > 0 ? headerId.trim() : crypto.randomUUID();
    },
    bodyLimit: parseBodyLimit(config.MAX_REQUEST_BODY_SIZE)
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.setErrorHandler(errorHandler);

  app.register(requestIdPlugin);
  app.register(cookie, { hook: 'onRequest' });
  app.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true
  });
  app.register(helmet);
  app.register(rateLimit, {
    global: true,
    max: config.NODE_ENV === 'test' ? 10000 : 100,
    timeWindow: '1 minute'
  });
  app.register(websocket);
  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });
  app.register(mainPlugin);

  app.get<{ Reply: HealthResponse }>('/health', {
    schema: {
      response: {
        200: healthResponseSchema
      }
    }
  }, async (request, reply) => {
    const dbOk = await pingDatabase().catch(() => false);
    return sendSuccess(reply, request, {
      status: 'ok' as const,
      db: dbOk ? 'ok' : 'error',
      version: config.API_VERSION
    });
  });

  return app;
}

const _app = buildApp();
export default _app;

export type LibraryOsApp = ReturnType<typeof buildApp>;