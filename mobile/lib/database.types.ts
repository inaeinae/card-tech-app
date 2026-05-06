export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      benefits: {
        Row: {
          actual_amount: number | null
          conditions: Json
          created_at: string
          disqualified: boolean
          event_id: string
          expected_amount: number
          id: string
          spend_actual: number | null
          spend_required: number | null
          template_id: string | null
          title: string
          type: Database["public"]["Enums"]["benefit_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          conditions?: Json
          created_at?: string
          disqualified?: boolean
          event_id: string
          expected_amount?: number
          id?: string
          spend_actual?: number | null
          spend_required?: number | null
          template_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["benefit_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          conditions?: Json
          created_at?: string
          disqualified?: boolean
          event_id?: string
          expected_amount?: number
          id?: string
          spend_actual?: number | null
          spend_required?: number | null
          template_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["benefit_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefits_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      card_benefits: {
        Row: {
          card_id: string
          created_at: string
          details: Json
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          details?: Json
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          details?: Json
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_benefits_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          cancel_scheduled_at: string | null
          canceled_at: string | null
          created_at: string
          id: string
          issuer: string
          last_event_at: string | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_scheduled_at?: string | null
          canceled_at?: string | null
          created_at?: string
          id?: string
          issuer: string
          last_event_at?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_scheduled_at?: string | null
          canceled_at?: string | null
          created_at?: string
          id?: string
          issuer?: string
          last_event_at?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_status_history: {
        Row: {
          changed_at: string
          event_id: string
          from_status: Database["public"]["Enums"]["event_status"] | null
          id: number
          is_auto: boolean
          reason: string | null
          to_status: Database["public"]["Enums"]["event_status"]
          user_id: string
        }
        Insert: {
          changed_at?: string
          event_id: string
          from_status?: Database["public"]["Enums"]["event_status"] | null
          id?: number
          is_auto?: boolean
          reason?: string | null
          to_status: Database["public"]["Enums"]["event_status"]
          user_id: string
        }
        Update: {
          changed_at?: string
          event_id?: string
          from_status?: Database["public"]["Enums"]["event_status"] | null
          id?: number
          is_auto?: boolean
          reason?: string | null
          to_status?: Database["public"]["Enums"]["event_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_status_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          apply_end: string | null
          apply_start: string | null
          cancelable_from: string | null
          card_id: string
          created_at: string
          id: string
          notes: string | null
          organizer: string | null
          payout_actual_at: string | null
          payout_expected_at: string | null
          payout_expected_period: string | null
          status: Database["public"]["Enums"]["event_status"]
          status_updated_at: string
          title: string
          updated_at: string
          use_end: string | null
          use_start: string | null
          user_id: string
          warning_dismissed: boolean
        }
        Insert: {
          apply_end?: string | null
          apply_start?: string | null
          cancelable_from?: string | null
          card_id: string
          created_at?: string
          id?: string
          notes?: string | null
          organizer?: string | null
          payout_actual_at?: string | null
          payout_expected_at?: string | null
          payout_expected_period?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          status_updated_at?: string
          title: string
          updated_at?: string
          use_end?: string | null
          use_start?: string | null
          user_id: string
          warning_dismissed?: boolean
        }
        Update: {
          apply_end?: string | null
          apply_start?: string | null
          cancelable_from?: string | null
          card_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          organizer?: string | null
          payout_actual_at?: string | null
          payout_expected_at?: string | null
          payout_expected_period?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          status_updated_at?: string
          title?: string
          updated_at?: string
          use_end?: string | null
          use_start?: string | null
          user_id?: string
          warning_dismissed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          global_enabled: boolean
          kinds_enabled: Json
          time_of_day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          global_enabled?: boolean
          kinds_enabled?: Json
          time_of_day?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          global_enabled?: boolean
          kinds_enabled?: Json
          time_of_day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nickname: string | null
          notify_enabled: boolean
          notify_time_of_day: string
          preferred_issuer: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nickname?: string | null
          notify_enabled?: boolean
          notify_time_of_day?: string
          preferred_issuer?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string | null
          notify_enabled?: boolean
          notify_time_of_day?: string
          preferred_issuer?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          body: string
          canceled: boolean
          created_at: string
          delivered_at: string | null
          event_id: string | null
          fire_at: string
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          title: string
          user_id: string
        }
        Insert: {
          body: string
          canceled?: boolean
          created_at?: string
          delivered_at?: string | null
          event_id?: string | null
          fire_at: string
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          title: string
          user_id: string
        }
        Update: {
          body?: string
          canceled?: boolean
          created_at?: string
          delivered_at?: string | null
          event_id?: string | null
          fire_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      benefit_type: "cashback" | "discount" | "payback" | "other"
      event_status:
        | "registered"
        | "applied"
        | "in_progress"
        | "performance_done"
        | "pending_payout"
        | "paid"
        | "cancelable"
        | "canceled"
      notification_kind:
        | "apply_deadline"
        | "performance_check"
        | "payout_upcoming"
        | "cancel_available"
        | "autopay_check"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      benefit_type: ["cashback", "discount", "payback", "other"],
      event_status: [
        "registered",
        "applied",
        "in_progress",
        "performance_done",
        "pending_payout",
        "paid",
        "cancelable",
        "canceled",
      ],
      notification_kind: [
        "apply_deadline",
        "performance_check",
        "payout_upcoming",
        "cancel_available",
        "autopay_check",
      ],
    },
  },
} as const

