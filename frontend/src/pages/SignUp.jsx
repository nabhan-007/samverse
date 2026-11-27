import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import SsoButtons from "../components/SsoButtons";

const empty = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

const validate = (form) => {
  const e = {};

  if (!form.name.trim()) e.name = "Name is required";
  else if (form.name.trim().length < 3)
    e.name = "Name must be at least 3 characters";
  else if (/\d/.test(form.name)) e.name = "Name cannot contain numbers";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Enter a valid email address";

  if (!/^\+91[6-9]\d{9}$/.test(form.phone))
    e.phone = "Use +91 followed by 10 digits";

  if (form.password.length < 8)
    e.password = "Password must be at least 8 characters";
  else if (
    !/[A-Z]/.test(form.password) ||
    !/[a-z]/.test(form.password) ||
    !/\d/.test(form.password)
  )
    e.password = "Use upper case, lower case and a number";

  if (form.confirmPassword !== form.password)
    e.confirmPassword = "Passwords do not match";

  return e;
};

const inputClass = (error) =>
  `h-12 w-full rounded-lg border px-4 text-[15px] outline-none transition focus:ring-2 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-brand focus:ring-brand/15"
  }`;

function Field({ label, name, type = "text", placeholder, value, error, onChange, onBlur, right }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={`${inputClass(error)} ${right ? "pr-12" : ""}`}
        />
        {right}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const change = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const blur = (e) => {
    const all = validate(form);
    setErrors({ ...errors, [e.target.name]: all[e.target.name] || "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = validate(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setLoading(true);
    try {
      const { data } = await api.post("/user/auth/register", form);
      navigate("/verify-otp", {
        state: { email: form.email, expiresIn: data.data.expiresIn },
      });
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      else
        setServerError(
          err.response?.data?.message || "Something went wrong. Try again.",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      wide
      title="Create account"
      subtitle="Join Samverse in less than a minute."
      headline={"Your next Galaxy\nstarts here"}
    >
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            name="name"
            placeholder="Rahul Sharma"
            value={form.name}
            error={errors.name}
            onChange={change}
            onBlur={blur}
          />

          <Field
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="+919876543210"
            value={form.phone}
            error={errors.phone}
            onChange={change}
            onBlur={blur}
          />

          <div className="sm:col-span-2">
            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              error={errors.email}
              onChange={change}
              onBlur={blur}
            />
          </div>

          <Field
            label="Password"
            name="password"
            type={show ? "text" : "password"}
            placeholder="At least 8 characters"
            value={form.password}
            error={errors.password}
            onChange={change}
            onBlur={blur}
            right={
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
              >
                {show ? "Hide" : "Show"}
              </button>
            }
          />

          <Field
            label="Confirm password"
            name="confirmPassword"
            type={show ? "text" : "password"}
            placeholder="Repeat your password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={change}
            onBlur={blur}
          />
        </div>

        <button
          disabled={loading}
          className="h-13 w-full rounded-lg bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-xs text-slate-500">
          By creating an account you agree to our Terms of Sale and Privacy
          Policy. We'll email you a 6-digit code to verify it.
        </p>
      </form>

      <SsoButtons />

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/signin" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
