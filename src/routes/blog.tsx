import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useBlogPosts, useBlogRealtime } from "@/hooks/use-blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Car Buying Guides | motorspaceKenya" },
      {
        name: "description",
        content: "Insights, tips and guides on buying, selling and importing cars in Kenya.",
      },
      { property: "og:title", content: "Blog | motorspaceKenya" },
      { property: "og:description", content: "Automotive insights for Kenyan buyers." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const [openPostSlug, setOpenPostSlug] = useState<string | null>(null);
  const postsQuery = useBlogPosts();
  useBlogRealtime();

  const blogPosts = postsQuery.data ?? [];

  return (
    <Layout>
      <PageHero
        eyebrow="Insights"
        title="Car Buying Guides & News"
        description="Practical, well-researched content to help you make smarter automotive decisions."
      />
      <section className="section-y-sm container-px mx-auto max-w-7xl">
        {postsQuery.isLoading ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            Loading latest articles...
          </div>
        ) : postsQuery.isError ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            Could not load the latest articles right now.
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            No blog posts have been published yet.
          </div>
        ) : (
          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="surface-card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/10]">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase text-[var(--brand-accent)]">
                    {post.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-tight">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  {openPostSlug === post.slug && post.content ? (
                    <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm leading-relaxed text-foreground/80">
                      {post.content
                        .split(/\n{2,}/)
                        .map((paragraph) => paragraph.trim())
                        .filter(Boolean)
                        .map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{post.date}</span>
                    {post.content ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenPostSlug((current) => (current === post.slug ? null : post.slug))
                        }
                        className="inline-flex items-center gap-1 font-semibold text-foreground transition hover:text-[var(--brand-accent)]"
                      >
                        {openPostSlug === post.slug ? "Show less" : "Read more"}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
