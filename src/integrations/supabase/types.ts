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
      agenda_snapshots: {
        Row: {
          created_at: string
          created_by: string | null
          data_agenda: string
          id: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_agenda: string
          id?: string
          snapshot: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_agenda?: string
          id?: string
          snapshot?: Json
        }
        Relationships: []
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
            referencedRelation: "client_service_history"
            referencedColumns: ["client_id"]
          },
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
            referencedRelation: "client_service_history"
            referencedColumns: ["vehicle_id"]
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
          pending_review: boolean
          phone: string
          registration_source: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_spent: number | null
          updated_at: string
          user_id: string | null
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
          pending_review?: boolean
          phone: string
          registration_source?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
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
          pending_review?: boolean
          phone?: string
          registration_source?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          code: string
          created_at: string
          dias_atendimento: string[]
          hora_abertura: string
          hora_fechamento: string
          id: string
          is_active: boolean
          meta_diaria: number | null
          meta_mensal: number | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          dias_atendimento?: string[]
          hora_abertura?: string
          hora_fechamento?: string
          id?: string
          is_active?: boolean
          meta_diaria?: number | null
          meta_mensal?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          dias_atendimento?: string[]
          hora_abertura?: string
          hora_fechamento?: string
          id?: string
          is_active?: boolean
          meta_diaria?: number | null
          meta_mensal?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gestao_alerts: {
        Row: {
          client_id: string | null
          created_at: string
          descricao: string | null
          id: string
          lido: boolean
          lido_em: string | null
          lido_por: string | null
          metadata: Json | null
          service_order_id: string | null
          tipo: string
          titulo: string
          vehicle_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lido?: boolean
          lido_em?: string | null
          lido_por?: string | null
          metadata?: Json | null
          service_order_id?: string | null
          tipo: string
          titulo: string
          vehicle_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lido?: boolean
          lido_em?: string | null
          lido_por?: string | null
          metadata?: Json | null
          service_order_id?: string | null
          tipo?: string
          titulo?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gestao_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_service_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "gestao_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestao_alerts_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "client_service_history"
            referencedColumns: ["service_order_id"]
          },
          {
            foreignKeyName: "gestao_alerts_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestao_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "client_service_history"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "gestao_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mechanics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pendencias: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          mechanic_id: string | null
          prioridade: string | null
          resolved_at: string | null
          resolved_by: string | null
          service_order_id: string | null
          status: string
          tipo: string
          titulo: string
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          mechanic_id?: string | null
          prioridade?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_order_id?: string | null
          status?: string
          tipo?: string
          titulo: string
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          mechanic_id?: string | null
          prioridade?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_order_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pendencias_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pendencias_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "client_service_history"
            referencedColumns: ["service_order_id"]
          },
          {
            foreignKeyName: "pendencias_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          created_at: string
          full_name: string | null
          id: string
          loyalty_level: string
          loyalty_points: number
          must_change_password: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          loyalty_level?: string
          loyalty_points?: number
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          loyalty_level?: string
          loyalty_points?: number
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
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
            referencedRelation: "client_service_history"
            referencedColumns: ["service_order_id"]
          },
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
            referencedRelation: "client_service_history"
            referencedColumns: ["service_order_id"]
          },
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
          em_terceiros: boolean
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
          recurso: string | null
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
          em_terceiros?: boolean
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
          recurso?: string | null
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
          em_terceiros?: boolean
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
          recurso?: string | null
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
            referencedRelation: "client_service_history"
            referencedColumns: ["client_id"]
          },
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
            referencedRelation: "client_service_history"
            referencedColumns: ["vehicle_id"]
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
            referencedRelation: "client_service_history"
            referencedColumns: ["client_id"]
          },
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
      client_service_history: {
        Row: {
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          completed_at: string | null
          diagnosis: string | null
          items: Json | null
          order_date: string | null
          order_number: string | null
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          problem_description: string | null
          service_order_id: string | null
          total: number | null
          total_discount: number | null
          total_labor: number | null
          total_parts: number | null
          user_id: string | null
          vehicle_brand: string | null
          vehicle_color: string | null
          vehicle_id: string | null
          vehicle_km: number | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_entregues: { Args: never; Returns: number }
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
