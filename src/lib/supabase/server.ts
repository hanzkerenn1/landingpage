import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import type { GetServerSidePropsContext } from "next";
import type { Database } from "../types/database";

export function supabaseServer(ctx: GetServerSidePropsContext) {
  // create a server client bound to SSR cookies
  return createPagesServerClient<Database>(ctx);
}

export function supabaseApi(req: NextApiRequest, res: NextApiResponse) {
  return createPagesServerClient<Database>({ req, res });
}

