import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Globe2, Truck, Search, ArrowRight, Star, Sparkles } from "lucide-react";
import heroCar1 from "@/assets/hero-car 1.png";
import heroCar2 from "@/assets/hero-car 2.png";
import heroCar3 from "@/assets/hero-car 3.png";
import verifiedCarsIcon from "@/assets/verified.png";
import flexibleSourcingIcon from "@/assets/Flexible Sourcing.png";
import importAssistanceIcon from "@/assets/import Assistance .jpg";
import kenyaDeliveryIcon from "@/assets/kenya-wide Delivery.png";
import reliableCustomerSupportIcon from "@/assets/Reliable Customer Support.png";
import smoothImportProcessIcon from "@/assets/Smooth Import Process.jpg";
import transparentPricingIcon from "@/assets/Transparent Pricing.jpg";
import { Layout } from "@/components/Layout";
import { SectionHeader } from "@/components/SectionHeader";
import { CarCard } from "@/components/CarCard";
import { VerifiedIcon } from "@/components/VerifiedIcon";
import { useCars, useInventoryRealtime } from "@/hooks/use-inventory";
import { testimonials, categories } from "@/data/site";

const heroImages = [
  { src: heroCar1, alt: "Premium car featured by motorspaceKenya" },
  { src: heroCar2, alt: "Luxury vehicle available through motorspaceKenya" },
  { src: heroCar3, alt: "Performance car showcased by motorspaceKenya" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "motorspaceKenya | Premium Car Sales & Imports in Kenya" },
      {
        name: "description",
        content:
          "Buy, sell, and import quality vehicles with motorspaceKenya. Explore premium car listings, import services, and trusted automotive support in Kenya.",
      },
      { property: "og:title", content: "motorspaceKenya | Premium Car Sales & Imports in Kenya" },
      {
        property: "og:description",
        content: "Premium car sales and seamless vehicle importation services across Kenya.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const carsQuery = useCars();
  useInventoryRealtime();
  const [heroIndex, setHeroIndex] = useState(0);
  const inventory = carsQuery.data ?? [];
  const featuredCars = inventory.filter((car) => car.isFeatured).slice(0, 6);
  const searchMakes = useMemo(
    () => Array.from(new Set(inventory.map((car) => car.make))).sort(),
    [inventory],
  );
  const searchBodies = useMemo(
    () => Array.from(new Set(inventory.map((car) => car.bodyType))).sort(),
    [inventory],
  );
  const searchFuels = useMemo(
    () => Array.from(new Set(inventory.map((car) => car.fuelType))).sort(),
    [inventory],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[var(--navy-deep)] text-white">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={1920}
              height={1080}
              loading={index === 0 ? "eager" : "lazy"}
              aria-hidden={index !== heroIndex}
              className="absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-1000 ease-out sm:object-cover"
              style={{ opacity: index === heroIndex ? 0.72 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/32 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,_oklch(0.63_0.21_252_/_0.08),_transparent_34%)]" />
        </div>
        <div className="container-px relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col justify-between gap-10 pb-16 pt-3 sm:min-h-[calc(100svh-5.5rem)] sm:pb-24 sm:pt-5 lg:pb-28 lg:pt-6">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[var(--brand-accent)]/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase text-[var(--brand-accent)]">
              <Sparkles className="h-3.5 w-3.5" /> Premium Cars / Trusted Imports
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Drive Your Dream Car with{" "}
              <span className="text-[var(--brand-accent)]">motorspaceKenya</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
              Premium car sales and seamless vehicle importation services across Kenya.
            </p>
          </div>
          <div className="max-w-3xl">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                to="/cars"
                className="btn-accent w-full whitespace-nowrap !min-h-9 !gap-1.5 !px-3 !py-2 !text-xs sm:w-auto sm:!min-h-11 sm:!gap-2 sm:!px-6 sm:!py-3 sm:!text-sm"
              >
                <span className="sm:hidden">Available Cars</span>
                <span className="hidden sm:inline">View Available Cars</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
              <Link
                to="/import-services"
                className="btn-outline-accent w-full whitespace-nowrap !min-h-9 !gap-1.5 !px-3 !py-2 !text-xs sm:w-auto sm:!min-h-11 sm:!gap-2 sm:!px-6 sm:!py-3 sm:!text-sm"
              >
                Import a Car
              </Link>
            </div>
            <div className="mt-8 flex justify-center sm:mt-10">
              <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:mt-2 sm:grid-cols-4 sm:gap-4">
                {[
                  { src: verifiedCarsIcon, label: "Verified Cars" },
                  { src: flexibleSourcingIcon, label: "Flexible Sourcing" },
                  { src: importAssistanceIcon, label: "Import Assistance" },
                  { src: kenyaDeliveryIcon, label: "Kenya-Wide Delivery" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex flex-col items-center gap-2 text-center text-xs sm:flex-row sm:gap-3 sm:text-sm"
                  >
                    <img
                      src={b.src}
                      alt={b.label}
                      className="h-7 w-7 flex-shrink-0 rounded sm:h-6 sm:w-6"
                    />
                    <span className="text-white/85">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH PANEL */}
      <section className="relative -mt-6 px-4 pb-2 sm:-mt-10">
        <div className="mx-auto max-w-6xl rounded-xl border border-border bg-card p-4 shadow-2xl sm:p-6">
          <form action="/cars" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <select name="make" className="form-control">
              <option>Any Make</option>
              {searchMakes.map((make) => (
                <option key={make}>{make}</option>
              ))}
            </select>
            <input name="model" placeholder="Model" className="form-control" />
            <input name="year" placeholder="Year" className="form-control" />
            <input name="price" placeholder="Max Price (KES)" className="form-control" />
            <select name="body" className="form-control">
              <option>Any Body</option>
              {searchBodies.map((body) => (
                <option key={body}>{body}</option>
              ))}
            </select>
            <select name="fuel" className="form-control">
              <option>Any Fuel</option>
              {searchFuels.map((fuel) => (
                <option key={fuel}>{fuel}</option>
              ))}
            </select>
            <button className="btn-accent w-full">
              <Search className="h-4 w-4" /> Search
            </button>
          </form>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section-y container-px mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <SectionHeader title="Featured Vehicles" />
          <Link
            to="/cars"
            className="hidden items-center gap-1 text-sm font-semibold text-foreground transition hover:text-[var(--brand-accent)] sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCars.length > 0 ? (
            featuredCars.map((c) => <CarCard key={c.id} car={c} />)
          ) : (
            <div className="vehicle-neon-outline rounded-xl border border-dashed p-10 text-sm text-muted-foreground lg:col-span-3">
              No featured vehicles yet. Mark cars as featured from the admin dashboard.
            </div>
          )}
        </div>
      </section>

      {/* WHY */}
      <section className="section-y bg-[var(--soft-grey)]">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader
            center
            eyebrow="Why Choose Us"
            title="Built for buyers who expect more"
            description="Quality, transparency, and end-to-end support on every vehicle we offer."
          />
          <div className="mt-10 grid auto-rows-fr gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <VerifiedIcon className="h-9 w-9" />,
                title: "Verified Vehicle Listings",
                desc: "Every car is inspected and verified before going live.",
              },
              {
                icon: <FeatureImageIcon src={smoothImportProcessIcon} />,
                title: "Smooth Import Process",
                desc: "From sourcing to clearance - handled end-to-end.",
              },
              {
                icon: <FeatureImageIcon src={transparentPricingIcon} />,
                title: "Transparent Pricing",
                desc: "No hidden fees. Clear quotations every time.",
              },
              {
                icon: <FeatureImageIcon src={reliableCustomerSupportIcon} fit="contain" />,
                title: "Reliable Customer Support",
                desc: "A team that stays with you long after the sale.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="surface-card p-5 transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[var(--navy-deep)] text-[var(--brand-accent)]">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORT STEPS */}
      <section className="section-y container-px mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Import Services"
          title="How Our Import Process Works"
          description="A simple, transparent four-step journey from your dream car overseas to your driveway in Kenya."
        />
        <div className="mt-10 grid auto-rows-fr gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Choose Your Car",
            "Get a Quote",
            "We Handle Importation",
            "Receive Your Vehicle in Kenya",
          ].map((step, i) => (
            <div key={step} className="surface-card relative p-5 sm:p-6">
              <span className="text-5xl font-bold text-[var(--brand-accent)]/30">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{step}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Professional guidance at every stage of the process.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link to="/import-services" className="btn-navy">
            Start Import Request
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-y bg-[var(--navy-deep)] text-white">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader light center eyebrow="Browse" title="Popular Categories" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                to="/cars"
                className="rounded-lg border border-white/10 bg-white/5 p-5 text-center text-sm font-medium transition hover:border-[var(--brand-accent)] hover:bg-white/10 hover:text-[var(--brand-accent)]"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section-y container-px mx-auto max-w-7xl">
        <div className="grid gap-8 rounded-xl bg-[var(--navy-deep)] p-6 text-white sm:grid-cols-2 sm:p-8 lg:grid-cols-4 lg:p-10">
          {[
            ["500+", "Cars Sourced"],
            ["98%", "Customer Satisfaction"],
            ["10+", "Import Markets"],
            ["47", "Counties Served"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-4xl font-bold text-[var(--brand-accent)]">{n}</p>
              <p className="mt-2 text-sm text-white/70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-y bg-[var(--soft-grey)]">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader center title="Loved by drivers across Kenya" />
          <div className="mt-10 grid auto-rows-fr gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <figure key={t.name} className="surface-card p-5 sm:p-6">
                <div className="flex gap-1 text-[var(--brand-accent)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-muted-foreground">{t.location}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section-y container-px mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-xl bg-[var(--navy-deep)] p-6 text-white sm:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_oklch(0.63_0.21_252_/_0.24),_transparent_55%)]" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-bold sm:text-4xl">Looking for a specific car?</h2>
              <p className="mt-3 max-w-xl text-white/75">
                Tell us what you want and we'll help you source it - locally or from overseas.
              </p>
            </div>
            <Link to="/import-services" className="btn-accent w-full sm:w-fit">
              Request a Car
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureImageIcon({ src, fit = "cover" }: { src: string; fit?: "contain" | "cover" }) {
  return (
    <img
      src={src}
      alt=""
      className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
    />
  );
}
