-- ==============================================================================
-- CRAVE POS — MIGRATION: ADD USER_ID & ENABLE RLS TO EXISTING TABLES
-- ==============================================================================
-- Jalankan query ini di Supabase SQL Editor untuk menambahkan kolom user_id
-- ke tabel yang sudah ada dan mengaktifkan isolasi data per akun (RLS).
-- ==============================================================================

-- 1. Enable Extension
create extension if not exists "uuid-ossp";

-- 2. ALTER EXISTING TABLES / ADD user_id COLUMN IF NOT EXISTS
alter table if exists public.categories 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.suppliers 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.products 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.transactions 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.transaction_items 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.stock_movements 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.expenses 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.employees 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.recipes 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table if exists public.marketing_plans 
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();


-- 3. CREATE TABLES IF THEY DON'T EXIST YET
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null default 'product',
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  phone text not null default '',
  category text not null default 'Umum',
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  sku text not null default '',
  category text not null default 'Umum',
  price numeric not null default 0,
  stock int not null default 0,
  min_stock int not null default 5,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  payment_method text not null default 'QRIS',
  total_amount numeric not null default 0,
  total_items int not null default 0,
  cashier_name text not null default 'Kasir',
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty int not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null default 'OUT',
  qty int not null default 1,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  amount numeric not null default 0,
  category text not null default 'Operasional',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  email text,
  role text not null default 'Kasir',
  active boolean not null default true,
  last_active timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  target_margin numeric not null default 50,
  ingredients jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  platform text not null default 'Instagram',
  daily_budget numeric not null default 0,
  duration_days int not null default 7,
  created_at timestamptz not null default now()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
alter table if exists public.categories enable row level security;
alter table if exists public.suppliers enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.transactions enable row level security;
alter table if exists public.transaction_items enable row level security;
alter table if exists public.stock_movements enable row level security;
alter table if exists public.expenses enable row level security;
alter table if exists public.employees enable row level security;
alter table if exists public.recipes enable row level security;
alter table if exists public.marketing_plans enable row level security;

-- 5. RE-CREATE RLS POLICIES (DROP FIRST TO AVOID DUPLICATES)
drop policy if exists "Users can manage own categories" on public.categories;
drop policy if exists "Users can manage own suppliers" on public.suppliers;
drop policy if exists "Users can manage own products" on public.products;
drop policy if exists "Users can manage own transactions" on public.transactions;
drop policy if exists "Users can manage own transaction items" on public.transaction_items;
drop policy if exists "Users can manage own stock movements" on public.stock_movements;
drop policy if exists "Users can manage own expenses" on public.expenses;
drop policy if exists "Users can manage own employees" on public.employees;
drop policy if exists "Users can manage own recipes" on public.recipes;
drop policy if exists "Users can manage own marketing plans" on public.marketing_plans;

create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own suppliers" on public.suppliers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own products" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own transaction items" on public.transaction_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own stock movements" on public.stock_movements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own employees" on public.employees
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own recipes" on public.recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own marketing plans" on public.marketing_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. MERCHANT & QRIS SETTINGS (PER-USER UMKM ISOLATION)
create table if not exists public.merchant_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  phone text,
  merchant_name text,
  merchant_id text,
  store_id text,
  store_name text,
  static_qris text,
  session_json text,
  is_active boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table if exists public.merchant_settings enable row level security;
drop policy if exists "Users can manage own merchant settings" on public.merchant_settings;
create policy "Users can manage own merchant settings" on public.merchant_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- 7. CHECKOUT ATOMIK
-- Menyimpan transaksi, item, potongan stok, dan riwayat stok dalam SATU transaksi
-- database: berhasil semua atau batal semua. Menggantikan penyimpanan satu per satu
-- dari HP kasir (lambat & bisa tersimpan setengah kalau koneksi putus).
--
-- * Idempoten: ID transaksi dibuat di HP kasir. Memanggil ulang dengan ID yang sama
--   (misal karena respons hilang di jaringan) mengembalikan transaksi yang sudah ada,
--   bukan membuat transaksi ganda.
-- * Stok dipotong langsung di database (stock = stock - qty), jadi dua kasir yang
--   menjual produk sama bersamaan tidak saling menimpa.
-- * Stok TIDAK ditolak bila kurang (boleh minus, sama seperti sebelumnya): pembayaran
--   QRIS sudah diterima saat fungsi ini dipanggil, jadi transaksi tidak boleh gagal
--   hanya karena data stok tidak akurat.
-- * Harga diambil dari tabel products, bukan dari HP kasir.
-- * SECURITY INVOKER: aturan RLS tetap berlaku, hanya produk milik pengguna yang bisa dipakai.
-- * customer_name = atas nama pelanggan (opsional); cashier_name = kasir yang melayani.

-- nama pelanggan per transaksi (boleh kosong)
alter table if exists public.transactions add column if not exists customer_name text;

