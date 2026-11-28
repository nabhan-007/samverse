import { useRef } from "react";

export default function OtpInput({ value, onChange, invalid }) {
  const refs = useRef([]);

  const setAt = (i, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0)
      refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((c, idx) => {
      next[idx] = c;
    });
    onChange(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className={`h-14 w-11 rounded-lg border text-center text-xl font-semibold outline-none transition focus:ring-2 sm:w-12 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-300 focus:border-brand focus:ring-brand/15"
          }`}
        />
      ))}
    </div>
  );
}
