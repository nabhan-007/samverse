export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  busy,
  onConfirm,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg ${
              danger ? "bg-red-50 text-[#c1121f]" : "bg-brand/10 text-brand"
            }`}
          >
            {danger ? "!" : "?"}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`h-11 flex-1 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60 ${
              danger
                ? "bg-[#c1121f] hover:bg-[#a10e19]"
                : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="h-11 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