-- versi lama (4 parameter) dihapus agar tidak bentrok dengan versi baru
drop function if exists public.checkout_transaction(uuid, text, text, jsonb);

create or replace function public.checkout_transaction(
  p_transaction_id uuid,
  p_payment_method text,
  p_cashier_name text,
  p_items jsonb, -- [{"product_id": "<uuid>", "qty": 2}, ...]
  p_customer_name text default null
)
returns public.transactions
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_trx public.transactions;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_total numeric := 0;
  v_count int := 0;
  v_can_write boolean;
begin
  if v_user is null then
    raise exception 'Pengguna belum terautentikasi' using errcode = '28000';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong' using errcode = '22023';
  end if;
  -- langganan habis / ditangguhkan → transaksi baru ditolak dengan pesan yang jelas
  -- (subscription_can_write dibuat di bagian 10; sebelum bagian 10 dijalankan, dilewati)
  if to_regprocedure('public.subscription_can_write()') is not null then
    execute 'select public.subscription_can_write()' into v_can_write;
    if not v_can_write then
      raise exception 'Langganan tidak aktif. Perpanjang di Pengaturan > Langganan untuk membuat transaksi baru.'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.transactions (id, user_id, payment_method, total_amount, total_items, cashier_name, customer_name)
  values (
    p_transaction_id, v_user, p_payment_method, 0, 0,
    coalesce(nullif(trim(p_cashier_name), ''), 'Kasir'),
    nullif(left(trim(p_customer_name), 80), '')
  )
  on conflict (id) do nothing
  returning * into v_trx;

  if not found then
    -- transaksi dengan ID ini sudah tersimpan sebelumnya → kembalikan apa adanya
    select * into v_trx from public.transactions where id = p_transaction_id and user_id = v_user;
    if not found then
      raise exception 'ID transaksi sudah dipakai' using errcode = '23505';
    end if;
    return v_trx;
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'qty')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Jumlah item tidak valid' using errcode = '22023';
    end if;

    -- hanya kolom stock: tabel products lama di sebagian database tidak punya updated_at
    update public.products
       set stock = stock - v_qty
     where id = (v_item ->> 'product_id')::uuid
       and user_id = v_user
    returning * into v_product;

    if not found then
      raise exception 'Produk % tidak ditemukan', v_item ->> 'product_id' using errcode = 'P0002';
    end if;

    insert into public.transaction_items (user_id, transaction_id, product_id, qty, price)
    values (v_user, v_trx.id, v_product.id, v_qty, v_product.price);

    insert into public.stock_movements (user_id, product_id, type, qty, description)
    values (v_user, v_product.id, 'OUT', v_qty, 'Terjual (Struk: ' || upper(left(v_trx.id::text, 8)) || ')');

    v_total := v_total + v_product.price * v_qty;
    v_count := v_count + v_qty;
  end loop;

  update public.transactions
     set total_amount = v_total,
         total_items = v_count
   where id = v_trx.id
  returning * into v_trx;

  return v_trx;
end;
$$;

revoke all on function public.checkout_transaction(uuid, text, text, jsonb, text) from public, anon;
grant execute on function public.checkout_transaction(uuid, text, text, jsonb, text) to authenticated;

-- 8. PROFIL TOKO (STRUK)
-- Nama, alamat, telepon & pesan bawah struk per akun. Sebelumnya disimpan di
-- localStorage HP kasir sehingga hilang saat pindah device. Berbeda dengan
-- merchant_settings.store_name (nama toko Shopee dari login OTP).
create table if not exists public.store_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  name text not null default '',
  address text not null default '',
  phone text not null default '',
  receipt_footer text not null default '',
  updated_at timestamptz not null default now()
);

-- logo outlet untuk struk (data URL gambar kecil, maks. ~384px) & lebar kertas printer
alter table if exists public.store_profiles add column if not exists logo_data text;
alter table if exists public.store_profiles add column if not exists paper_width int not null default 58;
alter table if exists public.store_profiles drop constraint if exists store_profiles_paper_width_check;
alter table if exists public.store_profiles add constraint store_profiles_paper_width_check check (paper_width in (58, 80));
-- logo dibatasi ±300 KB agar baris profil tetap ringan
alter table if exists public.store_profiles drop constraint if exists store_profiles_logo_size_check;
alter table if exists public.store_profiles add constraint store_profiles_logo_size_check check (logo_data is null or length(logo_data) <= 400000);

alter table if exists public.store_profiles enable row level security;
drop policy if exists "Users can manage own store profile" on public.store_profiles;
create policy "Users can manage own store profile" on public.store_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 9. PERANGKAT & SESI LOGIN
-- Aplikasi tidak bisa membaca skema auth secara langsung. Dua fungsi ini hanya
-- melihat/menghapus sesi milik akun yang sedang login (auth.uid()).
-- Catatan: perangkat yang sesinya dihapus masih memegang access token sampai
-- kedaluwarsa (default 1 jam); setelah itu sesinya tidak bisa diperpanjang.
create or replace function public.list_my_sessions()
returns table (
  id uuid,
  user_agent text,
  ip text,
  created_at timestamptz,
  last_active_at timestamptz,
  is_current boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    s.user_agent,
    host(s.ip),
    s.created_at,
    coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at),
    s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
  from auth.sessions s
  where s.user_id = auth.uid()
  order by coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at) desc;
