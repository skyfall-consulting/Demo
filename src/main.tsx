import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initSentry, Sentry } from './sentry';
import App from './App';
import './styles.css';

initSentry();

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-boundary">
          <h1>Something fell out of the sky.</h1>
          <p>{error instanceof Error ? error.message : String(error)}</p>
          <button onClick={resetError}>Reset</button>
          <p className="hint">
            This error has been reported to Sentry. If the workspace is wired up, Skyfall should
            see it in Slack within a few seconds.
          </p>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
