import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import adminApi, { getAdminToken, setAdmin } from "../../api/admin";

export default function AdminSignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getAdminToken()) return <Navigate to="/admin/users" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.post("/admin/auth/login", form);
      setAdmin(data.token, data.user);
      navigate("/admin/users");
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      setError(
        fieldErrors
          ? Object.values(fieldErrors)[0]
          : err.response?.data?.message || "Could not sign in",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#15171c] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-lg font-bold text-white">
            S
          </span>
          <span className="text-lg font-bold tracking-tight text-brand">
            Samverse
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Admin sign in
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Staff access only. Users sign in from the store.
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
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@samverse.in"
              className="h-12 w-full rounded-lg border border-slate-300 px-4 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          <button
            disabled={loading}
            className="h-12 w-full rounded-lg bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
