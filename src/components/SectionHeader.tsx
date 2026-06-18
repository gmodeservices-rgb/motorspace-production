export function SectionHeader({
  eyebrow,
  title,
  description,
  center,
  light,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div
      className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${light ? "text-white" : ""}`}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase text-[var(--brand-accent)]">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {description && (
        <p
          className={`mt-4 text-sm leading-relaxed sm:text-base ${light ? "text-white/70" : "text-muted-foreground"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
