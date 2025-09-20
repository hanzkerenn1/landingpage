create extension if not exists pgcrypto;
create table if not exists users (
  id text primary key,
  username varchar(64) not null unique,
  email varchar(255),
  hashed_password text not null,
  role varchar(32) not null default 'client',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null
);

-- Business tables
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  email varchar(255),
  cid varchar(64),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  date date not null,
  topup numeric,
  spend numeric,
  click numeric,
  impression numeric,
  status varchar(64),
  notes text,
  created_at timestamptz not null default now()
);
