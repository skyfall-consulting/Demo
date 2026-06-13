import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn(
      '[Skyfall Sky] VITE_SENTRY_DSN is not set — errors will be logged to the console only. ' +
        'Copy .env.example to .env.local and add your Sentry DSN to see issues flow to Skyfall.',
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'demo',
    release: import.meta.env.VITE_SENTRY_RELEASE || 'skyfall-sky@dev',
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export { Sentry };
