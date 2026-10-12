
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
