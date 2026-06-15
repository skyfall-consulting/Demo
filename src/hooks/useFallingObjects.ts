import { useCallback, useRef, useState } from 'react';
import type { FallingObject, WeatherMode } from '../types';

interface UseFallingObjectsArgs {
  weather: WeatherMode;
}

export function useFallingObjects({ weather }: UseFallingObjectsArgs) {
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const idRef = useRef(0);

  const makeObject = useCallback(
    (kind: WeatherMode): FallingObject => {
      idRef.current += 1;
      return {
        id: idRef.current,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 3,
        size: 18 + Math.random() * 18,
        kind,
        caught: false,
      };
    },
    [],
  );

  const dropOne = useCallback(() => {
    setObjects((prev) => {
      const next = [...prev, makeObject(weather)];
      // BUG #1 (intentional): read past the end of the array and dereference
      // the result. Throws a TypeError on every click. Captured by the
      // React ErrorBoundary in main.tsx (and Sentry's global handler).
      const phantom = next[next.length + 1] as FallingObject | undefined;
      (phantom as FallingObject).id;
      return next;
    });
  }, [makeObject, weather]);

  const catchObject = useCallback((id: number) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, caught: true } : o)),
    );
    // Remove caught objects from the DOM after their animation settles.
    window.setTimeout(() => {
      setObjects((prev) => prev.filter((o) => o.id !== id));
    }, 600);
  }, []);

  const spawnStorm = useCallback(() => {
    const toAdd = Array.from({ length: 8 }, () => makeObject(weather));
    setObjects((prev) => [...prev, ...toAdd]);
  }, [makeObject, weather]);

  return { objects, dropOne, catchObject, spawnStorm };
}
