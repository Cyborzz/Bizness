export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: "super_admin" | "business_owner" | "staff";
          business_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "super_admin" | "business_owner" | "staff";
          business_id?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: "super_admin" | "business_owner" | "staff";
          business_id?: string | null;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          card_style: "gradient" | "solid" | "glass";
          welcome_message: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          business_type: string | null;
          loyalty_type: "stamps" | "points";
          stamps_required: number;
          points_required: number;
          stamp_cooldown_minutes: number;
          birthday_reward_enabled: boolean;
          reward_label: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          card_style?: "gradient" | "solid" | "glass";
          welcome_message?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          business_type?: string | null;
          loyalty_type?: "stamps" | "points";
          stamps_required?: number;
          points_required?: number;
          stamp_cooldown_minutes?: number;
          birthday_reward_enabled?: boolean;
          reward_label?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          user_agent: string | null;
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          user_agent?: string | null;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Insert"]>;
      };
      offers: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          body: string;
          image_url: string | null;
          cta_url: string | null;
          status: "draft" | "sent" | "cancelled";
          created_at: string;
          sent_at: string | null;
          recipient_count: number;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          body: string;
          image_url?: string | null;
          cta_url?: string | null;
          status?: "draft" | "sent" | "cancelled";
          created_at?: string;
          sent_at?: string | null;
          recipient_count?: number;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["offers"]["Insert"]>;
      };
      deletion_requests: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          reason: string | null;
          status: "pending" | "processed" | "cancelled";
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          reason?: string | null;
          status?: "pending" | "processed" | "cancelled";
          created_at?: string;
          processed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["deletion_requests"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          first_name: string;
          last_name: string | null;
          phone: string | null;
          email: string | null;
          birthdate: string | null;
          birth_month: number | null;
          birth_day: number | null;
          consent_loyalty: boolean;
          consent_marketing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          first_name: string;
          last_name?: string | null;
          phone?: string | null;
          email?: string | null;
          birthdate?: string | null;
          consent_loyalty?: boolean;
          consent_marketing?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      notification_log: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          kind: "birthday" | "almost_there";
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          kind: "birthday" | "almost_there";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification_log"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          business_name: string | null;
          business_type: string | null;
          message: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          business_name?: string | null;
          business_type?: string | null;
          message?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      loyalty_cards: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          current_stamps: number;
          total_stamps: number;
          rewards_available: number;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          current_stamps?: number;
          total_stamps?: number;
          rewards_available?: number;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["loyalty_cards"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          card_id: string;
          type:
            | "card_created"
            | "stamp_added"
            | "stamp_removed"
            | "reward_earned"
            | "reward_redeemed"
            | "customer_deleted";
          value: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          card_id: string;
          type:
            | "card_created"
            | "stamp_added"
            | "stamp_removed"
            | "reward_earned"
            | "reward_redeemed"
            | "customer_deleted";
          value?: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
