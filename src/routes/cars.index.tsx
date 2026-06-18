import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CarCard } from "@/components/CarCard";
import { useCars, useInventoryRealtime } from "@/hooks/use-inventory";
import type { Car } from "@/data/cars";
import { Search } from "lucide-react";

const EMPTY_CARS: Car[] = [];

export const Route = createFileRoute("/cars/")({
  head: () => ({
    meta: [
      { title: "Available Cars | motorspaceKenya" },
      {
        name: "description",
        content:
          "Browse the full inventory of premium cars available at motorspaceKenya. Filter by make, model, year and more.",
      },
      { property: "og:title", content: "Available Cars | motorspaceKenya" },
      { property: "og:description", content: "Browse premium cars for sale in Kenya." },
    ],
  }),
  component: CarsIndex,
});

function CarsIndex() {
  const carsQuery = useCars();
  useInventoryRealtime();

  const [q, setQ] = useState("");
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [fuel, setFuel] = useState("");
  const [trans, setTrans] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("latest");
  const inventory = carsQuery.data ?? EMPTY_CARS;

  const filtered = useMemo(() => {
    let list = inventory.filter((c) => {
      if (q && !`${c.make} ${c.model}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (make && c.make !== make) return false;
      if (body && c.bodyType !== body) return false;
      if (fuel && c.fuelType !== fuel) return false;
      if (trans && c.transmission !== trans) return false;
      if (maxPrice && c.price > Number(maxPrice)) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "year-desc":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      case "mileage-asc":
        list = [...list].sort((a, b) => a.mileage - b.mileage);
        break;
      default:
        list = [...list].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    }
    return list;
  }, [inventory, q, make, body, fuel, trans, maxPrice, sort]);

  const makes = useMemo(
    () => Array.from(new Set(inventory.map((c) => c.make))).sort(),
    [inventory],
  );
  const bodies = useMemo(
    () => Array.from(new Set(inventory.map((c) => c.bodyType))).sort(),
    [inventory],
  );
  const fuels = useMemo(
    () => Array.from(new Set(inventory.map((c) => c.fuelType))).sort(),
    [inventory],
  );

  return (
    <Layout>
      <PageHero
        eyebrow="Inventory"
        title="Available Cars"
        description="Explore our curated collection of premium local and imported vehicles."
      />
      <section className="section-y-sm container-px mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="surface-card space-y-5 p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-sm font-semibold uppercase">Filters</h3>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search make or model"
                className="form-control pl-10"
              />
            </div>
            <Field label="Make">
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="form-control"
              >
                <option value="">All</option>
                {makes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Body Type">
              <select
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="form-control"
              >
                <option value="">All</option>
                {bodies.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Fuel">
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                className="form-control"
              >
                <option value="">All</option>
                {fuels.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Transmission">
              <select
                value={trans}
                onChange={(e) => setTrans(e.target.value)}
                className="form-control"
              >
                <option value="">All</option>
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </Field>
            <Field label="Max Price (KES)">
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                type="number"
                placeholder="e.g. 5000000"
                className="form-control"
              />
            </Field>
            <button
              onClick={() => {
                setQ("");
                setMake("");
                setBody("");
                setFuel("");
                setTrans("");
                setMaxPrice("");
              }}
              className="min-h-11 w-full rounded-full border border-input px-4 py-2 text-sm font-medium transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
            >
              Reset Filters
            </button>
          </aside>
          <div>
            <div className="mb-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                {filtered.length} vehicles found
                {carsQuery.isFetching ? " - Updating live inventory..." : ""}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="form-control sm:w-auto"
              >
                <option value="latest">Latest arrivals</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="year-desc">Year: newest first</option>
                <option value="mileage-asc">Mileage: lowest first</option>
              </select>
            </div>
            {filtered.length === 0 ? (
              <div className="vehicle-neon-outline rounded-xl border border-dashed p-8 text-center sm:p-16">
                <p className="text-lg font-semibold">No vehicles match your filters</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try widening your search criteria.
                </p>
              </div>
            ) : (
              <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
