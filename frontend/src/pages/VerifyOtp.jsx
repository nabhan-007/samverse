import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import OtpInput from "../components/OtpInput";
import useCountdown, { clock } from "../hooks/useCountdown";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [left, reset] = useCountdown(state?.expiresIn ?? 120);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) return <Navigate to="/signup" replace />;

  const expired = left <= 0;

  const submit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");
    try {
      const { data } = await api.post("/user/auth/verifyotp", { email, code });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError("");
    setInfo("");
    try {
      const { data } = await api.post("/user/auth/resendotp", { email });
      reset(data.data.expiresIn);
      setDigits(["", "", "", "", "", ""]);
      setInfo("A new code is on its way.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email}`}
      headline={"One last step,\nthen you're in"}
    >
      <form onSubmit={submit} className="mt-8">
        <OtpInput
          value={digits}
          onChange={(next) => {
            setDigits(next);
            setError("");
          }}
          invalid={Boolean(error)}
        />

        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className={expired ? "text-red-600" : "text-slate-500"}>
            {expired ? "Code expired" : `Expires in ${clock(left)}`}
          </span>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={resend}
            disabled={resending || !expired}
            className="font-medium text-brand hover:underline disabled:text-slate-400 disabled:no-underline"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {error}
          </p>
        )}
        {info && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-center text-sm text-emerald-700">
            {info}
          </p>
        )}

        <button
          disabled={loading}
          className="mt-6 h-13 w-full rounded-lg bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Wrong email?{" "}
        <Link to="/signup" className="font-medium text-brand hover:underline">
          Start over
        </Link>
      </div>
    </AuthLayout>
  );
}
