import { useEffect, useRef, useState } from 'react';
import { Sentry } from '../sentry';

// BUG #5 (intentional): after the page has been open for 30s, hovering the logo
// reads a property off a ref whose .current is set back to null by an interval,
// throwing a TypeError. Subtle race condition that only surfaces after enough
// time has elapsed.
export function Header() {
  const stateRef = useRef<{ glowIntensity: number } | null>({ glowIntensity: 1 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const armTimer = window.setTimeout(() => setReady(true), 30_000);
    return () => window.clearTimeout(armTimer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // After the arming delay we start the "glow scheduler" which inadvertently
    // wipes the ref state every tick, leaving it null when the hover handler
    // tries to read it.
    const tick = window.setInterval(() => {
      stateRef.current = null;
    }, 200);
    return () => window.clearInterval(tick);
  }, [ready]);

  const onHover = () => {
    try {
      // After `ready` has been true for at least one tick, stateRef.current is
      // null and reading .glowIntensity throws.
      const intensity = stateRef.current!.glowIntensity;
      document.documentElement.style.setProperty('--logo-glow', String(intensity * 8));
    } catch (err) {
      // Re-throw so the global handler reports it. Wrapping for clarity in the
      // Sentry stack trace.
      Sentry.captureException(err, { tags: { bug: 'header-hover-race' } });
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
