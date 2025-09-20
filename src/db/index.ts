import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { newDb } from "pg-mem";
import { Pool } from "pg";

function resolveConnectionString(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_CONNECTION_STRING
  );
}
const connectionString = resolveConnectionString();

export const db = (() => {
  if (connectionString) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[db] Using Neon HTTP with DATABASE_URL in", process.env.NODE_ENV);
    }
    const sql = neon(connectionString);
    return drizzleNeon(sql, { schema });
  }
  // In-memory Postgres (pg-mem) fallback for local/dev without external DB
  if (process.env.NODE_ENV !== "production") {
    console.log("[db] Using pg-mem in-memory database (no DATABASE_URL)");
  }
  const mem = newDb();
  const { Pool: MemPool } = mem.adapters.createPg();
  const pool: Pool = new MemPool();
  // Create schema tables (simplified, without extensions/default uuid)
  const schemaSql = `
    create table if not exists clients (
      id text primary key,
      name varchar(255) not null,
      email varchar(255),
      cid varchar(64),
      notes text,
      created_at timestamptz not null default now()
    );
    create table if not exists users (
      id text primary key,
      username varchar(64) not null unique,
      email varchar(255),
      hashed_password text not null,
      role varchar(32) not null default 'client',
      client_id text references clients(id),
      created_at timestamptz not null default now()
    );
    create table if not exists sessions (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      expires_at timestamptz not null
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

  if (process.env.NODE_ENV !== "production") {
    console.log("[db] pg-mem schema initialized");
  }

  return drizzlePg(pool, { schema });
})();

export * as schema from "./schema";
