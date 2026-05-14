export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
          target_id: string
          target_label: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          id?: string
          target_id: string
          target_label?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
          target_id?: string
          target_label?: string | null
          target_type?: string
        }
        Relationships: []
      }
      blood_requests: {
        Row: {
          admin_status: string
          attendant_name: string
          attendant_phone: string
          blood_group: string
          component: string
          created_at: string
          created_by: string | null
          hospital: string
          id: string
          locality: string
          patient_age: string | null
          proof_uploaded: boolean
          status: Database["public"]["Enums"]["request_status"]
          units: number
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          admin_status?: string
          attendant_name: string
          attendant_phone: string
          blood_group: string
          component?: string
          created_at?: string
          created_by?: string | null
          hospital: string
          id?: string
          locality: string
          patient_age?: string | null
          proof_uploaded?: boolean
          status?: Database["public"]["Enums"]["request_status"]
          units?: number
          updated_at?: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          admin_status?: string
          attendant_name?: string
          attendant_phone?: string
          blood_group?: string
          component?: string
          created_at?: string
          created_by?: string | null
          hospital?: string
          id?: string
          locality?: string
          patient_age?: string | null
          proof_uploaded?: boolean
          status?: Database["public"]["Enums"]["request_status"]
          units?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      donation_intents: {
        Row: {
          amount: number
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      donor_availability: {
        Row: {
          active: boolean
          emergency_only: boolean
          id: string
          notify_push: boolean
          notify_sms: boolean
          notify_whatsapp: boolean
          quiet_hours: boolean
          radius_km: number
          slot_afternoon: boolean
          slot_evening: boolean
          slot_morning: boolean
          slot_night: boolean
          updated_at: string
          user_id: string
          weekdays: boolean
          weekends: boolean
        }
        Insert: {
          active?: boolean
          emergency_only?: boolean
          id?: string
          notify_push?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          quiet_hours?: boolean
          radius_km?: number
          slot_afternoon?: boolean
          slot_evening?: boolean
          slot_morning?: boolean
          slot_night?: boolean
          updated_at?: string
          user_id: string
          weekdays?: boolean
          weekends?: boolean
        }
        Update: {
          active?: boolean
          emergency_only?: boolean
          id?: string
          notify_push?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          quiet_hours?: boolean
          radius_km?: number
          slot_afternoon?: boolean
          slot_evening?: boolean
          slot_morning?: boolean
          slot_night?: boolean
          updated_at?: string
          user_id?: string
          weekdays?: boolean
          weekends?: boolean
        }
        Relationships: []
      }
      donors: {
        Row: {
          blood_group: string
          created_at: string
          full_name: string
          id: string
          last_donation_date: string | null
          locality: string
          phone: string
          pincode: string
          profession: string | null
          reliability_score: number
          status: string
          total_donations: number
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          blood_group: string
          created_at?: string
          full_name: string
          id?: string
          last_donation_date?: string | null
          locality: string
          phone: string
          pincode: string
          profession?: string | null
          reliability_score?: number
          status?: string
          total_donations?: number
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          blood_group?: string
          created_at?: string
          full_name?: string
          id?: string
          last_donation_date?: string | null
          locality?: string
          phone?: string
          pincode?: string
          profession?: string | null
          reliability_score?: number
          status?: string
          total_donations?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      request_matches: {
        Row: {
          available_in_hours: number | null
          created_at: string
          decision: Database["public"]["Enums"]["match_decision"]
          donor_user_id: string
          id: string
          request_id: string
        }
        Insert: {
          available_in_hours?: number | null
          created_at?: string
          decision: Database["public"]["Enums"]["match_decision"]
          donor_user_id: string
          id?: string
          request_id: string
        }
        Update: {
          available_in_hours?: number | null
          created_at?: string
          decision?: Database["public"]["Enums"]["match_decision"]
          donor_user_id?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "donor" | "user"
      match_decision: "accepted" | "declined" | "later"
      request_status: "pending" | "matching" | "fulfilled" | "cancelled"
      urgency_level: "critical" | "within-2h" | "within-24h" | "planned"
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
  public: {
    Enums: {
      app_role: ["admin", "donor", "user"],
      match_decision: ["accepted", "declined", "later"],
      request_status: ["pending", "matching", "fulfilled", "cancelled"],
      urgency_level: ["critical", "within-2h", "within-24h", "planned"],
    },
  },
} as const
