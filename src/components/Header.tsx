import { useRef } from 'react';

export function Header() {
  const stateRef = useRef<{ glowIntensity: number }>({ glowIntensity: 1 });

  const onHover = () => {
    const intensity = stateRef.current.glowIntensity;
    document.documentElement.style.setProperty('--logo-glow', String(intensity * 8));
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
