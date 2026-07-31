import { serve } from '@hono/node-server';
import { ApiEnvSchema, parseEnv } from '@maki/config';
import { createApp } from './app.js';
import { initObservability } from './observability.js';

const env = parseEnv(ApiEnvSchema, process.env);
initObservability(env);
const app = createApp(env);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    // eslint-disable-next-line no-console
    console.log(`maki-api listening on :${info.port} (${env.APP_ENV})`);
  },
);
