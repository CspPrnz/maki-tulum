import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { captureError } from '../observability.js';

export const errorHandler: ErrorHandler = (err, c: Context) => {
  // Message only, never the error object: driver errors embed the offending
  // value (a unique violation reads "Key (email)=(…) already exists"), which
  // would put guest PII into stdout and therefore into the hosting provider's
  // log retention. The full error still reaches Sentry, which is scrubbed.
  console.error('[api error]', err instanceof Error ? err.message : 'non-error thrown');
  captureError(err);
  return c.json(
    {
      error: {
        code: 'internal_error',
        message: 'Something went wrong',
      },
    },
    500,
  );
};

export const notFoundHandler: NotFoundHandler = (c: Context) =>
  c.json(
    {
      error: {
        code: 'not_found',
        message: 'Resource not found',
      },
    },
    404,
  );
