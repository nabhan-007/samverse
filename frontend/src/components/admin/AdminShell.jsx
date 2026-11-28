import { Link, Navigate, useNavigate } from "react-router-dom";
import { clearAdmin, getAdminToken } from "../../api/admin";

export default function AdminShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminUser") || "null");

  if (!getAdminToken()) return <Navigate to="/admin/login" replace />;

  const signOut = () => {
    clearAdmin();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-dvh bg-[#f4f7fd]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <Link to="/admin/users" className="flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-lg font-bold text-white">
            S
          </span>
          <span className="text-lg font-bold tracking-tight text-brand">
            Samverse
          </span>
        </Link>
        <p className="mt-1 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Admin
        </p>

        <nav className="mt-8 space-y-1">
          <Link
            to="/admin/users"
            className="block rounded-lg bg-brand/10 px-3 py-2.5 text-sm font-semibold text-brand"
          >
            Users
          </Link>
        </nav>

        <Link
          to="/"
          className="mt-auto rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          ← Back to store
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-white md:hidden">
              S
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-xs text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {admin?.name}
            </span>
            <button
              onClick={signOut}
              className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
