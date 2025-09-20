import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const lucia = new Lucia(
  new DrizzlePostgreSQLAdapter(db, sessions, users),
  {
    sessionCookie: {
      name: "session",
      attributes: { secure: process.env.NODE_ENV === "production" },
    },
    getUserAttributes: (user) => ({
      username: user.username,
      email: user.email,
      role: user.role,
      clientId: user.clientId ?? null,
    }),
  }
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: { username: string; email: string | null; role: string; clientId: string | null };
  }
}
