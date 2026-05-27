-- Green The World Juice: initial schema.
-- Tables, indexes, Row Level Security policies, and the atomic functions that
-- back ordering and Stripe driven subscription state. Run with `supabase db reset`
-- for local dev or `supabase db push` against a linked remote project.

-- Enums -------------------------------------------------------------------

create type subscription_tier as enum ('sip', 'refresh', 'daily', 'crew', 'founders');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired');
create type order_status as enum ('pending', 'ready', 'completed', 'canceled', 'expired');

-- Tables ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier subscription_tier,
  status subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_customer_id on public.subscriptions(stripe_customer_id);

create table public.credit_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  credits_remaining integer not null default 0,
  credits_granted_this_period integer not null default 0,
  unlimited_until timestamptz,
  period_resets_at timestamptz,
  updated_at timestamptz not null default now()
);

create index idx_credit_balances_user_id on public.credit_balances(user_id);

create table public.drinks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  ingredients text[] not null default '{}',
  price_cents integer not null,
  credit_cost integer not null default 1,
  image_url text,
  color_hex text not null,
  text_color_hex text not null,
  tag text,
  tier_required subscription_tier,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_drinks_is_active on public.drinks(is_active);
create index idx_drinks_display_order on public.drinks(display_order);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status order_status not null default 'pending',
  total_cents integer not null default 0,
  credits_used integer not null default 0,
  redemption_code text not null unique,
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_redemption_code on public.orders(redemption_code);
create index idx_orders_status on public.orders(status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  drink_id uuid not null references public.drinks(id),
  quantity integer not null default 1 check (quantity > 0),
  price_cents_snapshot integer not null,
  credit_cost_snapshot integer not null,
  drink_name_snapshot text not null
);

create index idx_order_items_order_id on public.order_items(order_id);

create table public.lucky_spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spin_date date not null,
  drink_id_won uuid references public.drinks(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, spin_date)
);

create index idx_lucky_spins_user_date on public.lucky_spins(user_id, spin_date);

-- Row Level Security ------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_balances enable row level security;
alter table public.drinks enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.lucky_spins enable row level security;

-- profiles
create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- subscriptions: read only for the owner. Writes happen via the service role
-- (Stripe webhook) which bypasses RLS, so there is intentionally no write policy.
create policy "users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- credit_balances: read only for the owner. Writes go through place_order and
-- reset_credits_for_period (security definer) or the service role.
create policy "users read own credits"
  on public.credit_balances for select
  using (auth.uid() = user_id);

-- drinks: publicly readable menu (no auth required).
create policy "anyone reads active drinks"
  on public.drinks for select
  using (is_active = true);

-- orders: read only for the owner. Inserts happen through place_order.
create policy "users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- order_items: readable only if the parent order belongs to the user.
create policy "users read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- lucky_spins
create policy "users read own spins"
  on public.lucky_spins for select
  using (auth.uid() = user_id);

create policy "users insert own spin"
  on public.lucky_spins for insert
  with check (auth.uid() = user_id);

-- Functions ---------------------------------------------------------------

-- Auto-create a profile and zero balance credit row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');

  insert into public.credit_balances (user_id, credits_remaining)
  values (new.id, 0);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomically create an order, deduct credits, and insert items.
-- SELECT FOR UPDATE locks the balance row so two concurrent orders cannot both
-- spend the same credit. Unlimited tiers skip the deduction entirely.
create or replace function public.place_order(
  p_user_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total_cents integer := 0;
  v_total_credits integer := 0;
  v_user_credits integer;
  v_unlimited_until timestamptz;
  v_redemption_code text;
  v_item jsonb;
  v_drink record;
begin
  if p_user_id != auth.uid() then
    raise exception 'Cannot place orders for another user';
  end if;

  select credits_remaining, unlimited_until
    into v_user_credits, v_unlimited_until
    from public.credit_balances
    where user_id = p_user_id
    for update;

  if not found then
    raise exception 'No credit balance found for user';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_drink
      from public.drinks
      where id = (v_item->>'drink_id')::uuid and is_active = true;

    if not found then
      raise exception 'Drink not found or inactive: %', v_item->>'drink_id';
    end if;

    v_total_cents := v_total_cents + (v_drink.price_cents * (v_item->>'quantity')::integer);
    v_total_credits := v_total_credits + (v_drink.credit_cost * (v_item->>'quantity')::integer);
  end loop;

  if v_unlimited_until is null or v_unlimited_until < now() then
    if v_user_credits < v_total_credits then
      raise exception 'Insufficient credits: have %, need %', v_user_credits, v_total_credits;
    end if;

    update public.credit_balances
      set credits_remaining = credits_remaining - v_total_credits,
          updated_at = now()
      where user_id = p_user_id;
  end if;

  v_redemption_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

  insert into public.orders (user_id, total_cents, credits_used, redemption_code)
    values (p_user_id, v_total_cents, v_total_credits, v_redemption_code)
    returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_drink
      from public.drinks
      where id = (v_item->>'drink_id')::uuid;

    insert into public.order_items (
      order_id, drink_id, quantity,
      price_cents_snapshot, credit_cost_snapshot, drink_name_snapshot
    ) values (
      v_order_id, v_drink.id, (v_item->>'quantity')::integer,
      v_drink.price_cents, v_drink.credit_cost, v_drink.name
    );
  end loop;

  return v_order_id;
end;
$$;

grant execute on function public.place_order(uuid, jsonb) to authenticated;

-- Reset the credit pool for a new billing period. Called by the Stripe webhook.
create or replace function public.reset_credits_for_period(
  p_user_id uuid,
  p_period_end timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tier subscription_tier;
  v_credits integer;
  v_unlimited boolean := false;
begin
  select tier into v_tier
    from public.subscriptions
    where user_id = p_user_id;

  case v_tier
    when 'sip' then v_credits := 4;
    when 'refresh' then v_credits := 8;
    when 'daily' then v_credits := 20;
    when 'crew' then v_unlimited := true;
    when 'founders' then v_unlimited := true;
    else v_credits := 0;
  end case;

  update public.credit_balances
    set credits_remaining = v_credits,
        credits_granted_this_period = v_credits,
        unlimited_until = case when v_unlimited then p_period_end else null end,
        period_resets_at = p_period_end,
        updated_at = now()
    where user_id = p_user_id;
end;
$$;

-- Mark an order picked up. Called by shop staff via the service role or admin UI.
create or replace function public.complete_order(p_redemption_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  update public.orders
    set status = 'completed',
        completed_at = now()
    where redemption_code = p_redemption_code
      and status in ('pending', 'ready')
      and expires_at > now()
    returning id into v_order_id;

  if v_order_id is null then
    raise exception 'Order not found, already completed, or expired';
  end if;

  return v_order_id;
end;
$$;
