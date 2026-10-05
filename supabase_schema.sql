-- zeni app database schema for Supabase

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  handle text unique,
  bio text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references auth.users on delete set null,
  created_by_id uuid references auth.users on delete set null,
  title text not null,
  subtitle text,
  description text,
  content text,
  type text default 'showcase',
  status text default '서비스 중',
  image_url text,
  detail_images text[],
  website_link text,
  play_link text,
  app_link text,
  members text[],
  views int default 0,
  likes_count int default 0,
  comments_count int default 0,
  bumped_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.feed_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  actor_name text,
  content text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  action_type text not null,
  actor_name text,
  project_id uuid references public.projects on delete cascade,
  project_title text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  project_id uuid references public.projects on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, project_id)
);

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade,
  user_id uuid references auth.users on delete cascade,
  actor_name text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references auth.users on delete cascade,
  actor_name text,
  project_id uuid references public.projects on delete cascade,
  project_title text,
  type text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.feed_posts enable row level security;
alter table public.activities enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

create policy "Public profiles" on public.profiles for all using (true) with check (true);
create policy "Public projects" on public.projects for all using (true) with check (true);
create policy "Public feed_posts" on public.feed_posts for all using (true) with check (true);
create policy "Public activities" on public.activities for all using (true) with check (true);
create policy "Public likes" on public.likes for all using (true) with check (true);
create policy "Public comments" on public.comments for all using (true) with check (true);
create policy "Public notifications" on public.notifications for all using (true) with check (true);
