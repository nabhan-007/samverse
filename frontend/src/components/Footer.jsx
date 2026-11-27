const categories = ["Phones", "Tablets", "Watches", "Earbuds"];
const support = ["Help Center", "Returns & Warranty", "Shipping", "Contact"];

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <div className="mx-auto w-full px-4 py-10 md:px-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">Samverse</p>
            <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-slate-400">
              Premium Samsung Universe — Phones, Tablets, Watches, Buds
            </p>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Categories
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c} className="text-slate-300 hover:text-white">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Support
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {support.map((s) => (
                <li key={s} className="text-slate-300 hover:text-white">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>+91 98765 43210</li>
              <li>support@samverse.in</li>
              <li>Kochi, Kerala</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2024 Samverse India. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Sale
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
