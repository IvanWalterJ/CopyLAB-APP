-- Brand Profiles (Knowledge Base)
create table brand_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  industry text,
  uvp text,
  competitors text,
  avatar_name text,
  avatar_age int,
  avatar_location text,
  avatar_pains jsonb default '[]',
  avatar_desires jsonb default '[]',
  avatar_objections jsonb default '[]',
  brand_adjectives jsonb default '[]',
  forbidden_words jsonb default '[]',
  approved_copy text,
  formality_level int default 5,
  product_name text,
  product_transformation text,
  product_mechanism text,
  product_results text,
  product_guarantee text,
  product_price text,
  default_consciousness_level int default 2,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table brand_profiles enable row level security;
create policy "User owns profile" on brand_profiles
  for all using (auth.uid() = user_id);

-- Swipe File
create table swipe_file (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text,
  title text,
  content text not null,
  tags text[],
  source text,
  created_at timestamptz default now()
);
alter table swipe_file enable row level security;
create policy "User owns swipe" on swipe_file
  for all using (auth.uid() = user_id);

-- User Credits (Hotmart)
create table user_credits (
  user_id uuid references auth.users on delete cascade not null primary key,
  total_credits int default 10,  -- 10 free credits for signing up
  used_credits int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to create user_credits when a new user signs up in Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_credits (user_id, total_credits)
  values (new.id, 10);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger attached to auth.users (Needs to be run in Supabase SQL Editor as Supabase Admin / Postgres role)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS for credits
alter table user_credits enable row level security;
create policy "User can view own credits" on user_credits
  for select using (auth.uid() = user_id);

-- Hotmart Transactions (Para guardar un registro de compras)
create table hotmart_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  transaction_id text not null unique,
  product_id text,
  credits_added int not null,
  amount_paid numeric,
  currency text default 'USD',
  buyer_email text,
  status text default 'APPROVED',
  created_at timestamptz default now()
);

-- RPC for Hotmart Webhook to add credits safely based on Email
create or replace function add_credits_by_email(buyer_email_param text, credits_to_add int)
returns void as $$
declare
  target_user_id uuid;
begin
  -- Buscar al usuario en auth.users
  select id into target_user_id from auth.users where email = buyer_email_param;
  
  if target_user_id is not null then
    update public.user_credits
    set total_credits = total_credits + credits_to_add
    where user_id = target_user_id;
  end if;
end;
$$ language plpgsql security definer;

-- RPC to deduct 1 credit safely
create or replace function use_credit(target_user_id uuid)
returns void as $$
begin
  update public.user_credits
  set used_credits = used_credits + 1
  where user_id = target_user_id;
end;
$$ language plpgsql security definer;

-- Generations History Table
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  brand_id uuid references brand_profiles on delete set null,
  module_type text not null,
  prompt text,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table generations enable row level security;

-- Policies
create policy "User owns generations" on generations
  for all using (auth.uid() = user_id);

-- Migration: Add knowledge base text to brand_profiles (run if upgrading existing DB)
-- ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS knowledge_base_text text;

