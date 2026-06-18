import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import {
  CarFront,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  LogOut,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { formatPrice, getUsageBadge } from "@/components/CarCard";
import type { Car } from "@/data/cars";
import { useBlogPosts, useBlogRealtime } from "@/hooks/use-blog";
import { useCars, useInventoryRealtime } from "@/hooks/use-inventory";
import {
  blogQueryKey,
  createBlogPost,
  deleteBlogPost,
  makeBlogSlug,
  updateBlogPost,
  type BlogPost,
  type BlogPostDraft,
} from "@/lib/blog";
import {
  createCar,
  deleteCar,
  inventoryQueryKey,
  makeCarSlug,
  updateCar,
  type CarDraft,
} from "@/lib/inventory";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type CarFormState = {
  slug: string;
  make: string;
  model: string;
  year: string;
  price: string;
  currency: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  engineSize: string;
  bodyType: string;
  driveType: string;
  exteriorColor: string;
  interiorColor: string;
  condition: string;
  location: string;
  availability: Car["availability"];
  isFeatured: boolean;
  imagesText: string;
  featuresText: string;
  description: string;
  dateAdded: string;
};

type BlogFormState = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  isPublished: boolean;
};

const EMPTY_CARS: Car[] = [];
const EMPTY_BLOG_POSTS: BlogPost[] = [];
const CAR_IMAGES_BUCKET = "car-images";
const BLOG_IMAGES_BUCKET = "blog-images";
const ADMIN_TAB_INACTIVE_LOGOUT_MS = 10 * 60 * 1000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Inventory Admin | motorspaceKenya" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
      if (!data.session) void navigate({ to: "/admin/login" });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) void navigate({ to: "/admin/login" });
    });

    return () => data.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session || !supabase || typeof document === "undefined") return;

    let hiddenAt = document.visibilityState === "hidden" ? Date.now() : 0;
    let logoutTimer: number | undefined;

    const clearLogoutTimer = () => {
      if (logoutTimer) window.clearTimeout(logoutTimer);
      logoutTimer = undefined;
    };

    const logoutForInactiveTab = () => {
      clearLogoutTimer();
      void supabase.auth.signOut().finally(() => {
        void navigate({ to: "/admin/login" });
      });
    };

    const scheduleLogout = () => {
      clearLogoutTimer();
      if (!hiddenAt) return;

      const remaining = ADMIN_TAB_INACTIVE_LOGOUT_MS - (Date.now() - hiddenAt);
      if (remaining <= 0) {
        logoutForInactiveTab();
        return;
      }

      logoutTimer = window.setTimeout(logoutForInactiveTab, remaining);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        scheduleLogout();
        return;
      }

      if (hiddenAt && Date.now() - hiddenAt >= ADMIN_TAB_INACTIVE_LOGOUT_MS) {
        logoutForInactiveTab();
        return;
      }

      hiddenAt = 0;
      clearLogoutTimer();
    };

    scheduleLogout();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearLogoutTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate, session]);

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (authLoading) return <CenteredNotice title="Checking session..." />;
  if (!session) return <CenteredNotice title="Redirecting to login..." />;

  return <DashboardContent session={session} />;
}

