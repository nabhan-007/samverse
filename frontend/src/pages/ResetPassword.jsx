import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { setAuth } from "../api/auth";
import AuthLayout from "../components/AuthLayout";
import OtpInput from "../components/OtpInput";
import useCountdown, { clock } from "../hooks/useCountdown";

const passwordError = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password))
    return "Use upper case, lower case and a number";
  return "";
};

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [left, reset] = useCountdown(state?.expiresIn ?? 120);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const expired = left <= 0;

  const submit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    const found = {};

    if (code.length !== 6) found.code = "Enter the 6-digit code";
    const pwError = passwordError(password);
    if (pwError) found.password = pwError;
    if (confirmPassword !== password)
      found.confirmPassword = "Passwords do not match";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const { data } = await api.post("/user/auth/newpassword", {
        email,
        code,
        password,
        confirmPassword,
      });
      setAuth(data.token, data.user);
      navigate("/");
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      else
        setServerError(
          err.response?.data?.message || "Could not reset the password",
        );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setServerError("");
    setInfo("");
    try {
      const { data } = await api.post("/user/auth/forgotpassword", { email });
      reset(data.data.expiresIn);
      setDigits(["", "", "", "", "", ""]);
      setInfo("A new code is on its way.");
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={`Enter the code we sent to ${email}`}
      headline={"New password,\nfresh start"}
    >
      <form onSubmit={submit} className="mt-8" noValidate>
        <OtpInput
          value={digits}
          onChange={(next) => {
            setDigits(next);
            setErrors({ ...errors, code: "" });
          }}
          invalid={Boolean(errors.code)}
        />
        {errors.code && (
          <p className="mt-2 text-center text-xs text-red-600">{errors.code}</p>
        )}

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

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
              New password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                placeholder="At least 8 characters"
                className={`h-12 w-full rounded-lg border px-4 pr-12 text-[15px] outline-none transition focus:ring-2 ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-brand focus:ring-brand/15"
                }`}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
              Confirm password
            </label>
            <input
              type={show ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: "" });
              }}
              placeholder="Repeat your password"
              className={`h-12 w-full rounded-lg border px-4 text-[15px] outline-none transition focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-brand focus:ring-brand/15"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {serverError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {serverError}
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
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Wrong email?{" "}
        <Link
          to="/forgot-password"
          className="font-medium text-brand hover:underline"
        >
          Start over
        </Link>
      </p>
    </AuthLayout>
  );
}
