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
    setObjects((prev) => [...prev, makeObject(weather)]);
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
    // BUG #4 (intentional): kick off a Promise.all that includes a rejecting
    // promise, and deliberately don't await it. Produces an unhandled promise
    // rejection that Sentry's onunhandledrejection handler captures. The UI
    // does NOT crash — the storm still renders, the error fires in the
    // background. Demo flavor: "an error your users would never notice."
    void Promise.all([
      Promise.resolve('ok'),
      Promise.reject(
        new Error('StormSurge: simulated transient infrastructure failure'),
      ),
    ]);
    const toAdd = Array.from({ length: 8 }, () => makeObject(weather));
    setObjects((prev) => [...prev, ...toAdd]);
  }, [makeObject, weather]);

  return { objects, dropOne, catchObject, spawnStorm };
}
