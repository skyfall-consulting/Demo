interface StormButtonProps {
  onStorm: () => void;
}

export function StormButton({ onStorm }: StormButtonProps) {
  return (
    <button type="button" className="control control-storm" onClick={onStorm}>
      ⚡ Storm
    </button>
  );
}
