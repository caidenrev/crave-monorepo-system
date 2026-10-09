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
begin
  if v_user is null then
    raise exception 'Pengguna belum terautentikasi' using errcode = '28000';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong' using errcode = '22023';
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
