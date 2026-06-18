import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[var(--navy-deep)] py-12 text-white sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_oklch(0.63_0.21_252_/_0.24),_transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-accent)]/45 to-transparent" />
      <div className="container-px relative mx-auto max-w-7xl">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase text-[var(--brand-accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
