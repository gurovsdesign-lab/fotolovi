export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: "user" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          role?: "user" | "admin";
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          event_date: string;
          slug: string;
          is_paid: boolean;
          photo_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          event_date: string;
          slug: string;
          is_paid?: boolean;
          photo_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          event_date?: string;
          slug?: string;
          is_paid?: boolean;
          photo_limit?: number;
          updated_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          storage_path: string;
          public_url: string;
          is_hidden: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          storage_path: string;
          public_url: string;
          is_hidden?: boolean;
          uploaded_at?: string;
        };
        Update: {
          is_hidden?: boolean;
        };
      };
      credits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          reason?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
