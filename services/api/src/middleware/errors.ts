import type { Context, ErrorHandler, NotFoundHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c: Context) => {
  // eslint-disable-next-line no-console
  console.error('[api error]', err);
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
