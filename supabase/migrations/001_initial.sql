-- profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text unique not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_insert" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update to authenticated using (auth.uid() = id);

create index profiles_display_name_idx on public.profiles (lower(display_name));

-- sprites
create table public.sprites (
  id uuid primary key default gen_random_uuid(),
  base_name text not null,
  variant text check (variant in ('base', 'gold', 'gummy', 'galaxy')),
  full_name text not null unique,
  rarity text not null check (rarity in ('rare', 'epic', 'legendary', 'mythic', 'special')),
  is_starter boolean default false not null,
  sort_order int not null,
  image_url text,
  created_at timestamptz default now() not null
);

alter table public.sprites enable row level security;

create policy "sprites_select" on public.sprites
  for select to authenticated using (true);

-- follows (must exist before user_collections RLS references it)
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "follows_select" on public.follows
  for select to authenticated using (follower_id = auth.uid());

create policy "follows_insert" on public.follows
  for insert to authenticated with check (follower_id = auth.uid());

create policy "follows_delete" on public.follows
  for delete to authenticated using (follower_id = auth.uid());

create index follows_follower_idx on public.follows (follower_id);
create index follows_following_idx on public.follows (following_id);

-- user_collections
create table public.user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  sprite_id uuid references public.sprites(id) on delete cascade not null,
  status text not null check (status in ('acquired', 'mastered')),
  updated_at timestamptz default now() not null,
  unique(user_id, sprite_id)
);

alter table public.user_collections enable row level security;

create policy "collections_select" on public.user_collections
  for select to authenticated using (
    auth.uid() = user_id
    or user_id in (
      select following_id from public.follows where follower_id = auth.uid()
    )
  );

create policy "collections_insert" on public.user_collections
  for insert to authenticated with check (auth.uid() = user_id);

create policy "collections_update" on public.user_collections
  for update to authenticated using (auth.uid() = user_id);

create policy "collections_delete" on public.user_collections
  for delete to authenticated using (auth.uid() = user_id);

create index user_collections_user_idx on public.user_collections (user_id);
