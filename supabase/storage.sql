-- Run this after supabase/schema.sql to enable car photo uploads.
-- The bucket is public so uploaded images can show on the public website.

insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do update
set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public can read car images" on storage.objects;
create policy "public can read car images"
on storage.objects
for select
to public
using (bucket_id = 'car-images');

drop policy if exists "public can read blog images" on storage.objects;
create policy "public can read blog images"
on storage.objects
for select
to public
using (bucket_id = 'blog-images');

drop policy if exists "admins can upload car images" on storage.objects;
create policy "admins can upload car images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'car-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can upload blog images" on storage.objects;
create policy "admins can upload blog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can update car images" on storage.objects;
create policy "admins can update car images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'car-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'car-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can update blog images" on storage.objects;
create policy "admins can update blog images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'blog-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can delete car images" on storage.objects;
create policy "admins can delete car images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'car-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can delete blog images" on storage.objects;
create policy "admins can delete blog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
