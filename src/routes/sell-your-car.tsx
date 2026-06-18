import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/sell-your-car")({
  head: () => ({
    meta: [
      { title: "Sell Your Car | motorspaceKenya" },
      {
        name: "description",
        content:
          "Sell your car with motorspaceKenya. Submit your vehicle details and our team will help you list, sell, or trade.",
      },
      { property: "og:title", content: "Sell Your Car | motorspaceKenya" },
      {
        property: "og:description",
        content: "Submit your vehicle to list, sell or trade with motorspaceKenya.",
      },
    ],
  }),
  component: SellCar,
});

function SellCar() {
  return (
    <Layout>
      <PageHero
        eyebrow="Sell"
        title="Sell Your Car with motorspaceKenya"
        description="Submit your vehicle details and our team will review your car for listing, purchase, or customer matching."
      />

      <section className="section-y-sm bg-[var(--soft-grey)]">
        <div className="container-px mx-auto grid max-w-7xl auto-rows-fr gap-6 sm:grid-cols-3">
          {[
            ["01", "Submit Vehicle Details", "Share your car info and photos."],
            ["02", "Get Reviewed by Our Team", "We assess condition and market value."],
            ["03", "Receive an Offer or Listing Support", "Sell directly or list on our platform."],
          ].map(([n, t, d]) => (
            <div key={n} className="surface-card p-5 sm:p-6">
              <span className="text-4xl font-bold text-[var(--brand-accent)]/30">{n}</span>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-y container-px mx-auto max-w-4xl">
        <SectionHeader center eyebrow="List your vehicle" title="Vehicle Submission" />
        <SellForm />
      </section>
    </Layout>
  );
}

function SellForm() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <p className="mt-10 rounded-xl bg-green-50 p-5 text-center text-green-800 sm:p-8">
        Thank you for sharing your vehicle details. We have received your submission and our team
        will contact you shortly.
      </p>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="surface-card mt-10 grid gap-4 p-5 sm:grid-cols-2 sm:p-8"
    >
      <input required placeholder="Full name" className="form-control" />
      <input required type="tel" placeholder="Phone number" className="form-control" />
      <input required type="email" placeholder="Email" className="form-control sm:col-span-2" />
      <input required placeholder="Car make" className="form-control" />
      <input required placeholder="Car model" className="form-control" />
      <input required type="number" placeholder="Year" className="form-control" />
      <input required type="number" placeholder="Mileage (km)" className="form-control" />
      <select className="form-control">
        <option>Automatic</option>
        <option>Manual</option>
      </select>
      <select className="form-control">
        <option>Petrol</option>
        <option>Diesel</option>
        <option>Hybrid</option>
        <option>Electric</option>
      </select>
      <input placeholder="Engine size (e.g. 2000cc)" className="form-control" />
      <input required type="number" placeholder="Asking price (KES)" className="form-control" />
      <input required placeholder="Location" className="form-control" />
      <select className="form-control sm:col-span-2">
        <option>Excellent</option>
        <option>Good</option>
        <option>Fair</option>
      </select>
      <input
        type="file"
        accept="image/*"
        multiple
        className="form-control file:mr-3 file:rounded-full file:border-0 file:bg-[var(--navy-deep)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white sm:col-span-2"
      />
      <textarea rows={4} placeholder="Additional details" className="form-textarea sm:col-span-2" />
      <button className="btn-navy w-full sm:col-span-2">Submit Vehicle</button>
    </form>
  );
}
