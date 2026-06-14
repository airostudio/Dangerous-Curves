-- Dangerous Curves — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Products
create table if not exists products (
  id           bigint generated always as identity primary key,
  name         text     not null,
  description  text     not null default '',
  price        integer  not null,
  category     text     not null,
  size         text     not null default '',
  era          text     not null default '',
  image_url    text     not null default '',
  stock        integer  not null default 0,
  featured     smallint not null default 0,
  status       text     not null default 'published',  -- 'draft' | 'published'
  weight_grams integer  not null default 500,
  created_at   timestamptz not null default now()
);

-- Product images (multiple per product)
create table if not exists product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint   not null references products(id) on delete cascade,
  path        text     not null,
  url         text     not null,
  position    integer  not null default 0,
  is_primary  boolean  not null default false,
  width       integer,
  height      integer,
  created_at  timestamptz not null default now()
);
create index if not exists product_images_product on product_images (product_id, position);

-- Orders
create table if not exists orders (
  id                 bigint generated always as identity primary key,
  customer_name      text    not null,
  customer_email     text    not null,
  customer_address   text    not null default '',
  status             text    not null default 'pending',
  total              integer not null,
  stripe_session_id  text    unique,
  created_at         timestamptz not null default now()
);

-- Order items
create table if not exists order_items (
  id           bigint generated always as identity primary key,
  order_id     bigint  not null references orders(id) on delete cascade,
  product_id   bigint  not null,
  product_name text    not null,
  quantity     integer not null,
  price        integer not null
);

-- Admin users
create table if not exists admin_users (
  id            bigint generated always as identity primary key,
  username      text not null unique,
  password_hash text not null
);

-- Sessions
create table if not exists sessions (
  id         text primary key,
  user_id    bigint not null references admin_users(id) on delete cascade,
  expires_at timestamptz not null
);

-- Rate limiting for login
create table if not exists login_attempts (
  id           bigint generated always as identity primary key,
  ip           text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_time on login_attempts (ip, attempted_at);

-- Site settings (key/value store)
create table if not exists site_settings (
  key   text primary key,
  value text not null default ''
);
insert into site_settings (key, value) values
  ('auspost_api_key', ''),
  ('sender_postcode', ''),
  ('handling_fee_cents', '0')
on conflict (key) do nothing;

-- Discount codes
create table if not exists discount_codes (
  id          bigint generated always as identity primary key,
  code        text    not null unique,
  type        text    not null default 'percentage',  -- 'percentage' | 'fixed'
  value       integer not null,   -- percentage (1-100) or cents
  min_order   integer not null default 0,
  max_uses    integer,            -- null = unlimited
  used_count  integer not null default 0,
  active      boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- Seed admin user (username: admin / password: admin123)
-- CHANGE THIS PASSWORD immediately after first login via /admin/settings
insert into admin_users (username, password_hash)
values ('admin', '$2b$10$phknMyznFbeWtFkCgScOBe9BOhhWSO9JELLQFM/NpdOTBTmiK8ISy')
on conflict (username) do nothing;

-- Supabase Storage: create the product-images bucket
-- You can also do this via Dashboard > Storage > New Bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies (RLS must be enabled on storage.objects)
do $$
begin
  -- Public read
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'Public read product images'
  ) then
    execute $p$
      create policy "Public read product images" on storage.objects
        for select using (bucket_id = 'product-images')
    $p$;
  end if;
  -- Upload (service role bypasses this, but needed for signed URLs)
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'Upload product images'
  ) then
    execute $p$
      create policy "Upload product images" on storage.objects
        for insert with check (bucket_id = 'product-images')
    $p$;
  end if;
  -- Delete
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'Delete product images'
  ) then
    execute $p$
      create policy "Delete product images" on storage.objects
        for delete using (bucket_id = 'product-images')
    $p$;
  end if;
end $$;

-- Optional: seed sample products
insert into products (name, description, price, category, size, era, image_url, stock, featured, status) values
  ('Cherry Bomb Leather Jacket', 'Classic cherry-red leather moto jacket with silver hardware and quilted lining. The kind of jacket that walks into a room before you do.', 18900, 'Outerwear', 'M', '80s', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', 1, 1, 'published'),
  ('Polka Dot Swing Dress', 'Black and white polka dot swing dress with sweetheart neckline and full circle skirt. Perfect for jiving or just turning heads.', 14200, 'Dresses', 'S', '50s', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80', 1, 1, 'published'),
  ('Thunderbird Denim Jacket', 'Faded indigo denim jacket with custom Thunderbird embroidery on the back. Worn-in perfection that tells a story.', 16500, 'Outerwear', 'L', '50s', 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80', 2, 1, 'published'),
  ('Pin-Up Rose Pencil Skirt', 'High-waisted black pencil skirt with red rose embroidery along the hem. Curves ahead — you''ve been warned.', 7800, 'Bottoms', 'M', '50s', 'https://images.unsplash.com/photo-1583496661160-fb5886a0afe0?auto=format&fit=crop&w=800&q=80', 3, 0, 'published'),
  ('Hot Rod Red Stilettos', 'Patent leather stilettos in hot rod red with pointed toe and chrome heel detail. Dangerous from every angle.', 9500, 'Shoes', '7', '50s', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', 1, 1, 'published'),
  ('Leopard Cat-Eye Sunglasses', 'Vintage leopard print cat-eye frames with dark lenses. The accessory that says you''re not here to play nice.', 4500, 'Accessories', 'One Size', '60s', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', 5, 0, 'published'),
  ('Rebel Without a Cause Tee', 'Vintage-wash black tee with distressed rebel graphic. Soft cotton, lived-in feel, zero apologies.', 5500, 'Tops', 'M', '50s', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80', 4, 0, 'published'),
  ('Velvet Elvis Bowling Shirt', 'Two-tone bowling shirt in black and teal with contrast stitching and retro collar. Vintage royalty status.', 8800, 'Tops', 'L', '50s', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', 2, 1, 'published'),
  ('Checkered Flag Mini Skirt', 'Black and white checkered mini skirt with high waist and back zip. Race-day energy, every day.', 6800, 'Bottoms', 'S', '60s', 'https://images.unsplash.com/photo-1583496661160-fb5886a0afe0?auto=format&fit=crop&w=800&q=80', 2, 0, 'published'),
  ('Greaser Cuffed Jeans', 'Dark selvedge denim with a straight leg and cuffed hem. The jeans James Dean would''ve worn on a Saturday night.', 9600, 'Denim', '32', '50s', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80', 3, 0, 'published'),
  ('Flame Detail Western Boots', 'Black leather western boots with flame stitching and stacked heel. Walk into trouble with style.', 15500, 'Shoes', '9', '80s', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80', 1, 1, 'published'),
  ('Chrome Heart Belt Buckle', 'Oversized chrome belt buckle with heart and crossbones motif. The finishing touch every outfit needs.', 6200, 'Accessories', 'One Size', '50s', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 4, 0, 'published');
