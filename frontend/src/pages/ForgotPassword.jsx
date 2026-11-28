import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/user/auth/forgotpassword", { email });
      navigate("/reset-password", {
        state: { email, expiresIn: data.data.expiresIn },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a 6-digit reset code."
      headline={"Forgot it?\nNo problem"}
    >
      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="name@example.com"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <button
          disabled={loading}
          className="h-13 w-full rounded-lg bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link to="/signin" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
