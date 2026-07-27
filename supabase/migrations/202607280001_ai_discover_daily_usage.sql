create table if not exists public.ai_discover_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  count integer not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.ai_discover_daily_usage enable row level security;

drop policy if exists "Users can read their own AI Discover usage" on public.ai_discover_daily_usage;
create policy "Users can read their own AI Discover usage"
  on public.ai_discover_daily_usage
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.consume_ai_discover_daily_credit(
  p_usage_date date,
  p_limit integer default 10
)
returns table (
  allowed boolean,
  used integer,
  remaining integer,
  reset_date date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_limit < 1 then
    raise exception 'Limit must be positive';
  end if;

  insert into public.ai_discover_daily_usage (user_id, usage_date, count)
  values (v_user_id, p_usage_date, 0)
  on conflict (user_id, usage_date) do nothing;

  select count
    into v_count
    from public.ai_discover_daily_usage
    where user_id = v_user_id
      and usage_date = p_usage_date
    for update;

  if v_count >= p_limit then
    allowed := false;
    used := v_count;
    remaining := 0;
    reset_date := p_usage_date + 1;
    return next;
    return;
  end if;

  update public.ai_discover_daily_usage
    set count = v_count + 1,
        updated_at = now()
    where user_id = v_user_id
      and usage_date = p_usage_date
    returning count into v_count;

  allowed := true;
  used := v_count;
  remaining := greatest(p_limit - v_count, 0);
  reset_date := p_usage_date + 1;
  return next;
end;
$$;

revoke all on function public.consume_ai_discover_daily_credit(date, integer) from public;
grant execute on function public.consume_ai_discover_daily_credit(date, integer) to authenticated;