function DashboardContent({ session }: { session: Session }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const carsQuery = useCars();
  const blogQuery = useBlogPosts({ includeDrafts: true, placeholderData: false });
  useInventoryRealtime();
  useBlogRealtime();

  const inventory = carsQuery.data ?? EMPTY_CARS;
  const blogPosts = blogQuery.data ?? EMPTY_BLOG_POSTS;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Car["availability"]>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CarFormState>(() => emptyForm());
  const [formError, setFormError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"All" | "Published" | "Draft">("All");
  const [blogEditingId, setBlogEditingId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<BlogFormState>(() => emptyBlogForm());
  const [blogFormError, setBlogFormError] = useState("");
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
  const [printGeneratedAt, setPrintGeneratedAt] = useState(() => new Date());
  const imageUrls = useMemo(() => splitLines(form.imagesText), [form.imagesText]);

  const stats = useMemo(() => {
    return {
      total: inventory.length,
      available: inventory.filter((car) => car.availability === "Available").length,
      comingSoon: inventory.filter((car) => car.availability === "Coming Soon").length,
      sold: inventory.filter((car) => car.availability === "Sold").length,
      featured: inventory.filter((car) => car.isFeatured).length,
    };
  }, [inventory]);

  const visibleCars = useMemo(() => {
    const term = search.trim().toLowerCase();
    return inventory.filter((car) => {
      const matchesStatus = statusFilter === "All" || car.availability === statusFilter;
      const matchesSearch =
        !term ||
        `${car.make} ${car.model} ${car.year} ${car.location}`.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [inventory, search, statusFilter]);

  const visibleBlogPosts = useMemo(() => {
    const term = blogSearch.trim().toLowerCase();
    return blogPosts.filter((post) => {
      const matchesStatus =
        blogStatusFilter === "All" ||
        (blogStatusFilter === "Published" ? post.isPublished : !post.isPublished);
      const matchesSearch =
        !term ||
        `${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [blogPosts, blogSearch, blogStatusFilter]);

  const saveMutation = useMutation({
    mutationFn: (draft: CarDraft) => {
      if (editingId) return updateCar(editingId, draft);
      return createCar(draft);
    },
    onSuccess: () => {
      setForm(emptyForm());
      setEditingId(null);
      setFormError("");
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
    },
  });

  const saveBlogMutation = useMutation({
    mutationFn: (draft: BlogPostDraft) => {
      if (blogEditingId) return updateBlogPost(blogEditingId, draft);
      return createBlogPost(draft);
    },
    onSuccess: () => {
      setBlogForm(emptyBlogForm());
      setBlogEditingId(null);
      setBlogFormError("");
      void queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });

  async function handleLogout() {
    await supabase?.auth.signOut();
    void navigate({ to: "/admin/login" });
  }

  function startEdit(car: Car) {
    setEditingId(car.id);
    setForm(carToForm(car));
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      saveMutation.mutate(formToDraft(form));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Check the vehicle details.");
    }
  }

  function handleDelete(car: Car) {
    if (!window.confirm(`Delete ${car.year} ${car.make} ${car.model}?`)) return;
    deleteMutation.mutate(car.id);
  }

  function startEditBlog(post: BlogPost) {
    setBlogEditingId(post.id);
    setBlogForm(blogPostToForm(post));
    setBlogFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetBlogForm() {
    setBlogEditingId(null);
    setBlogForm(emptyBlogForm());
    setBlogFormError("");
  }

  function handleBlogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      saveBlogMutation.mutate(blogFormToDraft(blogForm));
    } catch (error) {
      setBlogFormError(error instanceof Error ? error.message : "Check the blog post details.");
    }
  }

  function handleDeleteBlog(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    deleteBlogMutation.mutate(post.id);
  }

  function handlePrintInventory() {
    setPrintGeneratedAt(new Date());
    const originalTitle = document.title;
    document.title = " ";

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(restoreTitle, 1000);
    }, 0);
  }

  function removeImageUrl(urlToRemove: string) {
    setForm((current) => ({
      ...current,
      imagesText: splitLines(current.imagesText)
        .filter((url) => url !== urlToRemove)
        .join("\n"),
    }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;
    if (!supabase) {
      setFormError("Supabase is not configured.");
      return;
    }

    setUploadingImages(true);
    setFormError("");

    try {
      const urls = await uploadCarImages(files, form);
      setForm((current) => ({
        ...current,
        imagesText: appendLines(current.imagesText, urls),
      }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not upload images.");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleBlogImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!supabase) {
      setBlogFormError("Supabase is not configured.");
      return;
    }

    setUploadingBlogImage(true);
    setBlogFormError("");

    try {
      const url = await uploadBlogImage(file, blogForm);
      setBlogForm((current) => ({ ...current, image: url }));
    } catch (error) {
      setBlogFormError(error instanceof Error ? error.message : "Could not upload cover image.");
    } finally {
      setUploadingBlogImage(false);
    }
  }

  const mutationError =
    (saveMutation.error instanceof Error && saveMutation.error.message) ||
    (deleteMutation.error instanceof Error && deleteMutation.error.message) ||
    "";
  const blogMutationError =
    (saveBlogMutation.error instanceof Error && saveBlogMutation.error.message) ||
    (deleteBlogMutation.error instanceof Error && deleteBlogMutation.error.message) ||
    "";

  return (
    <main className="min-h-screen bg-[var(--soft-grey)]">
      <div className="no-print">
        <header className="relative overflow-hidden border-b border-cyan-300/30 bg-[linear-gradient(135deg,#020617_0%,#082f49_48%,#020617_100%)] text-white shadow-[0_12px_38px_oklch(0.58_0.18_235_/_0.2)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.13)_1px,transparent_1px),linear-gradient(180deg,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-cyan-300/70 shadow-[0_0_18px_rgba(56,189,248,0.8)]" />
          <div className="container-px relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
            <Link
              to="/"
              aria-label="Back to motorspaceKenya website"
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-200/60 bg-black p-1.5 shadow-[0_0_22px_rgba(56,189,248,0.28)] transition hover:border-[var(--brand-accent)]"
            >
              <BrandLogo imageClassName="h-10 w-10" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-white/75 sm:inline">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </header>

        <section className="container-px mx-auto max-w-7xl py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                Admin
              </p>
              <h1 className="mt-1 text-3xl font-bold">Inventory Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create, update, and publish live vehicle listings and blog content.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrintInventory}
                disabled={carsQuery.isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-card px-6 py-3 font-semibold transition-all hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] disabled:pointer-events-none disabled:opacity-60"
              >
                <Printer className="h-4 w-4" /> Print Inventory
              </button>
              <Link to="/cars" className="btn-navy">
                View Public Inventory
              </Link>
              <Link to="/blog" className="btn-outline-accent">
                View Blog
              </Link>
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={<CarFront className="h-5 w-5" />} label="Total" value={stats.total} />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Available"
              value={stats.available}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Coming Soon"
              value={stats.comingSoon}
            />
            <StatCard icon={<XCircle className="h-5 w-5" />} label="Sold" value={stats.sold} />
            <StatCard icon={<Star className="h-5 w-5" />} label="Featured" value={stats.featured} />
          </div>

          <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
            <form
              onSubmit={handleSubmit}
              className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit vehicle" : "Add vehicle"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Changes save directly to Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                >
                  New
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Make"
                  value={form.make}
                  onChange={(value) => setForm({ ...form, make: value })}
                  required
                />
                <Input
                  label="Model"
                  value={form.model}
                  onChange={(value) => setForm({ ...form, model: value })}
                  required
                />
                <Input
                  label="Year"
                  value={form.year}
                  onChange={(value) => setForm({ ...form, year: value })}
                  required
                  type="number"
                />
                <Input
                  label="Price"
                  value={form.price}
                  onChange={(value) => setForm({ ...form, price: value })}
                  required
                  type="number"
                />
                <Input
                  label="Mileage"
                  value={form.mileage}
                  onChange={(value) => setForm({ ...form, mileage: value })}
                  required
                  type="number"
                />
                <Input
                  label="Location"
                  value={form.location}
                  onChange={(value) => setForm({ ...form, location: value })}
                  required
                />
                <Input
                  label="Engine"
                  value={form.engineSize}
                  onChange={(value) => setForm({ ...form, engineSize: value })}
                  required
                  placeholder="2000cc"
                />
                <Input
                  label="Body Type"
                  value={form.bodyType}
                  onChange={(value) => setForm({ ...form, bodyType: value })}
                  required
                />
                <Select
                  label="Transmission"
                  value={form.transmission}
                  onChange={(value) => setForm({ ...form, transmission: value })}
                  options={["Automatic", "Manual"]}
                />
                <Select
                  label="Fuel"
                  value={form.fuelType}
                  onChange={(value) => setForm({ ...form, fuelType: value })}
                  options={["Petrol", "Diesel", "Hybrid", "Electric"]}
                />
                <Select
                  label="Drive Type"
                  value={form.driveType}
                  onChange={(value) => setForm({ ...form, driveType: value })}
                  options={["2WD", "4WD", "AWD", "RWD"]}
                />
                <Select
                  label="Card Badge"
                  value={form.condition}
                  onChange={(value) => setForm({ ...form, condition: value })}
                  options={["Foreign Used", "Locally Used", "Brand New"]}
                  description="Foreign Used and Locally Used appear as badges on public car cards."
                />
                <Input
                  label="Exterior Color"
                  value={form.exteriorColor}
                  onChange={(value) => setForm({ ...form, exteriorColor: value })}
                  required
                />
                <Input
                  label="Interior Color"
                  value={form.interiorColor}
                  onChange={(value) => setForm({ ...form, interiorColor: value })}
                  required
                />
                <Select
                  label="Availability"
                  value={form.availability}
                  onChange={(value) =>
                    setForm({ ...form, availability: value as Car["availability"] })
                  }
                  options={["Available", "Coming Soon", "Sold"]}
                />
                <Input
                  label="Date Added"
                  value={form.dateAdded}
                  onChange={(value) => setForm({ ...form, dateAdded: value })}
                  required
                  type="date"
                />
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug</span>
                <div className="flex gap-2">
                  <input
                    required
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
                    placeholder="vehicle-slug"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, slug: makeCarSlug(form.year, form.make, form.model) })
                    }
                    className="rounded-lg border border-input px-3 text-xs font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                  >
                    Generate
                  </button>
                </div>
              </label>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
                  className="h-4 w-4 rounded border-input accent-[var(--brand-accent)]"
                />
                Feature on homepage
              </label>

              <Textarea
                label="Description"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                required
                rows={4}
              />
              <label className="vehicle-neon-outline mt-4 block rounded-xl border border-dashed bg-muted/40 p-4">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">
                  Vehicle Photos
                </span>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--navy-deep)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingImages ? "Uploading photos..." : "Upload one or more vehicle photos."}
                </span>
              </label>
              {imageUrls.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {imageUrls.map((url) => (
                    <div
                      key={url}
                      className="vehicle-neon-outline group relative overflow-hidden rounded-xl border"
                    >
                      <img
                        src={url}
                        alt="Uploaded vehicle"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(url)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-90 transition hover:bg-red-600"
                        aria-label="Remove uploaded photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="vehicle-neon-outline mt-3 rounded-lg border border-dashed bg-muted p-3 text-xs text-muted-foreground">
                  No vehicle photos uploaded yet.
                </p>
              )}
              {(formError || mutationError) && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {formError || mutationError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  disabled={saveMutation.isPending}
                  className="btn-accent flex-1 disabled:pointer-events-none disabled:opacity-60"
                >
                  {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {saveMutation.isPending
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Vehicle"}
                </button>
              </div>
            </form>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Vehicles</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {carsQuery.isFetching
                      ? "Refreshing from Supabase..."
                      : `${visibleCars.length} shown`}
                  </p>
                </div>
                <button
                  onClick={() =>
                    void queryClient.invalidateQueries({ queryKey: inventoryQueryKey })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                >
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
              </div>

              <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search make, model, year, location"
                    className="w-full rounded-full border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-accent)]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  className="rounded-full border border-input bg-background px-4 py-2.5 text-sm"
                >
                  <option>All</option>
                  <option>Available</option>
                  <option>Coming Soon</option>
                  <option>Sold</option>
                </select>
              </div>

              {carsQuery.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Could not load Supabase inventory:{" "}
                  {carsQuery.error instanceof Error ? carsQuery.error.message : "Unknown error"}
                </div>
              ) : visibleCars.length === 0 ? (
                <div className="vehicle-neon-outline rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                  No vehicles match the current filters.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Vehicle</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {visibleCars.map((car) => (
                        <tr key={car.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {car.images[0] ? (
                                <img
                                  src={car.images[0]}
                                  alt=""
                                  className="h-14 w-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="vehicle-neon-outline flex h-14 w-20 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                                  <CarFront className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">
                                  {car.year} {car.make} {car.model}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {car.bodyType} / {car.mileage.toLocaleString()} km
                                </p>
                                {getUsageBadge(car.condition) && (
                                  <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-slate-700">
                                    {getUsageBadge(car.condition)}
                                  </p>
                                )}
                                {car.isFeatured && (
                                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-accent)]">
                                    <Star className="h-3 w-3 fill-current" /> Featured
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="vehicle-price px-4 py-3 font-semibold">
                            {formatPrice(car.price)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(car.availability)}`}
                            >
                              {car.availability}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{car.location}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEdit(car)}
                                className="rounded-full border border-input p-2 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                                aria-label={`Edit ${car.make} ${car.model}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(car)}
                                className="rounded-full border border-input p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
                                aria-label={`Delete ${car.make} ${car.model}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                  Blog
                </p>
                <h2 className="mt-1 text-2xl font-bold">Blog Content</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload cover images, write article content, and publish posts to the Blog page.
                </p>
              </div>
              <Link to="/blog" className="btn-navy">
                Open Blog Page
              </Link>
            </div>

            <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
              <form
                onSubmit={handleBlogSubmit}
                className="h-fit rounded-2xl border border-border bg-background p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">
                      {blogEditingId ? "Edit post" : "Add post"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Published posts appear on the public Blog page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetBlogForm}
                    className="rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                  >
                    New
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Title"
                    value={blogForm.title}
                    onChange={(value) => setBlogForm({ ...blogForm, title: value })}
                    required
                  />
                  <Input
                    label="Category"
                    value={blogForm.category}
                    onChange={(value) => setBlogForm({ ...blogForm, category: value })}
                    required
                    placeholder="Buying Guide"
                  />
                  <Input
                    label="Publish Date"
                    value={blogForm.date}
                    onChange={(value) => setBlogForm({ ...blogForm, date: value })}
                    required
                    type="date"
                  />
                </div>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Slug
                  </span>
                  <div className="flex gap-2">
                    <input
                      required
                      value={blogForm.slug}
                      onChange={(event) =>
                        setBlogForm({ ...blogForm, slug: event.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
                      placeholder="buying-a-car-in-kenya"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setBlogForm({ ...blogForm, slug: makeBlogSlug(blogForm.title) })
                      }
                      className="rounded-lg border border-input px-3 text-xs font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                    >
                      Generate
                    </button>
                  </div>
                </label>

                <Textarea
                  label="Excerpt"
                  value={blogForm.excerpt}
                  onChange={(value) => setBlogForm({ ...blogForm, excerpt: value })}
                  required
                  rows={3}
                  placeholder="Short summary for the blog card"
                />
                <Textarea
                  label="Article Content"
                  value={blogForm.content}
                  onChange={(value) => setBlogForm({ ...blogForm, content: value })}
                  required
                  rows={8}
                  placeholder="Write the full article. Separate paragraphs with a blank line."
                />

                <label className="vehicle-neon-outline mt-4 block rounded-xl border border-dashed bg-muted/40 p-4">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">
                    Cover Image
                  </span>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={handleBlogImageUpload}
                    disabled={uploadingBlogImage}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--navy-deep)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {uploadingBlogImage ? "Uploading cover..." : "Upload a blog cover image."}
                  </span>
                </label>

                <Input
                  label="Cover Image URL"
                  value={blogForm.image}
                  onChange={(value) => setBlogForm({ ...blogForm, image: value })}
                  required
                  placeholder="https://..."
                />

                {blogForm.image ? (
                  <div className="vehicle-neon-outline mt-4 overflow-hidden rounded-xl border">
                    <img
                      src={blogForm.image}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </div>
                ) : null}

                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={blogForm.isPublished}
                    onChange={(event) =>
                      setBlogForm({ ...blogForm, isPublished: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-input accent-[var(--brand-accent)]"
                  />
                  Publish on Blog page
                </label>

                {(blogFormError || blogMutationError) && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {blogFormError || blogMutationError}
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    disabled={saveBlogMutation.isPending}
                    className="btn-accent flex-1 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {blogEditingId ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {saveBlogMutation.isPending
                      ? "Saving..."
                      : blogEditingId
                        ? "Save Post"
                        : "Add Post"}
                  </button>
                </div>
              </form>

              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">Posts</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {blogQuery.isFetching
                        ? "Refreshing from Supabase..."
                        : `${visibleBlogPosts.length} shown`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      void queryClient.invalidateQueries({ queryKey: blogQueryKey })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                  >
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </button>
                </div>

                <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={blogSearch}
                      onChange={(event) => setBlogSearch(event.target.value)}
                      placeholder="Search title, category, excerpt"
                      className="w-full rounded-full border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-accent)]"
                    />
                  </div>
                  <select
                    value={blogStatusFilter}
                    onChange={(event) =>
                      setBlogStatusFilter(event.target.value as typeof blogStatusFilter)
                    }
                    className="rounded-full border border-input bg-background px-4 py-2.5 text-sm"
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>

                {blogQuery.isError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Could not load blog posts:{" "}
                    {blogQuery.error instanceof Error ? blogQuery.error.message : "Unknown error"}
                  </div>
                ) : visibleBlogPosts.length === 0 ? (
                  <div className="vehicle-neon-outline rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                    No blog posts match the current filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Post</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {visibleBlogPosts.map((post) => (
                          <tr key={post.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {post.image ? (
                                  <img
                                    src={post.image}
                                    alt=""
                                    className="h-14 w-20 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="vehicle-neon-outline flex h-14 w-20 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold">{post.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {post.category} / {post.slug}
                                  </p>
                                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                    {post.excerpt}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{post.date}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  post.isPublished
                                    ? "bg-green-100 text-green-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {post.isPublished ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => startEditBlog(post)}
                                  className="rounded-full border border-input p-2 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                                  aria-label={`Edit ${post.title}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(post)}
                                  className="rounded-full border border-input p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
                                  aria-label={`Delete ${post.title}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
      <InventoryPrintReport cars={inventory} stats={stats} generatedAt={printGeneratedAt} />
    </main>
  );
}

function InventoryPrintReport({
  cars,
  stats,
  generatedAt,
}: {
  cars: Car[];
  stats: {
    total: number;
    available: number;
    comingSoon: number;
    sold: number;
    featured: number;
  };
  generatedAt: Date;
}) {
  const totalValue = cars.reduce((sum, car) => sum + car.price, 0);

  return (
    <section className="print-report">
      <header className="mb-8 border-b border-slate-300 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          System-generated report
        </p>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-start gap-6">
          <div />
          <div className="flex justify-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-black p-2 shadow-sm print-color-exact">
              <BrandLogo imageClassName="h-12 w-12" />
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Generated</p>
            <p className="font-semibold text-slate-900">
              {generatedAt.toLocaleString("en-KE", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-6 gap-3">
        <PrintStat label="Total" value={stats.total} />
        <PrintStat label="Available" value={stats.available} />
        <PrintStat label="Coming Soon" value={stats.comingSoon} />
        <PrintStat label="Sold" value={stats.sold} />
        <PrintStat label="Featured" value={stats.featured} />
        <PrintStat label="Total Value" value={formatPrice(totalValue)} />
      </div>

      {cars.length === 0 ? (
        <p className="rounded-lg border border-slate-300 p-6 text-center text-sm text-slate-600">
          No inventory records found.
        </p>
      ) : (
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-y border-slate-400 bg-slate-100 text-slate-700">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Vehicle</th>
              <th className="px-2 py-2">Price</th>
              <th className="px-2 py-2">Mileage</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Location</th>
              <th className="px-2 py-2">Added</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={car.id} className="border-b border-slate-200">
                <td className="px-2 py-2 align-top">{index + 1}</td>
                <td className="px-2 py-2 align-top">
                  <p className="font-semibold text-slate-950">
                    {car.year} {car.make} {car.model}
                  </p>
                  <p className="text-slate-600">
                    {car.bodyType} / {car.transmission} / {car.fuelType}
                    {car.isFeatured ? " / Featured" : ""}
                  </p>
                </td>
                <td className="px-2 py-2 align-top font-semibold">{formatPrice(car.price)}</td>
                <td className="px-2 py-2 align-top">{car.mileage.toLocaleString()} km</td>
                <td className="px-2 py-2 align-top">{car.availability}</td>
                <td className="px-2 py-2 align-top">{car.location}</td>
                <td className="px-2 py-2 align-top">{car.dateAdded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </section>
  );
}

function PrintStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-300 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
    </div>
  );
}

function emptyForm(): CarFormState {
  return {
    slug: "",
    make: "",
    model: "",
    year: String(new Date().getFullYear()),
    price: "",
    currency: "KES",
    mileage: "",
    transmission: "Automatic",
    fuelType: "Petrol",
    engineSize: "",
    bodyType: "SUV",
    driveType: "2WD",
    exteriorColor: "",
    interiorColor: "",
    condition: "Foreign Used",
    location: "Nairobi",
    availability: "Available",
    isFeatured: false,
    imagesText: "",
    featuresText: "",
    description: "",
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

function carToForm(car: Car): CarFormState {
  return {
    slug: car.slug,
    make: car.make,
    model: car.model,
    year: String(car.year),
    price: String(car.price),
    currency: car.currency,
    mileage: String(car.mileage),
    transmission: car.transmission,
    fuelType: car.fuelType,
    engineSize: car.engineSize,
    bodyType: car.bodyType,
    driveType: car.driveType,
    exteriorColor: car.exteriorColor,
    interiorColor: car.interiorColor,
    condition: car.condition,
    location: car.location,
    availability: car.availability,
    isFeatured: car.isFeatured,
    imagesText: car.images.join("\n"),
    featuresText: car.features.join("\n"),
    description: car.description,
    dateAdded: car.dateAdded,
  };
}

function emptyBlogForm(): BlogFormState {
  return {
    slug: "",
    title: "",
    category: "Buying Guide",
    excerpt: "",
    content: "",
    date: new Date().toISOString().slice(0, 10),
    image: "",
    isPublished: true,
  };
}

function blogPostToForm(post: BlogPost): BlogFormState {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    image: post.image,
    isPublished: post.isPublished,
  };
}

function blogFormToDraft(form: BlogFormState): BlogPostDraft {
  const requiredFields = [
    form.slug,
    form.title,
    form.category,
    form.excerpt,
    form.content,
    form.date,
    form.image,
  ];
  if (requiredFields.some((value) => !value.trim())) {
    throw new Error("Fill in the required blog post details before saving.");
  }

  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    category: form.category.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    date: form.date,
    image: form.image.trim(),
    isPublished: form.isPublished,
  };
}

function formToDraft(form: CarFormState): CarDraft {
  const requiredFields = [
    form.slug,
    form.make,
    form.model,
    form.price,
    form.year,
    form.description,
  ];
  if (requiredFields.some((value) => !value.trim())) {
    throw new Error("Fill in the required vehicle details before saving.");
  }

  const year = Number(form.year);
  const price = Number(form.price);
  const mileage = Number(form.mileage);
  if (!Number.isFinite(year) || !Number.isFinite(price) || !Number.isFinite(mileage)) {
    throw new Error("Year, price, and mileage must be valid numbers.");
  }

  const images = splitLines(form.imagesText);
  if (images.length === 0) throw new Error("Upload at least one vehicle photo.");

  return {
    slug: form.slug.trim(),
    make: form.make.trim(),
    model: form.model.trim(),
    year,
    price,
    currency: form.currency.trim() || "KES",
    mileage,
    transmission: form.transmission,
    fuelType: form.fuelType,
    engineSize: form.engineSize.trim(),
    bodyType: form.bodyType.trim(),
    driveType: form.driveType,
    exteriorColor: form.exteriorColor.trim(),
    interiorColor: form.interiorColor.trim(),
    condition: form.condition,
    location: form.location.trim(),
    availability: form.availability,
    isFeatured: form.isFeatured,
    images,
    features: splitLines(form.featuresText),
    description: form.description.trim(),
    dateAdded: form.dateAdded,
  };
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendLines(currentValue: string, nextValues: string[]) {
  return [...splitLines(currentValue), ...nextValues].join("\n");
}

async function uploadCarImages(files: File[], form: CarFormState) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const folder = safeStorageSegment(
    form.slug || makeCarSlug(form.year, form.make, form.model) || "vehicle",
  );
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const contentType = getImageContentType(file);
    if (!contentType) {
      throw new Error(`${file.name} is not a supported image. Use JPG, PNG, WebP, or GIF.`);
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(CAR_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      contentType,
      upsert: false,
    });

    if (error) throw new Error(getStorageUploadErrorMessage(error.message));

    const { data } = supabase.storage.from(CAR_IMAGES_BUCKET).getPublicUrl(path);
    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}

async function uploadBlogImage(file: File, form: BlogFormState) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const contentType = getImageContentType(file);
  if (!contentType) {
    throw new Error(`${file.name} is not a supported image. Use JPG, PNG, WebP, or GIF.`);
  }

  const folder = safeStorageSegment(form.slug || makeBlogSlug(form.title) || "blog-post");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });

  if (error) throw new Error(getStorageUploadErrorMessage(error.message));

  const { data } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function safeStorageSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getImageContentType(file: File) {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return file.type;

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".webp")) return "image/webp";
  if (lowerName.endsWith(".gif")) return "image/gif";

  return "";
}

function getStorageUploadErrorMessage(message: string) {
  if (message.toLowerCase().includes("bucket not found")) {
    return "Supabase Storage bucket is missing. Run supabase/storage.sql in Supabase SQL Editor, then refresh this dashboard.";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "Supabase blocked the upload. Make sure your admin email is added to public.admin_users and run supabase/storage.sql again.";
  }

  return message;
}

function statusClass(status: Car["availability"]) {
  if (status === "Available") return "bg-green-100 text-green-800";
  if (status === "Sold") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

function SetupNotice() {
  return (
    <CenteredNotice title="Connect Supabase">
      <p className="mt-2 text-sm text-muted-foreground">
        Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env.local`, run
        `supabase/schema.sql` and `supabase/storage.sql` in Supabase, then restart the app.
      </p>
    </CenteredNotice>
  );
}

function CenteredNotice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--soft-grey)] px-4">
      <section className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
        <BrandLogo className="mx-auto mb-5" imageClassName="h-24 w-24" />
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--navy-deep)] text-[var(--brand-accent)]">
          {icon}
        </span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  description?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {description && <span className="mt-1.5 block text-[0.68rem] text-muted-foreground">{description}</span>}
    </label>
  );
}


function Textarea({
  label,
  value,
  onChange,
  required,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]"
      />
    </label>
  );
}