$$;

create or replace function public.revoke_my_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Pengguna belum terautentikasi' using errcode = '28000';
  end if;
  if p_session_id = nullif(auth.jwt() ->> 'session_id', '')::uuid then
    raise exception 'Gunakan tombol Keluar untuk mengakhiri sesi di perangkat ini' using errcode = '22023';
  end if;
  delete from auth.sessions where id = p_session_id and user_id = auth.uid();
  if not found then
    raise exception 'Sesi tidak ditemukan atau sudah berakhir' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.list_my_sessions() from public, anon;
revoke all on function public.revoke_my_session(uuid) from public, anon;
grant execute on function public.list_my_sessions() to authenticated;
grant execute on function public.revoke_my_session(uuid) to authenticated;

-- 10. LANGGANAN (SAAS)
-- Satu paket, bayar di muka 1 / 6 / 12 bulan. Akun baru mendapat trial 14 hari.
-- Status dihitung dari tanggal (bukan disimpan), jadi tidak perlu cron:
--   trial     : belum pernah bayar & masih dalam masa trial
--   active    : masa berbayar masih berjalan
--   grace     : masa berbayar habis ≤ 3 hari (masih bisa transaksi, ada peringatan)
--   expired   : trial / masa berbayar + tenggang sudah lewat → HANYA BACA
--   suspended : ditangguhkan founder → HANYA BACA
-- Mode hanya-baca dijaga di database (policy RESTRICTIVE), bukan hanya di tampilan.
-- Status langganan TIDAK disimpan di user_metadata karena bisa diubah pengguna sendiri.

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
-- tanpa policy: tidak bisa dibaca/ditulis dari aplikasi, hanya lewat SQL Editor & fungsi di bawah
alter table if exists public.app_admins enable row level security;

create table if not exists public.subscription_plans (
  months int primary key check (months in (1, 6, 12)),
  price int not null check (price >= 0),
  label text not null
);
insert into public.subscription_plans (months, price, label) values
  (1, 150000, '1 Bulan'),
  (6, 765000, '6 Bulan'),
  (12, 1500000, '12 Bulan')
on conflict (months) do nothing;
alter table if exists public.subscription_plans enable row level security;
drop policy if exists "Anyone signed in can read plans" on public.subscription_plans;
create policy "Anyone signed in can read plans" on public.subscription_plans
  for select to authenticated using (true);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'trial' check (status in ('trial', 'active', 'suspended')),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  current_period_end timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table if exists public.subscriptions enable row level security;
drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create table if not exists public.subscription_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique,
  months int not null check (months in (1, 6, 12)),
  amount int not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  source text not null default 'midtrans' check (source in ('midtrans', 'manual')),
  payment_type text,
  snap_token text,
  snap_redirect_url text,
  period_start timestamptz,
  period_end timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscription_invoices_user_idx on public.subscription_invoices (user_id, created_at desc);
alter table if exists public.subscription_invoices enable row level security;
drop policy if exists "Users can read own invoices" on public.subscription_invoices;
create policy "Users can read own invoices" on public.subscription_invoices
  for select using (auth.uid() = user_id);

