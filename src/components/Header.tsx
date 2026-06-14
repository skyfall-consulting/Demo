import { useRef } from 'react';
import { Sentry } from '../sentry';

// BUG #5 (intentional): stateRef is initialized to null. The first hover
// dereferences the null and throws a TypeError. Realistic shape: the
// programmer forgot to initialize the ref before adding the handler that
// reads it. Captured by Sentry's explicit captureException then re-thrown
// for the ErrorBoundary.
export function Header() {
  const stateRef = useRef<{ glowIntensity: number } | null>(null);

  const onHover = () => {
    try {
      const intensity = stateRef.current!.glowIntensity;
      document.documentElement.style.setProperty('--logo-glow', String(intensity * 8));
    } catch (err) {
      Sentry.captureException(err, { tags: { bug: 'header-hover' } });
      throw err;
    }
  };

  return (
    <header className="header" onMouseEnter={onHover}>
      <div className="logo">
        <span className="logo-dot" />
        <span className="logo-text">Skyfall Sky</span>
      </div>
      <span className="badge">demo</span>
    </header>
  );
}
