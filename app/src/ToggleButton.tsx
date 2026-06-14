// 流行樣式的 Toggle 開關（取代 checkbox）。回饋 260614_3 UI #1。
export default function ToggleButton({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={"toggle" + (checked ? " on" : "")}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-track"><span className="toggle-thumb" /></span>
      {label && <span className="toggle-label">{label}</span>}
    </button>
  );
}
