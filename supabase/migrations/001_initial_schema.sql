-- Entreprises
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Utilisateurs recruteurs (liés à Supabase Auth)
create table recruiters (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  full_name text not null,
  role text not null default 'recruiter' check (role in ('admin', 'recruiter')),
  created_at timestamptz default now()
);

-- Embauches (le cœur du produit)
create table hires (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  recruiter_id uuid references recruiters(id),
  candidate_name text not null,
  candidate_email text not null,
  candidate_phone text,
  position text not null,
  start_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'no_show', 'cancelled')),
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  welcome_message text,
  confirmed_at timestamptz,
  created_at timestamptz default now()
);

-- Items de checklist personnalisables par entreprise
create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  label text not null,
  required boolean default false,
  sort_order int default 0
);

-- Complétions de checklist par candidat
create table checklist_completions (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid references hires(id) on delete cascade,
  item_id uuid references checklist_items(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(hire_id, item_id)
);

-- Logs des emails envoyés
create table reminder_logs (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid references hires(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('welcome', 'j7', 'j3', 'j1', 'manual')),
  sent_at timestamptz default now(),
  email_id text -- ID Resend pour tracking
);

-- Row Level Security
alter table companies enable row level security;
alter table recruiters enable row level security;
alter table hires enable row level security;
alter table checklist_items enable row level security;
alter table checklist_completions enable row level security;
alter table reminder_logs enable row level security;

-- Recruteur ne voit que les données de son entreprise
create policy "Recruiters see own company" on hires
  for all using (
    company_id = (select company_id from recruiters where id = auth.uid())
  );

-- Checklist publique par token (pour le portail candidat, sans auth)
create policy "Public checklist read by token" on checklist_items
  for select using (true);
