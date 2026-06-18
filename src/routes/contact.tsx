import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import businessHoursIcon from "@/assets/Business Hours.png";
import emailIcon from "@/assets/email.png";
import facebookIcon from "@/assets/facebook.png";
import instagramIcon from "@/assets/instagram.png";
import locationIcon from "@/assets/location.png";
import tiktokIcon from "@/assets/tiktok.png";
import { getWhatsAppUrl, site } from "@/data/site";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | motorspaceKenya" },
      {
        name: "description",
        content:
          "Get in touch with motorspaceKenya for car inquiries, imports, viewings, and customer support.",
      },
      { property: "og:title", content: "Contact | motorspaceKenya" },
      { property: "og:description", content: "Reach our team in Nairobi, Kenya." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const socialLinks = [
    {
      href: site.socials.instagram,
      label: "Instagram",
      icon: instagramIcon,
    },
    {
      href: site.socials.facebook,
      label: "Facebook",
      icon: facebookIcon,
    },
    {
      href: site.socials.tiktok,
      label: "TikTok",
      icon: tiktokIcon,
    },
  ].filter((item) => item.href);

  return (
    <Layout>
      <PageHero
        eyebrow="Contact"
        title="Let's talk cars"
        description="Our team is ready to help with sales, imports, viewings, and after-sales support."
      />
      <section className="section-y-sm container-px mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            {[
              {
                icon: <Phone className="h-5 w-5" />,
                t: "Call",
                v: site.phone,
                href: site.phoneHref,
              },
              {
                icon: <WhatsAppIcon className="h-12 w-12" />,
                t: "WhatsApp",
                v: site.whatsapp,
                href: getWhatsAppUrl(),
                external: true,
              },
              {
                icon: <img src={emailIcon} alt="" className="h-5 w-5 object-contain" />,
                t: "Email",
                v: site.email,
                href: `mailto:${site.email}`,
              },
              {
                icon: <img src={locationIcon} alt="" className="h-5 w-5 object-contain" />,
                t: "Location",
                v: site.location,
              },
              {
                icon: <img src={businessHoursIcon} alt="" className="h-10 w-10 object-contain" />,
                t: "Business Hours",
                v: "Mon-Fri 8:30AM-6:00PM, Sat 9:00AM-4:00PM, Sun by appointment",
              },
            ].map((c) => (
              <div key={c.t} className="surface-card flex gap-4 p-4 sm:p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-transparent text-[var(--brand-accent)]">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{c.t}</p>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noopener noreferrer" : undefined}
                      className="mt-1 inline-flex text-sm text-muted-foreground transition hover:text-[var(--brand-accent)]"
                    >
                      {c.v}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{c.v}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="surface-card p-4 sm:p-5">
              <p className="text-sm font-semibold">Follow motorspaceKenya</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                  >
                    <img src={item.icon} alt="" className="h-4 w-4 object-contain" />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Map"
                className="h-64 w-full sm:h-72"
                loading="lazy"
                src="https://www.google.com/maps?q=Nairobi,Kenya&output=embed"
              />
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </Layout>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="rounded-xl bg-green-50 p-5 text-green-800 sm:p-8">
        Thank you for reaching out. We have received your message and our team will contact you
        shortly.
      </div>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="surface-card grid gap-4 p-5 sm:p-8"
    >
      <h3 className="text-xl font-bold">Send us a message</h3>
      <input required placeholder="Full name" className="form-control" />
      <div className="grid gap-4 sm:grid-cols-2">
        <input required type="tel" placeholder="Phone" className="form-control" />
        <input required type="email" placeholder="Email" className="form-control" />
      </div>
      <input placeholder="Subject" className="form-control" />
      <textarea required rows={6} placeholder="Your message" className="form-textarea" />
      <button className="btn-navy w-full sm:w-auto">Send Message</button>
    </form>
  );
}
