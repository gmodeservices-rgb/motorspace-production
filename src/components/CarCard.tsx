import { Link } from "@tanstack/react-router";
import { Gauge, Fuel, Settings2 } from "lucide-react";
import locationIcon from "@/assets/location.png";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { Car } from "@/data/cars";
import { getWhatsAppUrl, whatsappMessages } from "@/data/site";

export function formatPrice(price: number) {
  return `KES ${price.toLocaleString()}`;
}

export function CarCard({ car }: { car: Car }) {
  const waHref = getWhatsAppUrl(
    whatsappMessages.carInquiry(`${car.make} ${car.model} ${car.year}`),
  );
  const usageBadge = getUsageBadge(car.condition);
  const badgeColor =
    car.availability === "Available"
      ? "bg-[var(--brand-accent)] text-white"
      : car.availability === "Sold"
        ? "bg-red-600 text-white"
        : "bg-white text-[var(--navy-deep)]";
  return (
    <article className="surface-card vehicle-neon-outline group flex h-full min-h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link
        to="/cars/$slug"
        params={{ slug: car.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/10]"
      >
        <img
          src={car.images[0]}
          alt={`${car.year} ${car.make} ${car.model}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
        >
          {car.availability}
        </span>
        {usageBadge && (
          <span className="absolute right-3 top-3 max-w-[calc(100%-7.5rem)] rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur">
            {usageBadge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-h-[5.25rem] flex-col gap-1.5">
          <h3 className="text-lg font-bold leading-tight">
            {car.make} {car.model}
          </h3>
          <p className="vehicle-price text-base font-bold sm:text-lg">{formatPrice(car.price)}</p>
          <p className="text-sm text-muted-foreground">
            {car.year} / {car.bodyType}
          </p>
        </div>
        <div className="mt-4 grid min-h-[4.5rem] grid-cols-1 gap-2 text-xs text-muted-foreground min-[380px]:grid-cols-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 shrink-0" /> {car.mileage.toLocaleString()} km
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 shrink-0" /> {car.transmission}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 shrink-0" /> {car.fuelType}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <img src={locationIcon} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
            {car.location}
          </span>
        </div>
        <div className="mt-auto flex gap-2 pt-5">
          <Link
            to="/cars/$slug"
            params={{ slug: car.slug }}
            className="flex min-h-10 flex-1 items-center justify-center rounded-full bg-[var(--navy-deep)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[var(--navy)]"
          >
            View Details
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp inquiry"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 hover:brightness-110"
          >
            <WhatsAppIcon className="h-10 w-10 rounded-full" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function getUsageBadge(condition: string) {
  const normalized = condition.trim().toLowerCase();

  if (normalized === "foreign used") return "Foreign Used";
  if (normalized === "locally used") return "Locally Used";

  return "";
}
