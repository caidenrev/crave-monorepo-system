-- Jalankan SELURUH isi file ini sekali di Supabase SQL Editor (aman dijalankan ulang).
-- Isi: bagian 7 sampai 10 dari supabase_schema.sql (checkout, profil toko, sesi, langganan).


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
