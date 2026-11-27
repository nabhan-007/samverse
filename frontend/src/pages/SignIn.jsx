import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2">
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
  </svg>
);

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
      const { data } = await api.post("/auth/login", form);
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
    <section className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden min-h-[560px] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,#3a3f4b_0%,#17181c_55%,#0b0b0d_100%)]" />
        <div className="relative flex h-full items-center justify-center px-16">
          <h2 className="text-center text-6xl font-bold leading-tight tracking-tight text-white">
            Welcome back
            <br />
            to Samverse
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#f4f7fd] px-4 py-8 sm:px-6 sm:py-10 lg:py-8">
        <div className="w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sign In
          </h1>
          <p className="mt-2 text-center text-[15px] text-slate-500">
            Enter your credentials to access your account.
          </p>

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

          <div className="my-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or continue with
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-3">
            <a
              href={`${API}/auth/google`}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-[15px] font-medium text-slate-800 hover:bg-slate-50"
            >
              <GoogleIcon /> Sign in with Google
            </a>
            <a
              href={`${API}/auth/facebook`}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-[15px] font-medium text-slate-800 hover:bg-slate-50"
            >
              <FacebookIcon /> Sign in with Facebook
            </a>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-brand hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
