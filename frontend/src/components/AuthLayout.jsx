export default function AuthLayout({ title, subtitle, headline, wide, children }) {
  return (
    <section className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden min-h-[560px] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,#3a3f4b_0%,#17181c_55%,#0b0b0d_100%)]" />
        <div className="relative flex h-full items-center justify-center px-16">
          <h2 className="whitespace-pre-line text-center text-6xl font-bold leading-tight tracking-tight text-white">
            {headline || "Welcome back\nto Samverse"}
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#f4f7fd] px-4 py-8 sm:px-6 sm:py-10 lg:py-8">
        <div
          className={`w-full ${wide ? "max-w-[560px]" : "max-w-[500px]"} rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8`}
        >
          <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-[15px] text-slate-500">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
