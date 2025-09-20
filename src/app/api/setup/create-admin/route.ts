import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as
      | { username?: string; password?: string; email?: string }
      | null;

    const username = body?.username?.trim();
    const password = body?.password ?? "";
    const email = body?.email?.trim() || undefined;

    if (!username || !password) {
      return NextResponse.json({ message: "username and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password too short" }, { status: 400 });
    }

    // Check if an admin already exists
    const existingAdmin = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    if (existingAdmin[0]) {
      return NextResponse.json({ message: "Admin already exists" }, { status: 403 });
    }

    const id = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      id,
      username,
      email,
      hashedPassword: hashed,
      role: "admin",
    });

    return NextResponse.json({ message: "Admin created" }, { status: 201 });
  } catch (_e) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
