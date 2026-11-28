import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { assetUrl } from "../api/axios";
import { clearAuth, getToken, setAuth } from "../api/auth";
import AddressModal from "../components/profile/AddressModal";
import ChangeEmail from "../components/profile/ChangeEmail";
import ChangePassword from "../components/profile/ChangePassword";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [p, a] = await Promise.all([
      api.get("/user/profile"),
      api.get("/user/addresses"),
    ]);
    setProfile(p.data.data);
    setAddresses(a.data.data);
    setForm({ name: p.data.data.name, phone: p.data.data.phone });
  };

  useEffect(() => {
    if (!getToken()) return;
    load().catch(() => {
      clearAuth();
      navigate("/signin");
    });
  }, [navigate]);

  if (!getToken()) return <Navigate to="/signin" replace />;
  if (!profile) {
    return (
      <section className="flex flex-1 items-center justify-center bg-[#f4f7fd]">
        <p className="text-sm text-slate-500">Loading your profile...</p>
      </section>
    );
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.put("/user/profile", form);
      setProfile(data.data);
      setAuth(getToken(), {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
      });
      setEditing(false);
      setErrors({});
      setNotice("Profile updated");
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      else setError(err.response?.data?.message || "Could not save your profile");
    } finally {
      setBusy(false);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("avatar", file);
      const { data } = await api.post("/user/profile/avatar", body);
      setProfile(data.data);
      setNotice("Photo updated");
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload the photo");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const removeAddress = async (id) => {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/user/addresses/${id}`);
      setConfirmId(null);
      setAddresses((list) => list.filter((a) => a._id !== id));
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove the address");
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = async (address) => {
    setBusy(true);
    try {
      await api.put(`/user/addresses/${address._id}`, {
        ...address,
        isDefault: true,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the address");
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <section className="flex-1 bg-[#f4f7fd] px-4 py-6 md:px-12 md:py-8">
      <div className="mx-auto w-full max-w-[1000px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <Link to="/" className="hover:text-brand">
            Home
          </Link>{" "}
          › <span className="text-slate-700">My Profile</span>
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          My Profile
        </h1>

        {(notice || error) && (
          <p
            className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
              error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </p>
        )}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200"
              title="Change photo"
            >
              {profile.avatar ? (
                <img
                  src={assetUrl(profile.avatar)}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-xl font-bold text-slate-600">
                  {initials(profile.name)}
                </span>
              )}
              <span className="absolute inset-0 hidden place-items-center bg-slate-900/50 text-[11px] font-semibold text-white group-hover:grid">
                Change
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadAvatar}
              className="hidden"
            />

            {editing ? (
              <form onSubmit={saveProfile} className="flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Full name"
                      className={`h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-400 focus:ring-red-100"
                          : "border-slate-300 focus:border-brand focus:ring-brand/15"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      value={form.phone}
                      onChange={(e) => {
                        setForm({ ...form, phone: e.target.value });
                        setErrors({ ...errors, phone: "" });
                      }}
                      placeholder="+919876543210"
                      className={`h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-400 focus:ring-red-100"
                          : "border-slate-300 focus:border-brand focus:ring-brand/15"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={busy}
                    className="h-10 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setErrors({});
                      setForm({ name: profile.name, phone: profile.phone });
                    }}
                    className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  {profile.phone} · {profile.email}
                </p>
              </div>
            )}

            {!editing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="h-10 rounded-lg border border-brand px-5 text-sm font-medium text-brand transition hover:bg-brand/5"
                >
                  Edit Profile
                </button>
                <button
                  onClick={signOut}
                  className="h-10 rounded-lg bg-[#c1121f] px-5 text-sm font-medium text-white transition hover:bg-[#a10e19]"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Saved addresses
              </h2>
              <p className="text-sm text-slate-500">
                {addresses.length} saved · used at checkout
              </p>
            </div>
            <button
              onClick={() => setModal({ initial: null })}
              className="h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Add address
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              No addresses yet. Add one to speed up checkout.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        {address.label}
                        {address.isDefault && (
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{address.name}</p>
                      <p className="text-sm text-slate-500">
                        {address.address}, {address.city} {address.pin}
                      </p>
                      <p className="text-sm text-slate-500">{address.phone}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                    <button
                      onClick={() => setModal({ initial: address })}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:border-brand hover:text-brand"
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => makeDefault(address)}
                        disabled={busy}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:border-brand hover:text-brand disabled:opacity-50"
                      >
                        Set default
                      </button>
                    )}
                    {confirmId === address._id ? (
                      <>
                        <button
                          onClick={() => removeAddress(address._id)}
                          disabled={busy}
                          className="rounded-lg bg-[#c1121f] px-3 py-1.5 text-white disabled:opacity-60"
                        >
                          Confirm delete
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700"
                        >
                          Keep
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmId(address._id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-[#c1121f] hover:border-[#c1121f]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
            <h2 className="text-lg font-bold text-slate-900">Change password</h2>
            <p className="text-sm text-slate-500">
              Use upper case, lower case and a number.
            </p>
            <ChangePassword />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
            <h2 className="text-lg font-bold text-slate-900">Email address</h2>
            <p className="text-sm text-slate-500">
              Changing it needs a 6-digit code sent to the new address.
            </p>
            <ChangeEmail
              currentEmail={profile.email}
              onChanged={(updated) => {
                setProfile(updated);
                setAuth(getToken(), {
                  id: updated.id,
                  name: updated.name,
                  email: updated.email,
                  role: updated.role,
                });
                setNotice("Email updated");
              }}
            />
          </div>
        </div>
      </div>

      {modal && (
        <AddressModal
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setNotice("Address saved");
            load();
          }}
        />
      )}
    </section>
  );
}
