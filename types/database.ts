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
          guest_access_code_enabled: boolean;
          guest_access_code: string | null;
          guest_access_mode: "upload_only" | "upload_view" | "upload_view_download";
          moderation_mode: "show_immediately" | "premoderation";
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
          guest_access_code_enabled?: boolean;
          guest_access_code?: string | null;
          guest_access_mode?: "upload_only" | "upload_view" | "upload_view_download";
          moderation_mode?: "show_immediately" | "premoderation";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          event_date?: string;
          slug?: string;
          is_paid?: boolean;
          photo_limit?: number;
          guest_access_code_enabled?: boolean;
          guest_access_code?: string | null;
          guest_access_mode?: "upload_only" | "upload_view" | "upload_view_download";
          moderation_mode?: "show_immediately" | "premoderation";
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
      premium_requests: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          package_events: number;
          package_total_price: number | null;
          contact: string;
          preferred_communication: string;
          comment: string | null;
          status: "pending" | "fulfilled" | "canceled";
          processed_at: string | null;
          processed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id: string;
          package_events: number;
          package_total_price?: number | null;
          contact: string;
          preferred_communication: string;
          comment?: string | null;
          status?: "pending" | "fulfilled" | "canceled";
          processed_at?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "fulfilled" | "canceled";
          processed_at?: string | null;
          processed_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
