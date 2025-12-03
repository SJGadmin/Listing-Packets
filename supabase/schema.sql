-- Create Packets table
create table packets (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  cover_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Packet Items table
create table packet_items (
  id uuid default gen_random_uuid() primary key,
  packet_id uuid references packets(id) on delete cascade not null,
  type text not null check (type in ('file', 'link', 'text')),
  label text not null,
  url text,
  content text,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Packet Views table
create table packet_views (
  id uuid default gen_random_uuid() primary key,
  packet_id uuid references packets(id) on delete cascade not null,
  user_agent text,
  ip_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table packets enable row level security;
alter table packet_items enable row level security;
alter table packet_views enable row level security;

-- Policies
-- Public can read packets and items
create policy "Public packets are viewable by everyone"
  on packets for select
  using (true);

create policy "Public packet items are viewable by everyone"
  on packet_items for select
  using (true);

-- Only authenticated users (or service role) can insert/update/delete
-- Since we are using a hardcoded password gate in the app, we might rely on the service role key for admin actions
-- OR we can allow anonymous writes if we trust the app's gate (risky).
-- BETTER: Use Supabase Auth if possible, but user said "No multi-user auth".
-- So we will use the ANON key for public reads, and maybe we need a way to secure writes.
-- Given the constraints, we will allow public reads.
-- For writes, we should ideally use a separate mechanism or just rely on the app logic if we use the service role for admin ops.
-- However, the user said "Use Supabase's JS client".
-- If we use the standard client with ANON key, we need policies that allow writes.
-- Since there is no "real" auth user, we might have to open writes to anon BUT that is insecure.
-- A compromise: The app will use the ANON key for everything. We will set policies to allow everything for now,
-- trusting the app's password gate to prevent unauthorized API calls (though technically anyone with the key can write).
-- User said: "We do NOT need multi-user auth; I’m the only admin."
-- So I will create a policy that allows ALL operations for now, but warn the user.
-- OR, I can check for a specific header or secret if I wanted to be fancy, but let's stick to simple.

create policy "Enable all access for all users"
  on packets for all
  using (true)
  with check (true);

create policy "Enable all access for all users"
  on packet_items for all
  using (true)
  with check (true);

create policy "Enable insert for views"
  on packet_views for insert
  with check (true);

-- Storage bucket for covers and files
insert into storage.buckets (id, name, public) values ('packet-assets', 'packet-assets', true);

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'packet-assets' );

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'packet-assets' );
-- Create Agents table
create table agents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  email text,
  headshot_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add agent_id to packets
alter table packets add column agent_id uuid references agents(id) on delete set null;

-- Enable RLS for agents
alter table agents enable row level security;

-- Policies for agents
create policy "Public agents are viewable by everyone"
  on agents for select
  using (true);

create policy "Enable all access for all users"
  on agents for all
  using (true)
  with check (true);

-- Create Packet Feedback table
create table packet_feedback (
  id uuid default gen_random_uuid() primary key,
  packet_id uuid references packets(id) on delete cascade not null,
  agent_name text not null,
  feedback text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for feedback
alter table packet_feedback enable row level security;

-- Policies for feedback
create policy "Public feedback is viewable by everyone"
  on packet_feedback for select
  using (true);

create policy "Enable insert for feedback"
  on packet_feedback for insert
  with check (true);
