import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Car } from "@/data/cars";
import { Layout } from "@/components/Layout";
import { formatPrice } from "@/components/CarCard";
import { VerifiedIcon } from "@/components/VerifiedIcon";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import locationIcon from "@/assets/location.png";
import { useCarBySlug, useCars, useInventoryRealtime } from "@/hooks/use-inventory";
import { fetchCarBySlug } from "@/lib/inventory";
import { getWhatsAppUrl, site } from "@/data/site";
import { CarFront, ChevronLeft, ChevronRight, MessageCircle, Phone, Share2 } from "lucide-react";

type InquiryIntent = "General inquiry" | "Book viewing" | "Request financing";

type Specification = {
  label: string;
  value: string | number;
};

export const Route = createFileRoute("/cars/$slug")({
  loader: async ({ params }) => {
    const car = await fetchCarBySlug(params.slug);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.car.year} ${loaderData.car.make} ${loaderData.car.model} | Motorspace Kenya`,
          },
          { name: "description", content: loaderData.car.description },
          {
            property: "og:title",
            content: `${loaderData.car.year} ${loaderData.car.make} ${loaderData.car.model}`,
          },
          { property: "og:description", content: loaderData.car.description },
          { property: "og:image", content: loaderData.car.images[0] },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <div className="container-px mx-auto max-w-3xl py-32 text-center">
        <h1 className="text-3xl font-bold">Car not found</h1>
        <Link to="/cars" className="btn-navy mt-6 inline-flex">
          Browse Cars
        </Link>
      </div>
    </Layout>
  ),
  errorComponent: () => (
    <Layout>
      <div className="container-px mx-auto py-32 text-center">Something went wrong.</div>
    </Layout>
  ),
  component: CarDetail,
});

function CarDetail() {
  const { car: loaderCar } = Route.useLoaderData();
  const carQuery = useCarBySlug(loaderCar.slug, loaderCar);
  const car = carQuery.data ?? loaderCar;
  const carsQuery = useCars();
  useInventoryRealtime();
  const [active, setActive] = useState(0);
  const swipeStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const inventory = carsQuery.data ?? [];
  const similar = getSimilarCars(inventory, car, 4);
  const activeImage = car.images[active] ?? car.images[0];
  const hasMultipleImages = car.images.length > 1;
  const vehicleTitle = `${car.year} ${car.make} ${car.model}`;
  const subtitle = `${car.bodyType} / ${car.location} / ${car.condition}`;
  const specifications: Specification[] = [
    { label: "Make", value: car.make },
    { label: "Model", value: car.model },
    { label: "Year", value: car.year },
    { label: "Body Type", value: car.bodyType },
    { label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
    { label: "Transmission", value: car.transmission },
    { label: "Fuel Type", value: car.fuelType },
    { label: "Engine", value: formatEngineSize(car.engineSize) },
    { label: "Drive Type", value: car.driveType },
    { label: "Exterior Color", value: car.exteriorColor },
    { label: "Interior Color", value: car.interiorColor },
    { label: "Condition", value: car.condition },
    { label: "Location", value: car.location },
    { label: "Availability", value: car.availability },
    { label: "Chassis Number", value: "Available on request" },
  ];
  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setActive((current) => (current === 0 ? car.images.length - 1 : current - 1));
  };
  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setActive((current) => (current + 1) % car.images.length);
  };
  const handleGalleryPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      !hasMultipleImages ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0) ||
      (target instanceof Element && target.closest("button"))
    ) {
      return;
    }

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleGalleryPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    swipeStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const isHorizontalSwipe = Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4;

    if (!isHorizontalSwipe) return;
    if (deltaX < 0) {
      showNextImage();
    } else {
      showPreviousImage();
    }
  };
  const handleGalleryPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const handleShare = () => {
    navigator.share?.({ title: vehicleTitle, url: location.href }).catch(() => {});
  };

  useEffect(() => {
    setActive(0);
  }, [car.id]);

  return (
    <Layout>
      <section className="w-full overflow-hidden bg-[linear-gradient(180deg,_var(--soft-grey),_var(--background)_64%)]">
        <div className="container-px mx-auto w-full max-w-7xl pb-10 pt-5 sm:pb-14 sm:pt-7 lg:pb-16">
          <nav className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground sm:mb-7 sm:text-sm">
            <Link to="/" className="transition hover:text-[var(--brand-accent)]">
              Home
            </Link>
            <span className="text-border">/</span>
            <Link to="/cars" className="transition hover:text-[var(--brand-accent)]">
              Cars
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground">
              {car.make} {car.model}
            </span>
          </nav>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(400px,0.75fr)] lg:items-start lg:gap-8">
            <VehicleGallery
              active={active}
              activeImage={activeImage}
              hasMultipleImages={hasMultipleImages}
              images={car.images}
              onPointerCancel={handleGalleryPointerCancel}
              onPointerDown={handleGalleryPointerDown}
              onPointerEnd={handleGalleryPointerEnd}
              onSelectImage={setActive}
              onShowNext={showNextImage}
              onShowPrevious={showPreviousImage}
              vehicleTitle={vehicleTitle}
            />

            <VehicleSummaryCard
              car={car}
              onShare={handleShare}
              subtitle={subtitle}
              vehicleTitle={vehicleTitle}
            />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto w-full max-w-7xl -translate-y-3 sm:-translate-y-5">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(400px,0.75fr)] lg:gap-8">
          <SpecificationsGrid specifications={specifications} />
          <div className="hidden lg:block">
            <InquiryForm carName={vehicleTitle} id="vehicle-inquiry-desktop" />
          </div>
        </div>
      </section>

      <section className="section-y-sm container-px mx-auto w-full max-w-7xl">
        <div className="min-w-0 space-y-8">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <SectionHeader title="Description" />
            <p className="mt-6 text-sm leading-7 text-foreground/75 sm:text-base">
              {car.description}
            </p>
          </div>

          <div className="lg:hidden">
            <InquiryForm carName={vehicleTitle} id="vehicle-inquiry-mobile" />
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section-y-sm bg-[var(--soft-grey)]">
          <div className="container-px mx-auto w-full max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                title="You may also like"
                description="Other vehicles with a close match in body style, budget, or specification."
              />
              <Link
                to="/cars"
                className="inline-flex text-sm font-semibold text-[var(--brand-accent)] transition hover:text-[var(--brand-accent-strong)]"
              >
                View all cars
              </Link>
            </div>
            <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((c) => (
                <SimilarVehicleCard key={c.id} car={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

function VehicleGallery({
  active,
  activeImage,
  hasMultipleImages,
  images,
  onPointerCancel,
  onPointerDown,
  onPointerEnd,
  onSelectImage,
  onShowNext,
  onShowPrevious,
  vehicleTitle,
}: {
  active: number;
  activeImage?: string;
  hasMultipleImages: boolean;
  images: string[];
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSelectImage: (index: number) => void;
  onShowNext: () => void;
  onShowPrevious: () => void;
  vehicleTitle: string;
}) {
  return (
    <div className="min-w-0">
      <div
        className="group relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-xl border border-white/70 bg-[var(--navy-deep)] shadow-[0_24px_70px_oklch(0.15_0.035_252_/_0.18)] lg:aspect-[16/10]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerCancel}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={`${vehicleTitle} photo ${active + 1}`}
            draggable={false}
            className="block h-full w-full object-contain transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/70">
            Vehicle photo coming soon
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={onShowPrevious}
              aria-label="View previous vehicle photo"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur transition hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent)] sm:left-5 sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onShowNext}
              aria-label="View next vehicle photo"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur transition hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent)] sm:right-5 sm:h-12 sm:w-12"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-4 right-4 z-10 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="premium-scrollbar mt-3 flex w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain rounded-xl border border-border/70 bg-card/90 p-2 shadow-sm sm:mt-4 sm:p-3">
          {images.map((src: string, i: number) => (
            <button
              key={src + i}
              type="button"
              onClick={() => onSelectImage(i)}
              aria-label={`View vehicle photo ${i + 1}`}
              className={`h-16 w-24 flex-none overflow-hidden rounded-lg border transition sm:h-20 sm:w-32 ${
                i === active
                  ? "border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)]/20"
                  : "border-border/80 opacity-75 hover:border-[var(--brand-accent)]/50 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleSummaryCard({
  car,
  onShare,
  subtitle,
  vehicleTitle,
}: {
  car: Car;
  onShare: () => void;
  subtitle: string;
  vehicleTitle: string;
}) {
  const generalWhatsAppUrl = getWhatsAppUrl(getInquiryMessage(vehicleTitle, "General inquiry"));
  const bookingWhatsAppUrl = getWhatsAppUrl(getInquiryMessage(vehicleTitle, "Book viewing"));
  const financingWhatsAppUrl = getWhatsAppUrl(getInquiryMessage(vehicleTitle, "Request financing"));

  return (
    <aside className="vehicle-summary-card flex min-w-0 flex-col rounded-xl border border-border/80 bg-card/95 p-5 shadow-[0_24px_70px_oklch(0.15_0.035_252_/_0.12)] backdrop-blur lg:ml-auto lg:w-full lg:max-w-[40rem] lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-[var(--brand-accent)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
          {car.availability}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--soft-grey)] px-3 py-1.5 text-xs font-semibold text-muted-foreground dark:bg-white/10">
          <VerifiedIcon className="h-3.5 w-3.5" />
          Verified
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-bold leading-tight tracking-normal text-foreground sm:text-3xl lg:text-4xl">
        {vehicleTitle.toUpperCase()}
      </h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <CarFront className="h-4 w-4 text-[var(--brand-accent)]" />
        {subtitle}
      </p>
      <p className="vehicle-price mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {formatPrice(car.price)}
      </p>

      <div className="mt-5 flex items-center gap-1.5 sm:gap-2 lg:mt-auto">
        <a
          href={site.phoneHref}
          aria-label="Call dealer"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[var(--navy-deep)] shadow-sm transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] dark:text-white sm:h-10 sm:w-10"
        >
          <Phone className="h-4 w-4" />
        </a>
        <a
          href={generalWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp dealer about ${vehicleTitle}`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm transition hover:scale-105 sm:h-10 sm:w-10"
        >
          <WhatsAppIcon className="h-7 w-7 rounded-full" />
        </a>
        <a
          href={bookingWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[var(--brand-accent)] px-2 text-[0.68rem] font-semibold text-white shadow-sm transition hover:bg-[var(--brand-accent-strong)] sm:flex-none sm:px-3 sm:text-xs"
        >
          <span className="sm:hidden">Book</span>
          <span className="hidden sm:inline">Book Viewing</span>
        </a>
        <a
          href={financingWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[var(--brand-accent)] bg-card px-2 text-[0.68rem] font-semibold text-[var(--brand-accent)] shadow-sm transition hover:bg-[var(--brand-accent)] hover:text-white sm:flex-none sm:px-3 sm:text-xs"
        >
          <span className="sm:hidden">Finance</span>
          <span className="hidden sm:inline">Request Financing</span>
        </a>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share vehicle"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] sm:h-10 sm:w-10"
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </button>
      </div>

      <div className="mt-6 flex gap-3 rounded-lg border border-[var(--brand-accent)]/20 bg-[var(--brand-accent-soft)]/55 p-4 text-sm text-foreground/80 dark:bg-white/5">
        <VerifiedIcon className="mt-0.5 h-5 w-5" />
        <span>
          Verified listing by Motorspace Kenya. Viewing, financing, and import support are
          available.
        </span>
      </div>
    </aside>
  );
}

function SpecificationsGrid({ specifications }: { specifications: Specification[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Specifications
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {specifications.map((item) => (
          <SpecCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

function SpecCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/80 bg-background/70 p-3.5">
      <dt className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function SimilarVehicleCard({ car }: { car: Car }) {
  const image = car.images[0];

  return (
    <Link
      to="/cars/$slug"
      params={{ slug: car.slug }}
      className="group flex min-w-0 gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)]/45 hover:shadow-md"
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-32">
        {image ? (
          <img
            src={image}
            alt={`${car.year} ${car.make} ${car.model}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--navy-deep)] text-white/70">
            <CarFront className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold leading-tight text-foreground">
              {car.make} {car.model}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {car.year} / {car.bodyType}
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-accent)]" />
        </div>

        <p className="vehicle-price mt-3 truncate text-sm font-extrabold">
          {formatPrice(car.price)}
        </p>
        <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <img src={locationIcon} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
          <span className="truncate">
            {car.location} / {car.transmission}
          </span>
        </p>
      </div>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function InquiryForm({ carName, id = "vehicle-inquiry" }: { carName: string; id?: string }) {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState(() => getInquiryMessage(carName, "General inquiry"));

  useEffect(() => {
    setMessage(getInquiryMessage(carName, "General inquiry"));
  }, [carName]);

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fullName = String(formData.get("fullName") ?? "").trim();
        const phone = String(formData.get("phone") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const preferredContact = String(formData.get("preferredContact") ?? "").trim();
        const details = [
          message,
          "",
          fullName ? `Name: ${fullName}` : "",
          phone ? `Phone: ${phone}` : "",
          email ? `Email: ${email}` : "",
          preferredContact ? `Preferred contact: ${preferredContact}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        window.open(getWhatsAppUrl(details), "_blank", "noopener,noreferrer");
        setSent(true);
      }}
      className="scroll-mt-28 h-fit min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-28 lg:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-accent)] dark:bg-white/10">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Inquire about this car</h3>
          <p className="mt-1 text-sm text-muted-foreground">Re: {carName}</p>
        </div>
      </div>

      {sent ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Your WhatsApp message has been prepared. Please send it in WhatsApp to complete the
          inquiry.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          <input name="fullName" required placeholder="Full name" className="form-control" />
          <input
            name="phone"
            required
            type="tel"
            placeholder="Phone number"
            className="form-control"
          />
          <input
            name="email"
            required
            type="email"
            placeholder="Email address"
            className="form-control"
          />
          <select name="preferredContact" className="form-control" defaultValue="WhatsApp">
            <option>WhatsApp</option>
            <option>Call</option>
            <option>Email</option>
          </select>
          <textarea
            rows={5}
            placeholder="Your message"
            className="form-textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className="btn-accent w-full">Send Inquiry</button>
        </div>
      )}
    </form>
  );
}

function formatEngineSize(engineSize: string) {
  return engineSize.replace(/(\d)\s*cc$/i, "$1 CC");
}

function getSimilarCars(inventory: Car[], currentCar: Car, limit: number) {
  return inventory
    .filter((candidate) => candidate.id !== currentCar.id)
    .map((candidate) => ({
      car: candidate,
      score: getSimilarityScore(candidate, currentCar),
      priceGap: Math.abs(candidate.price - currentCar.price),
    }))
    .sort((a, b) => b.score - a.score || a.priceGap - b.priceGap || b.car.year - a.car.year)
    .slice(0, limit)
    .map(({ car }) => car);
}

function getSimilarityScore(candidate: Car, currentCar: Car) {
  let score = 0;

  if (candidate.bodyType === currentCar.bodyType) score += 5;
  if (candidate.make === currentCar.make) score += 4;
  if (candidate.fuelType === currentCar.fuelType) score += 1;
  if (candidate.transmission === currentCar.transmission) score += 1;
  if (candidate.driveType === currentCar.driveType) score += 1;
  if (candidate.condition === currentCar.condition) score += 1;

  const yearGap = Math.abs(candidate.year - currentCar.year);
  if (yearGap <= 1) score += 2;
  else if (yearGap <= 3) score += 1;

  if (currentCar.price > 0) {
    const priceGapRatio = Math.abs(candidate.price - currentCar.price) / currentCar.price;
    if (priceGapRatio <= 0.15) score += 3;
    else if (priceGapRatio <= 0.3) score += 2;
    else if (priceGapRatio <= 0.5) score += 1;
  }

  return score;
}

function getInquiryMessage(carName: string, intent: InquiryIntent) {
  if (intent === "Book viewing") {
    return `Hello Motorspace Kenya, I would like to book a viewing for the ${carName}. Please share available viewing times and next steps.`;
  }

  if (intent === "Request financing") {
    return `Hello Motorspace Kenya, I would like financing guidance for the ${carName}. Please share available financing options and requirements.`;
  }

  return `Hello Motorspace Kenya, I am interested in the ${carName}. Please share availability, viewing details, and next steps.`;
}
