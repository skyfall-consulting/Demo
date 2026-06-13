import type { WeatherMode } from '../types';
import { Sentry } from '../sentry';

interface WeatherToggleProps {
  value: WeatherMode;
  onChange: (next: WeatherMode) => void;
}

const MODES: WeatherMode[] = ['rain', 'snow', 'stars'];

export function WeatherToggle({ value, onChange }: WeatherToggleProps) {
  const handle = (next: WeatherMode) => {
    // BUG #2 (intentional): switching to "snow" simulates a 5xx from a backend
    // service that doesn't exist. We capture the error to Sentry and rethrow so
    // the UI surfaces it via the ErrorBoundary.
    if (next === 'snow') {
      const err = new Error(
        'WeatherService: failed to load snow assets (HTTP 500 from /api/weather?mode=snow)',
      );
      Sentry.captureException(err, { tags: { bug: 'weather-snow-500' } });
      throw err;
    }
    onChange(next);
  };

  return (
    <div className="control control-group" role="radiogroup" aria-label="weather mode">
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          className={`chip ${value === mode ? 'chip-active' : ''}`}
          onClick={() => handle(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
