import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getWhatsAppUrl, whatsappMessages } from "@/data/site";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/import-services")({
  head: () => ({
    meta: [
      { title: "Import Services | motorspaceKenya" },
      {
        name: "description",
        content:
          "Import your ideal car with confidence. We handle sourcing, shipping, clearance, registration, and delivery across Kenya.",
      },
      { property: "og:title", content: "Import Services | motorspaceKenya" },
      {
        property: "og:description",
        content: "Seamless vehicle importation from Japan, UK, Singapore, Thailand and more.",
      },
    ],
  }),
  component: ImportServices,
});

const services = [
  "Vehicle sourcing",
  "Auction support",
  "CIF quotation",
  "Shipping arrangements",
  "Duty estimation",
  "Port clearance guidance",
  "Registration support",
  "Delivery assistance",
];

const steps = [
  ["Consultation", "Share your needs and budget."],
  ["Vehicle Selection", "We shortlist the best matches."],
  ["Quotation & Payment Guidance", "Clear CIF and landing cost breakdown."],
  ["Purchase Confirmation", "Secure your chosen vehicle."],
  ["Shipping", "Reliable freight to Mombasa."],
  ["Port Clearance", "KRA and KPA paperwork handled."],
  ["Registration", "NTSA registration and plates."],
  ["Delivery", "Doorstep delivery in Kenya."],
];

function ImportServices() {
  return (
    <Layout>
      <PageHero
        eyebrow="Imports"
        title="Import Your Ideal Car with Confidence"
        description="From sourcing to shipping, clearance, registration, and delivery - motorspaceKenya guides you through the entire process."
      >
        <a
          href={getWhatsAppUrl(whatsappMessages.importRequest)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent w-full sm:w-auto"
        >
          <WhatsAppIcon className="h-5 w-5 rounded-full" /> Start on WhatsApp
        </a>
      </PageHero>

      <section className="section-y container-px mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="What we handle"
          title="End-to-end import support"
          description="We help with every step of the import journey so nothing falls through the cracks."
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <li key={s} className="surface-card flex items-center gap-2 p-4 text-sm sm:p-5">
              <CheckCircle2 className="h-5 w-5 text-[var(--brand-accent)]" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="section-y bg-[var(--soft-grey)]">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader eyebrow="Process" title="A clear, predictable timeline" />
          <ol className="mt-12 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], i) => (
              <li key={t} className="surface-card p-5 sm:p-6">
                <span className="text-4xl font-bold text-[var(--brand-accent)]/30">0{i + 1}</span>
                <h3 className="mt-2 text-base font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-y container-px mx-auto max-w-4xl">
        <SectionHeader
          center
          eyebrow="Get Started"
          title="Import Request Form"
          description="Tell us about your dream car - we'll respond with a quotation and next steps."
        />
        <ImportForm />
      </section>
    </Layout>
  );
}

function ImportForm() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <p className="mt-10 rounded-xl bg-green-50 p-5 text-center text-green-800 sm:p-8">
        Thank you for your import request. We have received your details and our team will contact
        you shortly with the next steps.
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
      <input required placeholder="Preferred make" className="form-control" />
      <input required placeholder="Preferred model" className="form-control" />
      <input placeholder="Year range (e.g. 2018-2021)" className="form-control" />
      <input required type="number" placeholder="Budget (KES)" className="form-control" />
      <select className="form-control">
        <option>Japan</option>
        <option>UK</option>
        <option>Singapore</option>
        <option>Thailand</option>
        <option>Other</option>
      </select>
      <select className="form-control">
        <option>Automatic</option>
        <option>Manual</option>
      </select>
      <select className="form-control sm:col-span-2">
        <option>Petrol</option>
        <option>Diesel</option>
        <option>Hybrid</option>
        <option>Electric</option>
      </select>
      <textarea rows={4} placeholder="Additional details" className="form-textarea sm:col-span-2" />
      <button className="btn-navy w-full sm:col-span-2">Submit Import Request</button>
    </form>
  );
}
