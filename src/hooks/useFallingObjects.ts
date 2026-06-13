import { useCallback, useRef, useState } from 'react';
import type { FallingObject, WeatherMode } from '../types';

interface UseFallingObjectsArgs {
  weather: WeatherMode;
}

export function useFallingObjects({ weather }: UseFallingObjectsArgs) {
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const dropCountRef = useRef(0);
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
    dropCountRef.current += 1;
    const count = dropCountRef.current;
    setObjects((prev) => {
      const next = [...prev, makeObject(weather)];
      // BUG #1 (intentional): on the 5th drop click we read past the end of the array.
      // Throws a TypeError that Sentry catches via the global error handler.
      if (count === 5) {
        const phantom = next[next.length + 1] as FallingObject | undefined;
        // touching a property on `undefined` to trigger the TypeError at runtime
        (phantom as FallingObject).id;
      }
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

  const spawnMany = useCallback(
    (intensity: number) => {
      // BUG #4 (intentional): at max intensity we kick off a Promise.all that includes
      // a rejecting promise, and we deliberately do NOT await it — producing an
      // unhandled promise rejection that Sentry's onunhandledrejection captures.
      if (intensity >= 10) {
        void Promise.all([
          Promise.resolve('ok'),
          Promise.reject(
            new Error('IntensityOverflow: storm intensity exceeded safe threshold (10)'),
          ),
        ]);
      }
      const toAdd = Array.from({ length: intensity }, () => makeObject(weather));
      setObjects((prev) => [...prev, ...toAdd]);
    },
    [makeObject, weather],
  );

  return { objects, dropOne, catchObject, spawnMany };
}
