import { useEffect, useState } from "react";
import { secToClock, clockToSec } from "./pipeline/time";

// mm:ss 時間輸入框：對外是秒數，對內顯示 m:ss。回饋 #4。
export default function TimeField({
  value,
  onChange,
  width = 70,
}: {
  value: number;
  onChange: (sec: number) => void;
  width?: number;
}) {
  const [txt, setTxt] = useState(secToClock(value));
  useEffect(() => setTxt(secToClock(value)), [value]);
  const commit = () => onChange(clockToSec(txt));
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="m:ss"
      value={txt}
      style={{ width }}
      onChange={(e) => setTxt(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
      }}
    />
  );
}
