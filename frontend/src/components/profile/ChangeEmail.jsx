import { useState } from "react";
import api from "../../api/axios";
import OtpInput from "../OtpInput";

export default function ChangeEmail({ currentEmail, onChanged }) {
  const [step, setStep] = useState("idle");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("idle");
    setEmail("");
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setInfo("");
  };

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/user/email-change", { email });
      setStep("verify");
      setInfo(`We sent a 6-digit code to ${email}`);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      setError(
        fieldErrors
          ? Object.values(fieldErrors)[0]
          : err.response?.data?.message || "Could not send the code",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/user/email-change/verify", {
        email,
        code,
      });
      onChanged(data.data);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Current email
          </p>
          <p className="text-[15px] text-slate-800">{currentEmail}</p>
        </div>
        {step === "idle" && (
          <button
            onClick={() => setStep("email")}
            className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5"
          >
            Change
          </button>
        )}
      </div>

      {step === "email" && (
        <form onSubmit={sendCode} className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="new@example.com"
            className="h-11 w-full rounded-lg border border-slate-300 px-4 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              disabled={loading}
              className="h-11 flex-1 rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send code"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={confirm} className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">{info}</p>
          <OtpInput
            value={digits}
            onChange={(next) => {
              setDigits(next);
              setError("");
            }}
            invalid={Boolean(error)}
          />
          {error && (
            <p className="text-center text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              disabled={loading}
              className="h-11 flex-1 rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Confirm new email"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
