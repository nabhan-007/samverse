import { useState } from "react";
import api from "../../api/axios";

const empty = { currentPassword: "", password: "", confirmPassword: "" };

export default function ChangePassword() {
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMessage("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/user/change-password", form);
      setMessage(data.message);
      setForm(empty);
      setErrors({});
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      else setError(err.response?.data?.message || "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, placeholder) => (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
        {label}
      </label>
      <input
        name={name}
        type={show ? "text" : "password"}
        value={form[name]}
        onChange={change}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border px-4 text-[15px] outline-none transition focus:ring-2 ${
          errors[name]
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-brand focus:ring-brand/15"
        }`}
      />
      {errors[name] && (
        <p className="mt-1.5 text-xs text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      {field("Current password", "currentPassword", "Your current password")}
      {field("New password", "password", "At least 8 characters")}
      {field("Confirm new password", "confirmPassword", "Repeat the new password")}

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-brand"
        />
        Show passwords
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <button
        disabled={loading}
        className="h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