-- Trial otomatis untuk akun baru
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.subscriptions (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Akun yang sudah ada sebelum fitur ini: trial 14 hari dihitung sejak SQL ini dijalankan
insert into public.subscriptions (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

-- Status terhitung (lihat daftar di atas). Hanya untuk dipakai fungsi lain.
create or replace function public.subscription_state(p_user uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when s.user_id is null then 'trial'
    when s.status = 'suspended' then 'suspended'
    when s.current_period_end is not null and now() <= s.current_period_end then 'active'
    when s.current_period_end is not null and now() <= s.current_period_end + interval '3 days' then 'grace'
    when now() <= s.trial_ends_at then 'trial'
    else 'expired'
  end
  from (select p_user as uid) u
  left join public.subscriptions s on s.user_id = u.uid;
$$;
revoke all on function public.subscription_state(uuid) from public, anon, authenticated;

-- Boleh menulis data toko? (trial / aktif / masa tenggang)
create or replace function public.subscription_can_write()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and public.subscription_state(auth.uid()) in ('trial', 'active', 'grace');
$$;
revoke all on function public.subscription_can_write() from public, anon;
grant execute on function public.subscription_can_write() to authenticated;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.app_admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

-- Ringkasan langganan akun yang sedang login (dipakai halaman Langganan & banner)
create or replace function public.my_subscription()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_sub public.subscriptions;
  v_state text;
  v_ends timestamptz;
begin
  if v_user is null then
    raise exception 'Pengguna belum terautentikasi' using errcode = '28000';
  end if;
  insert into public.subscriptions (user_id) values (v_user) on conflict (user_id) do nothing;
  select * into v_sub from public.subscriptions where user_id = v_user;
  v_state := public.subscription_state(v_user);
  v_ends := case v_state
    when 'trial' then v_sub.trial_ends_at
    when 'active' then v_sub.current_period_end
    when 'grace' then v_sub.current_period_end + interval '3 days'
    else null
  end;
  return jsonb_build_object(
    'state', v_state,
    'can_write', v_state in ('trial', 'active', 'grace'),
    'trial_ends_at', v_sub.trial_ends_at,
    'current_period_end', v_sub.current_period_end,
    'ends_at', v_ends,
    'days_left', case when v_ends is null then 0 else greatest(0, ceil(extract(epoch from (v_ends - now())) / 86400.0)::int) end,
    'is_admin', public.is_app_admin()
  );
end;
$$;
revoke all on function public.my_subscription() from public, anon;
grant execute on function public.my_subscription() to authenticated;

-- Buat tagihan untuk durasi yang dipilih. Harga diambil dari subscription_plans
-- (bukan dari aplikasi), tagihan pending yang lama dibatalkan.
create or replace function public.create_subscription_invoice(p_user uuid, p_months int)
returns public.subscription_invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_price int;
  v_inv public.subscription_invoices;
begin
  select price into v_price from public.subscription_plans where months = p_months;
  if not found then
    raise exception 'Durasi langganan tidak tersedia' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Akun tidak ditemukan' using errcode = 'P0002';
  end if;
  update public.subscription_invoices
     set status = 'cancelled'
   where user_id = p_user and status = 'pending';
  insert into public.subscription_invoices (user_id, order_id, months, amount)
  values (
    p_user,
    'CRV-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    p_months,
    v_price
  )
  returning * into v_inv;
  return v_inv;
end;
$$;

-- Terapkan pembayaran yang sudah lunas: tandai tagihan & perpanjang masa aktif.
-- Idempoten (notifikasi ganda dari gateway aman). Perpanjangan dihitung dari akhir
-- masa aktif bila masih berjalan, jadi bayar lebih awal tidak merugikan.
create or replace function public.apply_subscription_payment(
  p_order_id text,
  p_payment_type text,
  p_gross_amount int,
  p_source text default 'midtrans'
)
returns public.subscription_invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.subscription_invoices;
  v_sub public.subscriptions;
  v_start timestamptz;
  v_end timestamptz;
begin
  select * into v_inv from public.subscription_invoices where order_id = p_order_id for update;
  if not found then
    raise exception 'Tagihan % tidak ditemukan', p_order_id using errcode = 'P0002';
  end if;
  if v_inv.status = 'paid' then
    return v_inv;
  end if;
  if p_gross_amount is distinct from v_inv.amount then
    raise exception 'Nominal pembayaran tidak cocok dengan tagihan' using errcode = '22023';
  end if;

  insert into public.subscriptions (user_id) values (v_inv.user_id) on conflict (user_id) do nothing;
  select * into v_sub from public.subscriptions where user_id = v_inv.user_id for update;
  v_start := greatest(now(), coalesce(v_sub.current_period_end, now()));
  v_end := v_start + make_interval(months => v_inv.months);

  update public.subscriptions
     set current_period_end = v_end,
         status = case when status = 'suspended' then 'suspended' else 'active' end,
         updated_at = now()
   where user_id = v_inv.user_id;

  update public.subscription_invoices
     set status = 'paid', paid_at = now(), payment_type = p_payment_type,
         source = p_source, period_start = v_start, period_end = v_end
   where id = v_inv.id
  returning * into v_inv;
  return v_inv;
end;
$$;

-- Dua fungsi di atas hanya untuk server (service role), tidak bisa dipanggil dari aplikasi
revoke all on function public.create_subscription_invoice(uuid, int) from public, anon, authenticated;
revoke all on function public.apply_subscription_payment(text, text, int, text) from public, anon, authenticated;
grant execute on function public.create_subscription_invoice(uuid, int) to service_role;
grant execute on function public.apply_subscription_payment(text, text, int, text) to service_role;

-- ── Dashboard founder ────────────────────────────────────────────────────────
create or replace function public.admin_list_merchants()
returns table (
  user_id uuid,
  email text,
  name text,
  store_name text,
  registered_at timestamptz,
  last_sign_in_at timestamptz,
  state text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  note text,
  tx_30d bigint,
  sales_30d numeric,
  tx_total bigint,
  paid_total bigint,
  is_admin boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;
  return query
  select
    u.id,
    u.email::text,
    coalesce(u.raw_user_meta_data ->> 'name', '')::text,
    coalesce(sp.name, '')::text,
    u.created_at,
    u.last_sign_in_at,
    public.subscription_state(u.id),
    s.trial_ends_at,
    s.current_period_end,
    s.note,
    coalesce(t.tx_30d, 0),
    coalesce(t.sales_30d, 0),
    coalesce(t.tx_total, 0),
    coalesce(i.paid_total, 0),
    exists (select 1 from public.app_admins a where a.user_id = u.id)
  from auth.users u
  left join public.subscriptions s on s.user_id = u.id
  left join public.store_profiles sp on sp.user_id = u.id
  left join lateral (
    select count(*) filter (where tr.created_at >= now() - interval '30 days') as tx_30d,
           sum(tr.total_amount) filter (where tr.created_at >= now() - interval '30 days') as sales_30d,
           count(*) as tx_total
      from public.transactions tr where tr.user_id = u.id
  ) t on true
  left join lateral (
    select sum(inv.amount)::bigint as paid_total
      from public.subscription_invoices inv where inv.user_id = u.id and inv.status = 'paid'
  ) i on true
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_list_invoices(p_limit int default 100)
returns table (
  order_id text,
  email text,
  months int,
  amount int,
  status text,
  source text,
  payment_type text,
  created_at timestamptz,
  paid_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;
  return query
  select inv.order_id, u.email::text, inv.months, inv.amount, inv.status, inv.source,
         inv.payment_type, inv.created_at, inv.paid_at
    from public.subscription_invoices inv
    join auth.users u on u.id = inv.user_id
   order by inv.created_at desc
   limit greatest(1, least(coalesce(p_limit, 100), 500));
end;
$$;

-- Aksi founder: extend_trial (hari), add_months (1/6/12, dicatat sebagai pembayaran manual),
-- suspend, unsuspend, set_note.
create or replace function public.admin_update_subscription(
  p_user uuid,
  p_action text,
  p_value int default null,
  p_note text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.subscription_invoices;
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Akun tidak ditemukan' using errcode = 'P0002';
  end if;
  insert into public.subscriptions (user_id) values (p_user) on conflict (user_id) do nothing;

  if p_action = 'extend_trial' then
    if p_value is null or p_value < 1 or p_value > 365 then
      raise exception 'Jumlah hari harus 1–365' using errcode = '22023';
    end if;
    update public.subscriptions
       set trial_ends_at = greatest(now(), trial_ends_at) + make_interval(days => p_value), updated_at = now()
     where user_id = p_user;
  elsif p_action = 'add_months' then
    v_inv := public.create_subscription_invoice(p_user, p_value);
    perform public.apply_subscription_payment(v_inv.order_id, 'manual', v_inv.amount, 'manual');
  elsif p_action = 'suspend' then
    update public.subscriptions set status = 'suspended', updated_at = now() where user_id = p_user;
  elsif p_action = 'unsuspend' then
    update public.subscriptions
       set status = case when current_period_end is null then 'trial' else 'active' end, updated_at = now()
     where user_id = p_user;
  elsif p_action = 'set_note' then
    null;
  else
    raise exception 'Aksi tidak dikenal: %', p_action using errcode = '22023';
  end if;

  if p_note is not null then
    update public.subscriptions set note = nullif(trim(p_note), ''), updated_at = now() where user_id = p_user;
  end if;
  return public.subscription_state(p_user);
end;
$$;

revoke all on function public.admin_list_merchants() from public, anon;
revoke all on function public.admin_list_invoices(int) from public, anon;
revoke all on function public.admin_update_subscription(uuid, text, int, text) from public, anon;
grant execute on function public.admin_list_merchants() to authenticated;
grant execute on function public.admin_list_invoices(int) to authenticated;
grant execute on function public.admin_update_subscription(uuid, text, int, text) to authenticated;

-- ── Mode hanya-baca saat langganan tidak aktif ───────────────────────────────
-- Policy RESTRICTIVE: digabung (AND) dengan policy "milik sendiri" yang sudah ada.
-- Membaca & mengekspor data tetap bisa; menambah/mengubah/menghapus ditolak.
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'suppliers', 'products', 'transactions', 'transaction_items',
    'stock_movements', 'expenses', 'employees', 'recipes', 'marketing_plans'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists "Active subscription required (insert)" on public.%I', t);
      execute format('drop policy if exists "Active subscription required (update)" on public.%I', t);
      execute format('drop policy if exists "Active subscription required (delete)" on public.%I', t);
      execute format('create policy "Active subscription required (insert)" on public.%I as restrictive for insert to authenticated with check (public.subscription_can_write())', t);
      execute format('create policy "Active subscription required (update)" on public.%I as restrictive for update to authenticated using (public.subscription_can_write()) with check (public.subscription_can_write())', t);
      execute format('create policy "Active subscription required (delete)" on public.%I as restrictive for delete to authenticated using (public.subscription_can_write())', t);
    end if;
  end loop;
end;
$$;

-- 11. DASHBOARD FOUNDER: ANALITIK & PEMANTAUAN LANGSUNG
-- Semua fungsi di bawah menolak akun yang bukan app_admins. Akun founder sendiri
-- tidak dihitung sebagai merchant. Hari dihitung dengan zona waktu Asia/Jakarta.

create or replace function public.admin_analytics(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days int := greatest(7, least(coalesce(p_days, 30), 365));
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_first date;
  v_first_ts timestamptz;
  v_from timestamptz := now() - make_interval(days => v_days);
  v_prev timestamptz := now() - make_interval(days => v_days * 2);
  v_kpi jsonb;
  v_part jsonb;
  v_daily jsonb;
  v_monthly jsonb;
  v_plans jsonb;
  v_methods jsonb;
  v_expiring jsonb;
  v_top jsonb;
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;
  v_first := v_today - (v_days - 1);
  v_first_ts := v_first::timestamp at time zone 'Asia/Jakarta';

  -- akun
  select jsonb_build_object(
      'merchants', count(*),
      'trial', count(*) filter (where m.state = 'trial'),
      'active', count(*) filter (where m.state = 'active'),
      'grace', count(*) filter (where m.state = 'grace'),
      'expired', count(*) filter (where m.state = 'expired'),
      'suspended', count(*) filter (where m.state = 'suspended'),
      'signups', count(*) filter (where m.created_at >= v_from),
      'signups_prev', count(*) filter (where m.created_at >= v_prev and m.created_at < v_from)
    )
    into v_kpi
    from (
      select u.id, u.created_at, public.subscription_state(u.id) as state
        from auth.users u
       where not exists (select 1 from public.app_admins a where a.user_id = u.id)
    ) m;

  -- transaksi seluruh merchant
  select jsonb_build_object(
      'gmv', coalesce(sum(t.total_amount) filter (where t.created_at >= v_from), 0),
      'gmv_prev', coalesce(sum(t.total_amount) filter (where t.created_at < v_from), 0),
      'tx', count(*) filter (where t.created_at >= v_from),
      'tx_prev', count(*) filter (where t.created_at < v_from),
      'active_merchants', count(distinct t.user_id) filter (where t.created_at >= v_from),
      'active_merchants_prev', count(distinct t.user_id) filter (where t.created_at < v_from)
    )
    into v_part
    from public.transactions t
   where t.created_at >= v_prev;
  v_kpi := v_kpi || v_part;

  -- pendapatan langganan
  select jsonb_build_object(
      'revenue_total', coalesce(sum(i.amount), 0),
      'revenue', coalesce(sum(i.amount) filter (where i.paid_at >= v_from), 0),
      'revenue_prev', coalesce(sum(i.amount) filter (where i.paid_at >= v_prev and i.paid_at < v_from), 0),
      'paid_merchants', count(distinct i.user_id)
    )
    into v_part
    from public.subscription_invoices i
   where i.status = 'paid';
  v_kpi := v_kpi || v_part;

  -- MRR: tagihan lunas terakhir tiap merchant yang masih aktif, dibagi jumlah bulannya
  select jsonb_build_object('mrr', coalesce(round(sum(x.amount::numeric / x.months)), 0))
    into v_part
    from (
      select distinct on (i.user_id) i.user_id, i.amount, i.months
        from public.subscription_invoices i
       where i.status = 'paid'
       order by i.user_id, i.paid_at desc
    ) x
   where public.subscription_state(x.user_id) in ('active', 'grace');
  v_kpi := v_kpi || v_part;

  select jsonb_build_object('pending_invoices', count(*))
    into v_part
    from public.subscription_invoices i
   where i.status = 'pending';
  v_kpi := v_kpi || v_part;

  -- deret harian
  select coalesce(jsonb_agg(jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'signups', coalesce(s.n, 0),
      'tx', coalesce(t.n, 0),
      'gmv', coalesce(t.gmv, 0),
      'active', coalesce(t.act, 0),
      'revenue', coalesce(r.rev, 0)
    ) order by d.day), '[]'::jsonb)
    into v_daily
    from (select g::date as day from generate_series(v_first::timestamp, v_today::timestamp, interval '1 day') g) d
    left join (
      select (u.created_at at time zone 'Asia/Jakarta')::date as day, count(*) as n
        from auth.users u
       where u.created_at >= v_first_ts
         and not exists (select 1 from public.app_admins a where a.user_id = u.id)
       group by 1
    ) s on s.day = d.day
    left join (
      select (tr.created_at at time zone 'Asia/Jakarta')::date as day, count(*) as n,
             sum(tr.total_amount) as gmv, count(distinct tr.user_id) as act
        from public.transactions tr
       where tr.created_at >= v_first_ts
       group by 1
    ) t on t.day = d.day
    left join (
      select (i.paid_at at time zone 'Asia/Jakarta')::date as day, sum(i.amount) as rev
        from public.subscription_invoices i
       where i.status = 'paid' and i.paid_at >= v_first_ts
       group by 1
    ) r on r.day = d.day;

  -- pendapatan 12 bulan terakhir
  select coalesce(jsonb_agg(jsonb_build_object(
      'month', to_char(mo.month, 'YYYY-MM'),
      'revenue', coalesce(r.rev, 0),
      'invoices', coalesce(r.n, 0)
    ) order by mo.month), '[]'::jsonb)
    into v_monthly
    from (
      select g::date as month
        from generate_series(
          date_trunc('month', v_today::timestamp) - interval '11 months',
          date_trunc('month', v_today::timestamp),
          interval '1 month') g
    ) mo
    left join (
      select date_trunc('month', i.paid_at at time zone 'Asia/Jakarta')::date as month,
             sum(i.amount) as rev, count(*) as n
        from public.subscription_invoices i
       where i.status = 'paid'
       group by 1
    ) r on r.month = mo.month;

  select coalesce(jsonb_agg(jsonb_build_object('months', p.months, 'count', p.n, 'amount', p.amt) order by p.months), '[]'::jsonb)
    into v_plans
    from (
      select i.months, count(*) as n, sum(i.amount) as amt
        from public.subscription_invoices i where i.status = 'paid' group by i.months
    ) p;

  select coalesce(jsonb_agg(jsonb_build_object('method', p.method, 'count', p.n, 'amount', p.amt) order by p.amt desc), '[]'::jsonb)
    into v_methods
    from (
      select case when i.source = 'manual' then 'manual' else coalesce(i.payment_type, 'lainnya') end as method,
             count(*) as n, sum(i.amount) as amt
        from public.subscription_invoices i where i.status = 'paid' group by 1
    ) p;

  -- trial / masa aktif yang berakhir dalam 7 hari
  select coalesce(jsonb_agg(to_jsonb(e) order by e.ends_at), '[]'::jsonb)
    into v_expiring
    from (
      select u.id as user_id, u.email::text as email, coalesce(sp.name, '')::text as store_name,
             public.subscription_state(u.id) as state,
             coalesce(s.current_period_end, s.trial_ends_at) as ends_at
        from auth.users u
        join public.subscriptions s on s.user_id = u.id
        left join public.store_profiles sp on sp.user_id = u.id
       where not exists (select 1 from public.app_admins a where a.user_id = u.id)
         and public.subscription_state(u.id) in ('trial', 'active', 'grace')
         and coalesce(s.current_period_end, s.trial_ends_at) < now() + interval '7 days'
       order by 5
       limit 12
    ) e;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.gmv desc), '[]'::jsonb)
    into v_top
    from (
      select u.id as user_id, u.email::text as email, coalesce(sp.name, '')::text as store_name,
             sum(tr.total_amount) as gmv, count(*) as tx
        from public.transactions tr
        join auth.users u on u.id = tr.user_id
        left join public.store_profiles sp on sp.user_id = u.id
       where tr.created_at >= v_from
       group by u.id, u.email, sp.name
       order by 4 desc
       limit 6
    ) x;

  return jsonb_build_object(
    'days', v_days,
    'kpi', v_kpi,
    'daily', v_daily,
    'monthly', v_monthly,
    'plans', v_plans,
    'methods', v_methods,
    'expiring', v_expiring,
    'top', v_top
  );
end;
$$;

-- Pemantauan langsung: dipanggil berkala oleh dashboard founder.
create or replace function public.admin_live()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_day_start timestamptz := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';
  v_stats jsonb;
  v_minutes jsonb;
  v_feed jsonb;
  v_online bigint;
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;

  select jsonb_build_object(
      'tx_hour', count(*) filter (where t.created_at >= now() - interval '1 hour'),
      'gmv_hour', coalesce(sum(t.total_amount) filter (where t.created_at >= now() - interval '1 hour'), 0),
      'tx_today', count(*) filter (where t.created_at >= v_day_start),
      'gmv_today', coalesce(sum(t.total_amount) filter (where t.created_at >= v_day_start), 0),
      'merchants_today', count(distinct t.user_id) filter (where t.created_at >= v_day_start),
      'active_now', count(distinct t.user_id) filter (where t.created_at >= now() - interval '15 minutes')
    )
    into v_stats
    from public.transactions t
   where t.created_at >= least(v_day_start, now() - interval '1 hour');

  -- akun yang sesi login-nya diperbarui dalam 1 jam terakhir
  select count(distinct s.user_id)
    into v_online
    from auth.sessions s
   where greatest(s.created_at, coalesce(s.updated_at, s.created_at)) >= now() - interval '1 hour'
     and not exists (select 1 from public.app_admins a where a.user_id = s.user_id);

  select coalesce(jsonb_agg(jsonb_build_object(
      'ago', g.ago, 'tx', coalesce(b.n, 0), 'gmv', coalesce(b.gmv, 0)
    ) order by g.ago desc), '[]'::jsonb)
    into v_minutes
    from generate_series(0, 59) as g(ago)
    left join (
      select floor(extract(epoch from (now() - t.created_at)) / 60)::int as ago,
             count(*) as n, sum(t.total_amount) as gmv
        from public.transactions t
       where t.created_at > now() - interval '1 hour' and t.created_at <= now()
       group by 1
    ) b on b.ago = g.ago;

  select coalesce(jsonb_agg(to_jsonb(f) order by f.at desc), '[]'::jsonb)
    into v_feed
    from (
      (select 'transaction'::text as type, t.created_at as at,
              coalesce(nullif(sp.name, ''), u.email::text) as who,
              t.total_amount::numeric as amount, t.payment_method::text as detail
         from public.transactions t
         join auth.users u on u.id = t.user_id
         left join public.store_profiles sp on sp.user_id = t.user_id
        order by t.created_at desc limit 14)
      union all
      (select 'signup'::text, u.created_at, u.email::text, null::numeric, null::text
         from auth.users u
        where not exists (select 1 from public.app_admins a where a.user_id = u.id)
        order by u.created_at desc limit 6)
      union all
      (select 'payment'::text, i.paid_at, u.email::text, i.amount::numeric,
              (i.months || ' bulan' || case when i.source = 'manual' then ' (manual)' else '' end)::text
         from public.subscription_invoices i
         join auth.users u on u.id = i.user_id
        where i.status = 'paid'
        order by i.paid_at desc limit 6)
      order by 2 desc
      limit 20
    ) f;

  return v_stats || jsonb_build_object(
    'now', now(),
    'online', v_online,
    'minutes', v_minutes,
    'feed', v_feed
  );
end;
$$;

-- Rincian satu merchant untuk panel "Kelola".
create or replace function public.admin_merchant_detail(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_first_ts timestamptz;
  v_out jsonb;
  v_daily jsonb;
  v_invoices jsonb;
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Akun tidak ditemukan' using errcode = 'P0002';
  end if;
  v_first_ts := (v_today - 29)::timestamp at time zone 'Asia/Jakarta';

  select jsonb_build_object(
      'products', (select count(*) from public.products p where p.user_id = p_user),
      'employees', (select count(*) from public.employees e where e.user_id = p_user),
      'tx_total', (select count(*) from public.transactions t where t.user_id = p_user),
      'gmv_total', (select coalesce(sum(t.total_amount), 0) from public.transactions t where t.user_id = p_user),
      'last_tx_at', (select max(t.created_at) from public.transactions t where t.user_id = p_user),
      'devices', (select count(*) from auth.sessions s where s.user_id = p_user),
      'qris_connected', exists (select 1 from public.merchant_settings ms where ms.user_id = p_user)
    )
    into v_out;

  select coalesce(jsonb_agg(jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'), 'tx', coalesce(t.n, 0), 'gmv', coalesce(t.gmv, 0)
    ) order by d.day), '[]'::jsonb)
    into v_daily
    from (select g::date as day from generate_series((v_today - 29)::timestamp, v_today::timestamp, interval '1 day') g) d
    left join (
      select (tr.created_at at time zone 'Asia/Jakarta')::date as day, count(*) as n, sum(tr.total_amount) as gmv
        from public.transactions tr
       where tr.user_id = p_user and tr.created_at >= v_first_ts
       group by 1
    ) t on t.day = d.day;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc), '[]'::jsonb)
    into v_invoices
    from (
      select i.order_id, i.months, i.amount, i.status, i.source, i.payment_type,
             i.created_at, i.paid_at, i.period_end
        from public.subscription_invoices i
       where i.user_id = p_user
       order by i.created_at desc
       limit 20
    ) x;

  return v_out || jsonb_build_object('daily', v_daily, 'invoices', v_invoices);
end;
$$;

-- Ubah harga paket. Tagihan yang sudah dibuat tidak ikut berubah.
create or replace function public.admin_update_plan(p_months int, p_price int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'Khusus founder' using errcode = '42501';
  end if;
  if p_price is null or p_price < 1000 or p_price > 100000000 then
    raise exception 'Harga harus antara Rp1.000 dan Rp100.000.000' using errcode = '22023';
  end if;
  update public.subscription_plans set price = p_price where months = p_months;
  if not found then
    raise exception 'Paket tidak ditemukan' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_analytics(int) from public, anon;
revoke all on function public.admin_live() from public, anon;
revoke all on function public.admin_merchant_detail(uuid) from public, anon;
revoke all on function public.admin_update_plan(int, int) from public, anon;
grant execute on function public.admin_analytics(int) to authenticated;
grant execute on function public.admin_live() to authenticated;
grant execute on function public.admin_merchant_detail(uuid) to authenticated;
grant execute on function public.admin_update_plan(int, int) to authenticated;
