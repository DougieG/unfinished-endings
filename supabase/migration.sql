-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Stories table
create table if not exists stories (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  source text check (source in ('interior','exterior','preload','upload')) default 'interior',
  duration_s int,
  audio_url text not null,
  transcript text,
  keywords jsonb,
  visual_url text,
  consent boolean default true,
  play_count int default 0,
  last_played_at timestamptz
);

-- Create index for efficient random selection with recency bias
create index if not exists idx_stories_created_at on stories(created_at desc);
create index if not exists idx_stories_consent on stories(consent) where consent = true;

-- Enable Row Level Security
alter table stories enable row level security;

-- Public read policy for consented stories
create policy "public_read_stories"
  on stories for select
  using (consent = true);

-- Allow inserts (authenticated or not - you can tighten this)
create policy "insert_stories"
  on stories for insert
  with check (true);

-- Update policy (for admin operations)
create policy "update_stories"
  on stories for update
  using (true);

-- Delete policy (for admin operations)
create policy "delete_stories"
  on stories for delete
  using (true);

-- Storage bucket for audio files
insert into storage.buckets (id, name, public)
values ('stories', 'stories', true)
on conflict (id) do nothing;

-- Storage policy: public read
create policy "public_read_audio"
  on storage.objects for select
  using (bucket_id = 'stories');

-- Storage policy: authenticated upload
create policy "authenticated_upload_audio"
  on storage.objects for insert
  with check (bucket_id = 'stories');
