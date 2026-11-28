import { useEffect, useState } from "react";
import adminApi from "../../api/admin";
import AdminShell from "../../components/admin/AdminShell";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const LIMIT = 8;

const joined = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    adminApi
      .get("/admin/users", { params: { search: query, page, limit: LIMIT } })
      .then(({ data }) => {
        if (!alive) return;
        setUsers(data.users);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.response?.data?.message || "Could not load users");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query, page]);

  const toggleBlock = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await adminApi.patch(
        `/admin/users/${target._id}/${target.isBlocked ? "unblock" : "block"}`,
      );
      setUsers((list) =>
        list.map((u) =>
          u._id === target._id ? { ...u, isBlocked: data.data.isBlocked } : u,
        ),
      );
      setNotice(
        data.data.isBlocked
          ? `${target.name} is blocked`
          : `${target.name} is unblocked`,
      );
      setTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="User management" subtitle="Search, review and block accounts">
      {(notice || error) && (
        <p
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
            error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || notice}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[360px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone"
              className="h-11 w-full rounded-lg border border-slate-300 pl-4 pr-10 text-[15px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-sm text-slate-500">
            {pagination.total} user{pagination.total === 1 ? "" : "s"}
            {query && ` matching "${query}"`}
          </p>
        </div>

        {loading ? (
          <p className="px-4 py-16 text-center text-sm text-slate-500">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-slate-500">
            {query ? `No users match "${query}"` : "No users yet"}
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    <th className="px-4 py-3 font-bold">Phone</th>
                    <th className="px-4 py-3 font-bold">Joined</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {joined(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                            user.isBlocked
                              ? "bg-red-50 text-[#c1121f]"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setTarget(user)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            user.isBlocked
                              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              : "border-red-300 text-[#c1121f] hover:bg-red-50"
                          }`}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {users.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <p className="truncate text-sm text-slate-600">
                        {user.email}
                      </p>
                      <p className="text-sm text-slate-500">{user.phone}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        user.isBlocked
                          ? "bg-red-50 text-[#c1121f]"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Joined {joined(user.createdAt)}
                    </span>
                    <button
                      onClick={() => setTarget(user)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        user.isBlocked
                          ? "border-emerald-300 text-emerald-700"
                          : "border-red-300 text-[#c1121f]"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages || loading}
              className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {target && (
        <ConfirmDialog
          danger={!target.isBlocked}
          title={target.isBlocked ? "Unblock this user?" : "Block this user?"}
          message={
            target.isBlocked
              ? `${target.name} will be able to sign in and shop again.`
              : `${target.name} will be signed out of new sessions and cannot sign in until unblocked.`
          }
          confirmLabel={target.isBlocked ? "Unblock user" : "Block user"}
          busy={busy}
          onConfirm={toggleBlock}
          onClose={() => setTarget(null)}
        />
      )}
    </AdminShell>
  );
}
