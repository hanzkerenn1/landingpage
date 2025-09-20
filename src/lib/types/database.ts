// Optional: type placeholders for Supabase tables
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          cid: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          cid?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          client_id: string;
          date: string; // ISO date
          topup: number | null;
          spend: number | null;
          click: number | null;
          impression: number | null;
          status: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          date: string;
          topup?: number | null;
          spend?: number | null;
          click?: number | null;
          impression?: number | null;
          status?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
