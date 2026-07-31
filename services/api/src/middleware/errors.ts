import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { captureError } from '../observability.js';

export const errorHandler: ErrorHandler = (err, c: Context) => {
  console.error('[api error]', err);
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
