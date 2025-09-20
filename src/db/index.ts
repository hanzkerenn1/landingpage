import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { newDb } from "pg-mem";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const db = (() => {
  if (connectionString) {
    const sql = neon(connectionString);
    return drizzleNeon(sql, { schema });
  }
  // In-memory Postgres (pg-mem) fallback for local/dev without external DB
  const mem = newDb();
  const { Pool: MemPool } = mem.adapters.createPg();
  const pool: Pool = new MemPool();
  // Create schema tables (simplified, without extensions/default uuid)
  const schemaSql = `
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
    create table if not exists clients (
      id text primary key,
      name varchar(255) not null,
      email varchar(255),
      cid varchar(64),
      notes text,
      created_at timestamptz not null default now()
    );
    create table if not exists reports (
      id text primary key,
      client_id text not null references clients(id) on delete cascade,
      date date not null,
      topup numeric,
      spend numeric,
      click numeric,
      impression numeric,
      status varchar(64),
      notes text,
      created_at timestamptz not null default now()
    );
  `;
  mem.public.none(schemaSql);

  return drizzlePg(pool, { schema });
})();

export * as schema from "./schema";
