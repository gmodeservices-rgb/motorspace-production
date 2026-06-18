import { blogPosts as fallbackBlogPosts } from "@/data/site";
import { isSupabaseConfigured, requireSupabase, supabase } from "@/lib/supabase";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date_published: string;
  image: string;
  is_published: boolean;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  isPublished: boolean;
};

export type BlogPostDraft = Omit<BlogPost, "id">;

export const blogQueryKey = ["content", "blog-posts"] as const;

const blogSelect = `
  id,
  slug,
  title,
  category,
  excerpt,
  content,
  date_published,
  image,
  is_published
`;

function fallbackPosts(): BlogPost[] {
  return fallbackBlogPosts.map((post, index) => ({
    id: `fallback-${index + 1}`,
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    content: "",
    date: post.date,
    image: post.image,
    isPublished: true,
  }));
}

function rowToBlogPost(row: BlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    content: row.content,
    date: row.date_published,
    image: row.image,
    isPublished: row.is_published,
  };
}

function blogPostToRow(post: BlogPostDraft) {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    date_published: post.date,
    image: post.image,
    is_published: post.isPublished,
  };
}

function isMissingBlogTableError(message: string) {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("could not find the table") ||
    (lowerMessage.includes("blog_posts") && lowerMessage.includes("schema cache"))
  );
}

function getBlogSupabaseErrorMessage(message: string) {
  if (isMissingBlogTableError(message)) {
    return "Blog database is not ready. Run the updated supabase/schema.sql in Supabase SQL Editor, then refresh the admin dashboard. If you already ran it, wait a moment for Supabase to refresh its schema cache.";
  }

  return message;
}

function throwSupabaseError(message: string): never {
  throw new Error(getBlogSupabaseErrorMessage(message));
}

export async function fetchBlogPosts(options: { includeDrafts?: boolean } = {}) {
  if (!isSupabaseConfigured || !supabase) return fallbackPosts();

  let query = supabase
    .from("blog_posts")
    .select(blogSelect)
    .order("date_published", { ascending: false })
    .order("created_at", { ascending: false });

  if (!options.includeDrafts) query = query.eq("is_published", true);

  const { data, error } = await query;

  if (error) {
    if (!options.includeDrafts && isMissingBlogTableError(error.message)) return fallbackPosts();
    throwSupabaseError(error.message);
  }

  return ((data ?? []) as BlogRow[]).map(rowToBlogPost);
}

export async function createBlogPost(post: BlogPostDraft): Promise<BlogPost> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("blog_posts")
    .insert(blogPostToRow(post))
    .select(blogSelect)
    .single();

  if (error) throwSupabaseError(error.message);

  return rowToBlogPost(data as BlogRow);
}

export async function updateBlogPost(id: string, post: BlogPostDraft): Promise<BlogPost> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("blog_posts")
    .update(blogPostToRow(post))
    .eq("id", id)
    .select(blogSelect)
    .single();

  if (error) throwSupabaseError(error.message);

  return rowToBlogPost(data as BlogRow);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("blog_posts").delete().eq("id", id);

  if (error) throwSupabaseError(error.message);
}

export function makeBlogSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
