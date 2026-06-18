import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { VerifiedIcon } from "@/components/VerifiedIcon";
import customerCareIcon from "@/assets/Customer Care.png";
import qualityIcon from "@/assets/Quality.png";
import trustIcon from "@/assets/Trust.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | motorspaceKenya" },
      {
        name: "description",
        content:
          "motorspaceKenya is a modern car dealership focused on transparent buying, selling, and importing of quality vehicles across Kenya.",
      },
      { property: "og:title", content: "About | motorspaceKenya" },
      { property: "og:description", content: "Learn about our mission, vision, and values." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Layout>
      <PageHero
        eyebrow="About Us"
        title="A trusted partner for buying, selling and importing cars"
        description="motorspaceKenya helps customers access quality vehicles with transparency, care, and reliability."
      />
      <section className="section-y container-px mx-auto max-w-5xl">
        <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
          At motorspaceKenya, we believe buying a car should feel exciting, transparent, and secure.
          Our platform is designed to help customers access quality cars, compare options, request
          imports, and connect with a reliable automotive team.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Card
            title="Our Mission"
            body="To make car buying and vehicle importation in Kenya simpler, safer, and more transparent."
          />
          <Card
            title="Our Vision"
            body="To become one of Kenya's most trusted automotive platforms for quality local and imported vehicles."
          />
        </div>
      </section>
      <section className="section-y bg-[var(--soft-grey)]">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader center eyebrow="Values" title="What we stand for" />
          <div className="mt-12 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: VerifiedIcon, t: "Transparency" },
              { image: trustIcon, t: "Trust" },
              { image: qualityIcon, t: "Quality" },
              { image: customerCareIcon, t: "Customer Care" },
            ].map((v) => (
              <div key={v.t} className="surface-card p-6 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center">
                  {"icon" in v ? (
                    <v.icon className="h-10 w-10" />
                  ) : (
                    <img src={v.image} alt="" className="h-10 w-10 object-contain" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{v.t}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-y container-px mx-auto max-w-7xl text-center">
        <SectionHeader center eyebrow="Get in touch" title="Ready to drive home your next car?" />
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/cars" className="btn-navy w-full sm:w-auto">
            Browse Cars
          </Link>
          <Link to="/contact" className="btn-outline-accent w-full sm:w-auto">
            Contact Us
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-card p-5 sm:p-8">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}
