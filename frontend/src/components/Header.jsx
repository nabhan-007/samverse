import { Link } from "react-router-dom";

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const HeartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="20.5" r="1.2" />
    <circle cx="19" cy="20.5" r="1.2" />
    <path d="M1.5 2.5h3l2.5 12.4a2 2 0 0 0 2 1.6h9a2 2 0 0 0 2-1.6L22 6H5.5" />
  </svg>
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full items-center gap-4 px-4 md:h-16 md:gap-10 md:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-lg font-bold text-white">
            S
          </span>
          <span className="text-xl font-bold tracking-tight text-brand md:text-2xl">
            Samverse
          </span>
        </Link>

        <div className="relative mx-auto hidden w-full max-w-[560px] md:block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search Galaxy phones, tablets, watches..."
            className="h-10 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-sm outline-none placeholder:text-slate-400 focus:border-brand"
          />
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-4 md:gap-7">
          <button className="text-slate-600 md:hidden" aria-label="Search">
            <SearchIcon />
          </button>
          <Link to="/wishlist" className="text-brand hover:opacity-70">
            <HeartIcon />
          </Link>
          <Link to="/cart" className="text-brand hover:opacity-70">
            <CartIcon />
          </Link>
          <Link
            to="/signin"
            className="text-[15px] font-medium text-brand hover:underline"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
