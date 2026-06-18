import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, LogIn } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import { site } from "@/data/site";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login | motorspaceKenya" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    void navigate({ to: "/admin" });
  }

  return (
    <main className="min-h-screen bg-[var(--soft-grey)]">
      <div className="container-px mx-auto flex min-h-screen max-w-7xl items-center justify-center py-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[var(--brand-accent)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border border-[var(--brand-accent)]/25 bg-black p-4 shadow-[0_18px_45px_oklch(0.15_0.035_252_/_0.16)]">
              <BrandLogo className="justify-center" imageClassName="h-28 w-28" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--brand-accent)]">{site.motto}</p>
            <h1 className="mt-2 text-2xl font-bold">Inventory Admin</h1>
          </div>

          {!isSupabaseConfigured ? (
            <div className="rounded-xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env.local`, then
              restart the dev server.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
                  placeholder="admin@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Password
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
                  placeholder="Your password"
                />
              </label>
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button
                disabled={loading}
                className="btn-accent w-full disabled:pointer-events-none disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" /> {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
