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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agenda_mecanicos: {
        Row: {
          created_at: string
          data: string
          hora_inicio: string
          id: string
          mechanic_id: string
          status: string
          tipo: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          data: string
          hora_inicio: string
          id?: string
          mechanic_id: string
          status?: string
          tipo?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          data?: string
          hora_inicio?: string
          id?: string
          mechanic_id?: string
          status?: string
          tipo?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_mecanicos_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          client_id: string
          confirmed_at: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          origin: string | null
          scheduled_date: string
          scheduled_time: string
          service_type: string
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          client_id: string
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          scheduled_date: string
          scheduled_time: string
          service_type: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          client_id?: string
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          scheduled_date?: string
          scheduled_time?: string
          service_type?: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          last_service_date: string | null
          name: string
          notes: string | null
          phone: string
          status: string
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_service_date?: string | null
          name: string
          notes?: string | null
          phone: string
          status?: string
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_service_date?: string | null
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mechanic_daily_feedback: {
        Row: {
          created_at: string
          feedback_date: string
          given_by: string | null
          id: string
          mechanic_id: string
          notes: string | null
          performance_score: number
          punctuality_score: number
          quality_score: number
        }
        Insert: {
          created_at?: string
          feedback_date: string
          given_by?: string | null
          id?: string
          mechanic_id: string
          notes?: string | null
          performance_score: number
          punctuality_score: number
          quality_score: number
        }
        Update: {
          created_at?: string
          feedback_date?: string
          given_by?: string | null
          id?: string
          mechanic_id?: string
          notes?: string | null
          performance_score?: number
          punctuality_score?: number
          quality_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_daily_feedback_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanics: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_order_history: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          service_order_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          service_order_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          service_order_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_order_history_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_items: {
        Row: {
          created_at: string
          description: string
          id: string
          notes: string | null
          priority: string | null
          quantity: number | null
          service_order_id: string
          status: string | null
          total_price: number
          type: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          priority?: string | null
          quantity?: number | null
          service_order_id: string
          status?: string | null
          total_price: number
          type: string
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          priority?: string | null
          quantity?: number | null
          service_order_id?: string
          status?: string | null
          total_price?: number
          type?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_order_items_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          diagnosis: string | null
          entry_checklist: Json | null
          entry_km: number | null
          estimated_completion: string | null
          id: string
          mechanic_id: string | null
          observations: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          priority: string | null
          problem_description: string | null
          status: string
          total: number | null
          total_discount: number | null
          total_labor: number | null
          total_parts: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          entry_checklist?: Json | null
          entry_km?: number | null
          estimated_completion?: string | null
          id?: string
          mechanic_id?: string | null
          observations?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          problem_description?: string | null
          status?: string
          total?: number | null
          total_discount?: number | null
          total_labor?: number | null
          total_parts?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          entry_checklist?: Json | null
          entry_km?: number | null
          estimated_completion?: string | null
          id?: string
          mechanic_id?: string | null
          observations?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          problem_description?: string | null
          status?: string
          total?: number | null
          total_discount?: number | null
          total_labor?: number | null
          total_parts?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vehicles: {
        Row: {
          brand: string
          chassis: string | null
          client_id: string
          color: string | null
          created_at: string
          fuel_type: string | null
          id: string
          is_active: boolean | null
          km: number | null
          model: string
          notes: string | null
          plate: string
          updated_at: string
          year: number | null
        }
        Insert: {
          brand: string
          chassis?: string | null
          client_id: string
          color?: string | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          is_active?: boolean | null
          km?: number | null
          model: string
          notes?: string | null
          plate: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          brand?: string
          chassis?: string | null
          client_id?: string
          color?: string | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          is_active?: boolean | null
          km?: number | null
          model?: string
          notes?: string | null
          plate?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_etapas: {
        Row: {
          cor: string
          created_at: string
          icone: string
          id: string
          is_active: boolean
          nome: string
          ordem: number
        }
        Insert: {
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          is_active?: boolean
          nome: string
          ordem: number
        }
        Update: {
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          is_active?: boolean
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "gestao" | "dev"
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
      app_role: ["user", "admin", "gestao", "dev"],
    },
  },
} as const
