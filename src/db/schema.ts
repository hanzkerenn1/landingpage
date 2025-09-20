import { pgTable, text, timestamp, uuid, varchar, numeric, date } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  cid: varchar("cid", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  date: date("date").notNull(),
  topup: numeric("topup"),
  spend: numeric("spend"),
  click: numeric("click"),
  impression: numeric("impression"),
  status: varchar("status", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  hashedPassword: text("hashed_password").notNull(),
  role: varchar("role", { length: 32 }).notNull().default("client"),
  // Link a user with role "client" to a business client
  clientId: uuid("client_id").references(() => clients.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
