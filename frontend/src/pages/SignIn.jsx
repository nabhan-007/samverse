import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import SsoButtons from "../components/SsoButtons";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/user/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors)[0]
          : err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your credentials to access your account."
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
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            placeholder="name@example.com"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={show ? "text" : "password"}
              value={form.password}
              onChange={change}
              placeholder="••••••••"
              className="h-12 w-full rounded-lg border border-slate-300 px-4 pr-12 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 accent-brand"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-medium text-brand hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          disabled={loading}
          className="h-13 w-full rounded-lg bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <SsoButtons />

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
