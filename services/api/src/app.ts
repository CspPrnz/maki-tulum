import type { ApiEnv } from '@maki/config';
import { OpenAPIHono } from '@hono/zod-openapi';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimitMiddleware, type RateLimitStore } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { healthRoutes, defaultHealthDeps, type HealthDeps } from './routes/health.js';

/**
 * Injectable seams for integration tests. Every field is optional — production
 * passes nothing and gets the real, env-derived implementations.
 */
export type AppOverrides = {
  health?: HealthDeps;
  rateLimitStore?: RateLimitStore;
};

export function createApp(env: ApiEnv, overrides: AppOverrides = {}) {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: {
              code: 'validation_error',
              message: 'Request validation failed',
              details: result.error.flatten(),
            },
          },
          400,
        );
      }
    },
  });

  app.use('*', logger());
  app.use('*', secureHeaders());
  app.use('*', corsMiddleware(env));
  app.use('*', rateLimitMiddleware(env, overrides.rateLimitStore));

  app.route('/', healthRoutes(overrides.health ?? defaultHealthDeps(env)));

  // OpenAPI spec at /openapi.json — generated from Zod-OpenAPI route schemas.
  app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: { title: 'Maki Tulum API', version: '0.0.1' },
  });

  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
}
