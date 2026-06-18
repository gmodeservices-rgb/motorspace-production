import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { faqs } from "@/data/site";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | motorspaceKenya" },
      {
        name: "description",
        content:
          "Answers to common questions about car sales, imports, financing, and delivery at motorspaceKenya.",
      },
      { property: "og:title", content: "FAQ | motorspaceKenya" },
      { property: "og:description", content: "Frequently asked questions." },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Layout>
      <PageHero
        eyebrow="Help"
        title="Frequently Asked Questions"
        description="Quick answers to the questions our customers ask most."
      />
      <section className="section-y-sm container-px mx-auto max-w-3xl">
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="surface-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                >
                  <span className="font-semibold">{f.q}</span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 text-[var(--brand-accent)]" />
                  ) : (
                    <Plus className="h-5 w-5 text-[var(--brand-accent)]" />
                  )}
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5 sm:pb-5 sm:text-base">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
