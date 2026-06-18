-- Run this in Supabase SQL Editor before using the admin dashboard.
-- Then create an Auth user and add their user id to public.admin_users.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  make text not null,
  model text not null,
  year integer not null check (year >= 1900),
  price integer not null check (price >= 0),
  currency text not null default 'KES',
  mileage integer not null default 0 check (mileage >= 0),
  transmission text not null,
  fuel_type text not null,
  engine_size text not null,
  body_type text not null,
  drive_type text not null,
  exterior_color text not null,
  interior_color text not null,
  condition text not null,
  location text not null,
  availability text not null default 'Available'
    check (availability in ('Available', 'Sold', 'Coming Soon')),
  is_featured boolean not null default false,
  images text[] not null default '{}',
  features text[] not null default '{}',
  description text not null default '',
  date_added date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  excerpt text not null,
  content text not null default '',
  date_published date not null default current_date,
  image text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cars_slug_idx on public.cars (slug);
create index if not exists cars_featured_idx on public.cars (is_featured);
create index if not exists cars_availability_idx on public.cars (availability);
create index if not exists cars_date_added_idx on public.cars (date_added desc);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_published_idx on public.blog_posts (is_published);
create index if not exists blog_posts_date_published_idx on public.blog_posts (date_published desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at
before update on public.cars
for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.cars enable row level security;
alter table public.blog_posts enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.cars to anon, authenticated;
grant insert, update, delete on public.cars to authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "users can read own admin row" on public.admin_users;
create policy "users can read own admin row"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "public can read cars" on public.cars;
create policy "public can read cars"
on public.cars
for select
to anon, authenticated
using (true);

drop policy if exists "admins can manage cars" on public.cars;
create policy "admins can manage cars"
on public.cars
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "public can read published blog posts" on public.blog_posts;
create policy "public can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "admins can read all blog posts" on public.blog_posts;
create policy "admins can read all blog posts"
on public.blog_posts
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can manage blog posts" on public.blog_posts;
create policy "admins can manage blog posts"
on public.blog_posts
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

do $$
begin
  alter publication supabase_realtime add table public.cars;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.blog_posts;
exception
  when duplicate_object then null;
end $$;

-- Bootstrap an admin after creating the user in Supabase Auth:
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@example.com');
