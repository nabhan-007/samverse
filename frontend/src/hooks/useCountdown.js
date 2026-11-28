import { useCallback, useEffect, useState } from "react";

export const clock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function useCountdown(initial) {
  const [left, setLeft] = useState(initial);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const reset = useCallback((seconds) => setLeft(seconds), []);

  return [left, reset];
}
