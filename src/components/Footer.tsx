import { Link } from "@tanstack/react-router";
import { Phone, Send } from "lucide-react";
import emailIcon from "@/assets/email.png";
import facebookIcon from "@/assets/facebook.png";
import instagramIcon from "@/assets/instagram.png";
import locationIcon from "@/assets/location.png";
import { site } from "@/data/site";
import { BrandLogo } from "./BrandLogo";
import { WhatsAppIcon } from "./WhatsAppIcon";

const services = [
  { to: "/cars", label: "Verified Vehicle Sales" },
  { to: "/import-services", label: "Car Import Support" },
  { to: "/contact", label: "Book a Viewing" },
  { to: "/contact", label: "Financing Guidance" },
  { to: "/sell-your-car", label: "Sell or Trade In" },
] as const;

const socialLinks = [
  {
    href: site.socials.instagram,
    label: "Motorspace Kenya on Instagram",
    icon: instagramIcon,
  },
  {
    href: site.socials.facebook,
    label: "Motorspace Kenya on Facebook",
    icon: facebookIcon,
  },
].filter((item) => item.href);

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,_oklch(0.12_0.035_252),_oklch(0.07_0.025_252))] text-white/75">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,_oklch(0.63_0.21_252_/_0.2),_transparent_34%),radial-gradient(circle_at_85%_100%,_oklch(0.63_0.21_252_/_0.12),_transparent_34%)]" />
      <div className="container-px relative mx-auto max-w-7xl py-8 sm:py-12 lg:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <BrandLogo imageClassName="h-16 w-16 sm:h-24 sm:w-24" />
          <p className="mt-3 max-w-2xl text-center text-xs leading-6 sm:mt-5 sm:text-sm sm:leading-7">
            Motorspace Kenya is a premium automotive partner for verified vehicle sales, imports,
            viewing support, and financing guidance across Kenya.
          </p>

          <div className="mt-8 min-w-0 sm:mt-10">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Services</h4>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:mt-5 sm:gap-x-7 sm:text-sm">
              {services.map((item) => (
                <li key={`${item.to}-${item.label}`}>
                  <Link to={item.to} className="transition hover:text-[var(--brand-accent)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 w-full max-w-2xl min-w-0 sm:mt-10">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Contact</h4>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-5 sm:gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:scale-105 hover:border-[var(--brand-accent)] sm:h-10 sm:w-10"
                >
                  <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
                </a>
              ))}
            </div>
            <ul className="mt-4 grid gap-3 text-xs sm:mt-5 sm:grid-cols-2 sm:gap-4 sm:text-sm">
              <li className="flex items-start justify-center gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent)]" />
                <a
                  href={site.phoneHref}
                  className="min-w-0 break-words transition hover:text-[var(--brand-accent)]"
                >
                  {site.phone}
                </a>
              </li>
              <li className="flex items-start justify-center gap-3">
                <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 break-words transition hover:text-[var(--brand-accent)]"
                >
                  {site.whatsapp}
                </a>
              </li>
              <li className="flex items-start justify-center gap-3">
                <img src={emailIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0 object-contain" />
                <a
                  href={site.emailHref}
                  className="min-w-0 break-words transition hover:text-[var(--brand-accent)]"
                >
                  {site.email}
                </a>
              </li>
              <li className="flex items-start justify-center gap-3">
                <img src={locationIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0 object-contain" />
                <span className="min-w-0 break-words">{site.location}</span>
              </li>
            </ul>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-5 max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left sm:mt-6"
            >
              <label htmlFor="footer-newsletter" className="text-xs font-semibold text-white/65">
                Get inventory updates
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  id="footer-newsletter"
                  type="email"
                  placeholder="Email address"
                  className="min-h-10 w-full min-w-0 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--brand-accent)] sm:min-h-11 sm:px-4"
                />
                <button
                  type="submit"
                  aria-label="Join newsletter"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] text-white transition hover:bg-[var(--brand-accent-strong)] sm:h-11 sm:w-11"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/55 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p>&copy; 2026 Motorspace Kenya. All rights reserved.</p>
          <p>Premium vehicle sales and imports in Kenya.</p>
        </div>
      </div>
    </footer>
  );
}
