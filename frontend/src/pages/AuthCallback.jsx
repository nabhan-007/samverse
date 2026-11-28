import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { setAuth } from "../api/auth";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    const failed = params.get("error");

    if (failed) {
      setError(failed);
      return;
    }
    if (!token) {
      setError("No sign-in token received");
      return;
    }

    localStorage.setItem("token", token);
    api
      .get("/user/profile")
      .then(({ data }) => {
        setAuth(token, {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
        });
        navigate("/", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        setError("Could not finish sign-in. Try again.");
      });
  }, [params, navigate]);

  return (
    <section className="flex flex-1 items-center justify-center bg-[#f4f7fd] px-4 py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-slate-900">
              Sign-in failed
            </h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Link
              to="/signin"
              className="mt-5 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900">
              Finishing sign-in...
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              One moment while we set up your session.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
