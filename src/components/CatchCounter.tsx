import { useEffect, useRef } from 'react';
import { Sentry } from '../sentry';

interface CatchCounterProps {
  value: number;
  onReset: () => void;
}

export function CatchCounter({ value, onReset }: CatchCounterProps) {
  const reportedRef = useRef(false);

  useEffect(() => {
    // BUG #3 surfaces here: the catch handler in App.tsx decrements instead of
    // incrementing, so any catch makes this go negative. When that happens we
    // capture an invariant-violation error so Sentry sees it.
    if (value < 0 && !reportedRef.current) {
      reportedRef.current = true;
      Sentry.captureException(
        new Error(
          `CatchCounter invariant broken: count went negative (value=${value}). ` +
            'Expected catches to increment, not decrement.',
        ),
        { tags: { bug: 'catch-counter-negative' } },
      );
    }
    if (value >= 0) {
      reportedRef.current = false;
    }
  }, [value]);

  return (
    <div className={`control control-stat ${value < 0 ? 'control-bad' : ''}`}>
      <span className="stat-label">caught</span>
      <span className="stat-value">{value}</span>
      <button type="button" className="link" onClick={onReset}>
        reset
      </button>
    </div>
  );
}
