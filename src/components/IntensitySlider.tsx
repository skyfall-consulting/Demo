interface IntensitySliderProps {
  value: number;
  onChange: (next: number) => void;
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  return (
    <label className="control control-slider">
      <span className="stat-label">intensity</span>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="stat-value">{value}</span>
    </label>
  );
}
