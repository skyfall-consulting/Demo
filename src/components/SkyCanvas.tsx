import type { FallingObject } from '../types';

interface SkyCanvasProps {
  objects: FallingObject[];
  onCatch: (id: number) => void;
}

const GLYPH: Record<FallingObject['kind'], string> = {
  rain: '\u{1F4A7}',
  snow: '❄️',
  stars: '⭐',
};

export function SkyCanvas({ objects, onCatch }: SkyCanvasProps) {
  return (
    <div className="sky-canvas" role="presentation">
      {objects.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`falling ${o.caught ? 'caught' : ''}`}
          onClick={() => onCatch(o.id)}
          style={{
            left: `${o.x}%`,
            fontSize: `${o.size}px`,
            animationDelay: `${o.delay}s`,
            animationDuration: `${o.duration}s`,
          }}
          aria-label={`catch ${o.kind}`}
        >
          {GLYPH[o.kind]}
        </button>
      ))}
    </div>
  );
}
