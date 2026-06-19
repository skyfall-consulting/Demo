import type { WeatherMode } from '../types';

interface WeatherToggleProps {
  value: WeatherMode;
  onChange: (next: WeatherMode) => void;
}

const MODES: WeatherMode[] = ['rain', 'snow', 'stars'];

export function WeatherToggle({ value, onChange }: WeatherToggleProps) {
  const handle = (next: WeatherMode) => {
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
