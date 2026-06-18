import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { site } from "@/data/site";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";
import { WhatsAppIcon } from "./WhatsAppIcon";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Available Cars" },
  { to: "/import-services", label: "Import Services" },
  { to: "/sell-your-car", label: "Sell Your Car" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full overflow-hidden border-b border-[oklch(0.66_0.2_252_/_0.28)] bg-[linear-gradient(135deg,_oklch(0.12_0.035_252_/_0.98),_oklch(0.18_0.09_252_/_0.96)_48%,_oklch(0.1_0.03_252_/_0.98))] shadow-[0_14px_38px_oklch(0.1_0.03_252_/_0.3),_0_0_34px_oklch(0.63_0.21_252_/_0.18),_inset_0_-1px_0_oklch(0.72_0.18_245_/_0.38)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,_oklch(0.66_0.2_252_/_0.22),_transparent_28%),radial-gradient(circle_at_82%_100%,_oklch(0.62_0.22_245_/_0.16),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,_transparent,_oklch(0.78_0.17_240_/_0.82),_transparent)]" />
      <div className="container-px relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 sm:h-[5.5rem]">
        <Link
          to="/"
          className="flex shrink-0 flex-col items-center justify-center gap-0.5 text-center text-white sm:gap-1"
          aria-label={site.name}
        >
          <BrandLogo imageClassName="h-12 w-12 sm:h-14 sm:w-14" />
          <span className="max-w-none whitespace-nowrap text-[0.52rem] font-medium leading-none text-white/72 sm:text-[0.64rem]">
            {site.motto}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-[var(--brand-accent)]"
              activeProps={{ className: "bg-white/10 text-[var(--brand-accent)]" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a
            href={site.phoneHref}
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
          >
            <Phone className="h-4 w-4" /> {site.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={site.phoneHref}
            aria-label="Call Motorspace Kenya"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:scale-105"
          >
            <WhatsAppIcon className="h-6 w-6 rounded-full" />
          </a>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="relative border-t border-[oklch(0.66_0.2_252_/_0.28)] bg-[linear-gradient(135deg,_oklch(0.12_0.035_252),_oklch(0.17_0.08_252))] lg:hidden">
          <nav className="container-px mx-auto flex max-w-7xl flex-col py-4">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-sm font-medium text-white/75">Display</span>
              <ThemeToggle className="scale-90" />
            </div>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-white/90 hover:bg-white/10 hover:text-[var(--brand-accent)]"
                activeProps={{ className: "bg-white/10 text-[var(--brand-accent)]" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
