-- STAGE WALK 방문 기록용 테이블과 함수
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여 넣고 Run 하면 돼요. (여러 번 실행해도 안전)

create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  page        text not null check (char_length(page) <= 20),
  path        text not null default '/' check (char_length(path) <= 80),
  visitor     text check (char_length(visitor) <= 40),
  referrer    text check (char_length(referrer) <= 200)
);
create index if not exists page_views_page_path_idx on public.page_views (page, path);
create index if not exists page_views_created_idx on public.page_views (created_at);

-- 누구나 기록은 남길 수 있지만, 원본 기록은 읽을 수 없게 (집계 숫자만 아래 함수로 공개)
alter table public.page_views enable row level security;
drop policy if exists "anyone can add a view" on public.page_views;
create policy "anyone can add a view" on public.page_views
  for insert to anon, authenticated
  with check (page in ('home', 'inspire', 'myunghwa'));

-- 페이지별 합계: 조회수, 방문자 수, 오늘 조회수(한국 시간), 좌석 시야 조회수
create or replace function public.view_stats()
returns table (page text, views bigint, visitors bigint, today bigint, seat_views bigint)
language sql stable security definer set search_path = public as $$
  select p.page,
         count(*) filter (where p.path = '/'),
         count(distinct p.visitor) filter (where p.path = '/'),
         count(*) filter (where p.path = '/' and (p.created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date),
         count(*) filter (where p.path like 'seat/%')
  from public.page_views p
  group by p.page
  order by 2 desc;
$$;

-- 특정 화면(예: seat/208-C-8) 조회수
create or replace function public.path_count(p_page text, p_path text)
returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from public.page_views where page = p_page and path = p_path;
$$;

-- 날짜별 페이지 조회수 (최근 N일, 한국 시간)
create or replace function public.daily_views(p_days int default 14)
returns table (day date, page text, views bigint)
language sql stable security definer set search_path = public as $$
  select (created_at at time zone 'Asia/Seoul')::date as day, page, count(*)
  from public.page_views
  where path = '/' and created_at >= now() - make_interval(days => greatest(1, least(p_days, 90)))
  group by 1, 2
  order by 1, 2;
$$;

-- 가장 많이 본 좌석·부스 등 (prefix 예: 'seat/')
create or replace function public.top_paths(p_page text, p_prefix text, p_limit int default 10)
returns table (path text, views bigint)
language sql stable security definer set search_path = public as $$
  select path, count(*) from public.page_views
  where page = p_page and path like p_prefix || '%'
  group by path order by 2 desc limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.view_stats(), public.path_count(text, text), public.daily_views(int), public.top_paths(text, text, int) to anon, authenticated;
