interface DropButtonProps {
  onDrop: () => void;
}

export function DropButton({ onDrop }: DropButtonProps) {
  return (
    <button type="button" className="control control-primary" onClick={onDrop}>
      Drop one
    </button>
  );
}
