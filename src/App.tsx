import { useState } from 'react';
import type { WeatherMode } from './types';
import { useFallingObjects } from './hooks/useFallingObjects';
import { Header } from './components/Header';
import { SkyCanvas } from './components/SkyCanvas';
import { DropButton } from './components/DropButton';
import { WeatherToggle } from './components/WeatherToggle';
import { CatchCounter } from './components/CatchCounter';
import { StormButton } from './components/StormButton';

export default function App() {
  const [weather, setWeather] = useState<WeatherMode>('rain');
  const [caughtCount, setCaughtCount] = useState(0);

  const { objects, dropOne, catchObject, spawnStorm } = useFallingObjects({
    weather,
  });

  return (
    <div className="app">
      <Header />
      <SkyCanvas
        objects={objects}
        onCatch={(id) => {
          catchObject(id);
          // BUG #3 (intentional): catching DECREMENTS the counter instead of incrementing.
          // Sentry capture is triggered inside CatchCounter when the value drops below zero.
          setCaughtCount((c) => c - 1);
        }}
      />
      <div className="controls">
        <DropButton onDrop={dropOne} />
        <StormButton onStorm={spawnStorm} />
        <WeatherToggle value={weather} onChange={setWeather} />
        <CatchCounter value={caughtCount} onReset={() => setCaughtCount(0)} />
      </div>
      <footer className="footer">
        <span>Skyfall Sky · demo playground</span>
        <span>
          Errors flow to Sentry → Skyfall → Slack. Open the browser console to see local logs.
        </span>
      </footer>
    </div>
  );
}
