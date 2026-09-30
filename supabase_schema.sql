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
