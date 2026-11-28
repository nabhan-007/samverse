import { useState } from "react";
import api from "../../api/axios";

const blank = {
  name: "",
  label: "Home",
  address: "",
  city: "",
  pin: "",
  phone: "",
  isDefault: false,
};

export default function AddressModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial ? { ...blank, ...initial } : { ...blank },
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = initial
        ? await api.put(`/user/addresses/${initial._id}`, form)
        : await api.post("/user/addresses", form);
      onSaved(data.data);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      else setError(err.response?.data?.message || "Could not save the address");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, placeholder, extra = {}) => (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
        {label}
      </label>
      <input
        name={name}
        value={form[name]}
        onChange={change}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none transition focus:ring-2 ${
          errors[name]
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-brand focus:ring-brand/15"
        }`}
        {...extra}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {initial ? "Edit address" : "Add address"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {field("Full name", "name", "Rahul Sharma")}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
                Label
              </label>
              <select
                name="label"
                value={form.label}
                onChange={change}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {field("Address", "address", "House, street, area")}

          <div className="grid gap-3.5 sm:grid-cols-2">
            {field("City", "city", "Kozhikode")}
            {field("PIN code", "pin", "673001", { inputMode: "numeric", maxLength: 6 })}
          </div>

          {field("Phone", "phone", "+919876543210", { type: "tel" })}

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={change}
              className="h-4 w-4 rounded border-slate-300 accent-brand"
            />
            Use as my default address
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              disabled={saving}
              className="h-11 flex-1 rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : initial ? "Save changes" : "Add address"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
