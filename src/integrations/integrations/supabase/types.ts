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
      action_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agenda_mecanicos: {
        Row: {
          appointment_id: string | null
          created_at: string
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          mechanic_id: string
          notas: string | null
          status: string
          tipo: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          mechanic_id: string
          notas?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          mechanic_id?: string
          notas?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_mecanicos_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_mecanicos_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_mecanicos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_clicks: {
        Row: {
          action: string
          alert_id: string
          clicked_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          action?: string
          alert_id: string
          clicked_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          action?: string
          alert_id?: string
          clicked_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_clicks_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          appointment_id: string | null
          created_at: string
          due_date: string
          id: string
          is_automatic: boolean
          message: string | null
          pending_items: Json | null
          read_at: string | null
          seasonal_tag: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["alert_status"]
          target_type: Database["public"]["Enums"]["alert_target"]
          title: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          appointment_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          is_automatic?: boolean
          message?: string | null
          pending_items?: Json | null
          read_at?: string | null
          seasonal_tag?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          target_type?: Database["public"]["Enums"]["alert_target"]
          title: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          appointment_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          is_automatic?: boolean
          message?: string | null
          pending_items?: Json | null
          read_at?: string | null
          seasonal_tag?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          target_type?: Database["public"]["Enums"]["alert_target"]
          title?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          price_at_booking: number
          service_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          price_at_booking?: number
          service_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          price_at_booking?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          actual_completion: string | null
          appointment_date: string
          appointment_time: string | null
          checklist_photos: string[] | null
          client_notified: boolean | null
          created_at: string
          discount_amount: number
          estimated_completion: string | null
          final_price: number
          id: string
          is_full_day: boolean
          mechanic_id: string | null
          mechanic_notes: string | null
          notes: string | null
          pay_in_advance: boolean
          promotion_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          subtotal: number
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          actual_completion?: string | null
          appointment_date: string
          appointment_time?: string | null
          checklist_photos?: string[] | null
          client_notified?: boolean | null
          created_at?: string
          discount_amount?: number
          estimated_completion?: string | null
          final_price?: number
          id?: string
          is_full_day?: boolean
          mechanic_id?: string | null
          mechanic_notes?: string | null
          notes?: string | null
          pay_in_advance?: boolean
          promotion_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          subtotal?: number
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          actual_completion?: string | null
          appointment_date?: string
          appointment_time?: string | null
          checklist_photos?: string[] | null
          client_notified?: boolean | null
          created_at?: string
          discount_amount?: number
          estimated_completion?: string | null
          final_price?: number
          id?: string
          is_full_day?: boolean
          mechanic_id?: string | null
          mechanic_notes?: string | null
          notes?: string | null
          pay_in_advance?: boolean
          promotion_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          subtotal?: number
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
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
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          nome: string
          razao_social: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          nome: string
          razao_social?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          nome?: string
          razao_social?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_clicks: {
        Row: {
          clicked_at: string
          event_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          event_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          event_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_clicks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_active: boolean
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faturamento: {
        Row: {
          appointment_id: string
          created_at: string
          data_entrega: string
          id: string
          mechanic_id: string | null
          valor: number
          vehicle_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          data_entrega: string
          id?: string
          mechanic_id?: string | null
          valor: number
          vehicle_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          data_entrega?: string
          id?: string
          mechanic_id?: string | null
          valor?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["funnel_step"]
          flow_type: string
          id: string
          promotion_id: string | null
          session_id: string
          step_number: number
          total_steps: number
          user_id: string | null
          vehicle_model: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["funnel_step"]
          flow_type: string
          id?: string
          promotion_id?: string | null
          session_id: string
          step_number: number
          total_steps: number
          user_id?: string | null
          vehicle_model?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["funnel_step"]
          flow_type?: string
          id?: string
          promotion_id?: string | null
          session_id?: string
          step_number?: number
          total_steps?: number
          user_id?: string | null
          vehicle_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      gestao_dados_manuais: {
        Row: {
          chave: string
          created_at: string | null
          data_referencia: string | null
          id: string
          valor: string
          widget_id: string | null
        }
        Insert: {
          chave: string
          created_at?: string | null
          data_referencia?: string | null
          id?: string
          valor: string
          widget_id?: string | null
        }
        Update: {
          chave?: string
          created_at?: string | null
          data_referencia?: string | null
          id?: string
          valor?: string
          widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gestao_dados_manuais_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "gestao_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      gestao_dashboards: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gestao_widgets: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          dashboard_id: string
          fonte_dados: string
          icone: string | null
          id: string
          ordem: number | null
          query_config: Json | null
          tamanho: string | null
          tipo: Database["public"]["Enums"]["widget_type"]
          titulo: string
          updated_at: string | null
          valor_fixo: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          dashboard_id: string
          fonte_dados: string
          icone?: string | null
          id?: string
          ordem?: number | null
          query_config?: Json | null
          tamanho?: string | null
          tipo?: Database["public"]["Enums"]["widget_type"]
          titulo: string
          updated_at?: string | null
          valor_fixo?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          dashboard_id?: string
          fonte_dados?: string
          icone?: string | null
          id?: string
          ordem?: number | null
          query_config?: Json | null
          tamanho?: string | null
          tipo?: Database["public"]["Enums"]["widget_type"]
          titulo?: string
          updated_at?: string | null
          valor_fixo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gestao_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "gestao_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      mechanic_daily_feedback: {
        Row: {
          created_at: string
          feedback_date: string
          given_by: string | null
          id: string
          mechanic_id: string | null
          notes: string | null
          performance_score: number | null
          punctuality_score: number | null
          quality_score: number | null
        }
        Insert: {
          created_at?: string
          feedback_date?: string
          given_by?: string | null
          id?: string
          mechanic_id?: string | null
          notes?: string | null
          performance_score?: number | null
          punctuality_score?: number | null
          quality_score?: number | null
        }
        Update: {
          created_at?: string
          feedback_date?: string
          given_by?: string | null
          id?: string
          mechanic_id?: string | null
          notes?: string | null
          performance_score?: number | null
          punctuality_score?: number | null
          quality_score?: number | null
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
          cpf: string | null
          created_at: string
          email: string | null
          grau_conhecimento: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          qtde_negativos: number | null
          qtde_positivos: number | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          grau_conhecimento?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          qtde_negativos?: number | null
          qtde_positivos?: number | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          grau_conhecimento?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          qtde_negativos?: number | null
          qtde_positivos?: number | null
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
      melhorias_sugestoes: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string
          id: string
          prioridade: string | null
          status: string | null
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao: string
          id?: string
          prioridade?: string | null
          status?: string | null
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string
          id?: string
          prioridade?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      metas_financeiras: {
        Row: {
          ano: number
          created_at: string
          created_by: string | null
          dias_trabalhados: number
          dias_uteis: number
          id: string
          mes: number
          meta_faturamento: number
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          created_by?: string | null
          dias_trabalhados?: number
          dias_uteis?: number
          id?: string
          mes: number
          meta_faturamento?: number
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          created_by?: string | null
          dias_trabalhados?: number
          dias_uteis?: number
          id?: string
          mes?: number
          meta_faturamento?: number
          updated_at?: string
        }
        Relationships: []
      }
      metas_mecanicos: {
        Row: {
          ano: number
          created_at: string
          id: string
          mechanic_id: string
          mes: number
          meta_mensal: number
          meta_semanal: number
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          mechanic_id: string
          mes: number
          meta_mensal?: number
          meta_semanal?: number
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          mechanic_id?: string
          mes?: number
          meta_mensal?: number
          meta_semanal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metas_mecanicos_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
        ]
      }
      oficina_config: {
        Row: {
          capacidade_maxima: number
          created_at: string
          horario_almoco_fim: string
          horario_almoco_inicio: string
          horario_entrada: string
          horario_saida_sabado: string
          horario_saida_semana: string
          id: string
          logo_url: string | null
          margem_minima_pecas: number | null
          margem_minima_servicos: number | null
          nome: string
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          capacidade_maxima?: number
          created_at?: string
          horario_almoco_fim?: string
          horario_almoco_inicio?: string
          horario_entrada?: string
          horario_saida_sabado?: string
          horario_saida_semana?: string
          id?: string
          logo_url?: string | null
          margem_minima_pecas?: number | null
          margem_minima_servicos?: number | null
          nome?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          capacidade_maxima?: number
          created_at?: string
          horario_almoco_fim?: string
          horario_almoco_inicio?: string
          horario_entrada?: string
          horario_saida_sabado?: string
          horario_saida_semana?: string
          id?: string
          logo_url?: string | null
          margem_minima_pecas?: number | null
          margem_minima_servicos?: number | null
          nome?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          appointment_id: string | null
          checklist_dinamometro: Json | null
          checklist_entrada: Json | null
          checklist_precompra: Json | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          created_by: string | null
          data_aprovacao: string | null
          data_conclusao: string | null
          data_entrada: string | null
          data_entrega: string | null
          data_orcamento: string | null
          descricao_problema: string | null
          diagnostico: string | null
          enviado_gestao: boolean | null
          enviado_gestao_em: string | null
          fotos_entrada: string[] | null
          google_drive_link: string | null
          id: string
          km_atual: string | null
          mechanic_id: string | null
          motivo_recusa: string | null
          numero_os: string
          observacoes: string | null
          plate: string
          remarketing_data_prevista: string | null
          remarketing_status: string | null
          scanner_avarias: string | null
          status: string
          trello_card_id: string | null
          trello_card_url: string | null
          updated_at: string
          valor_aprovado: number | null
          valor_final: number | null
          valor_orcado: number | null
          vehicle: string
        }
        Insert: {
          appointment_id?: string | null
          checklist_dinamometro?: Json | null
          checklist_entrada?: Json | null
          checklist_precompra?: Json | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          data_conclusao?: string | null
          data_entrada?: string | null
          data_entrega?: string | null
          data_orcamento?: string | null
          descricao_problema?: string | null
          diagnostico?: string | null
          enviado_gestao?: boolean | null
          enviado_gestao_em?: string | null
          fotos_entrada?: string[] | null
          google_drive_link?: string | null
          id?: string
          km_atual?: string | null
          mechanic_id?: string | null
          motivo_recusa?: string | null
          numero_os: string
          observacoes?: string | null
          plate: string
          remarketing_data_prevista?: string | null
          remarketing_status?: string | null
          scanner_avarias?: string | null
          status?: string
          trello_card_id?: string | null
          trello_card_url?: string | null
          updated_at?: string
          valor_aprovado?: number | null
          valor_final?: number | null
          valor_orcado?: number | null
          vehicle: string
        }
        Update: {
          appointment_id?: string | null
          checklist_dinamometro?: Json | null
          checklist_entrada?: Json | null
          checklist_precompra?: Json | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          data_aprovacao?: string | null
          data_conclusao?: string | null
          data_entrada?: string | null
          data_entrega?: string | null
          data_orcamento?: string | null
          descricao_problema?: string | null
          diagnostico?: string | null
          enviado_gestao?: boolean | null
          enviado_gestao_em?: string | null
          fotos_entrada?: string[] | null
          google_drive_link?: string | null
          id?: string
          km_atual?: string | null
          mechanic_id?: string | null
          motivo_recusa?: string | null
          numero_os?: string
          observacoes?: string | null
          plate?: string
          remarketing_data_prevista?: string | null
          remarketing_status?: string | null
          scanner_avarias?: string | null
          status?: string
          trello_card_id?: string | null
          trello_card_url?: string | null
          updated_at?: string
          valor_aprovado?: number | null
          valor_final?: number | null
          valor_orcado?: number | null
          vehicle?: string
        }
        Relationships: []
      }
      ordens_servico_itens: {
        Row: {
          created_at: string
          data_retorno_estimada: string | null
          descricao: string
          id: string
          justificativa_desconto: string | null
          margem_aplicada: number | null
          motivo_recusa: string | null
          ordem_servico_id: string
          prioridade: string | null
          quantidade: number | null
          status: string
          tipo: string
          valor_custo: number | null
          valor_total: number | null
          valor_unitario: number | null
          valor_venda_sugerido: number | null
        }
        Insert: {
          created_at?: string
          data_retorno_estimada?: string | null
          descricao: string
          id?: string
          justificativa_desconto?: string | null
          margem_aplicada?: number | null
          motivo_recusa?: string | null
          ordem_servico_id: string
          prioridade?: string | null
          quantidade?: number | null
          status?: string
          tipo?: string
          valor_custo?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
          valor_venda_sugerido?: number | null
        }
        Update: {
          created_at?: string
          data_retorno_estimada?: string | null
          descricao?: string
          id?: string
          justificativa_desconto?: string | null
          margem_aplicada?: number | null
          motivo_recusa?: string | null
          ordem_servico_id?: string
          prioridade?: string | null
          quantidade?: number | null
          status?: string
          tipo?: string
          valor_custo?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
          valor_venda_sugerido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_itens_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      patio_daily_feedback: {
        Row: {
          bottlenecks: string | null
          created_at: string
          feedback_date: string
          flow_score: number | null
          given_by: string | null
          highlights: string | null
          id: string
          improvements: string | null
          incidents_count: number | null
          organization_score: number | null
        }
        Insert: {
          bottlenecks?: string | null
          created_at?: string
          feedback_date?: string
          flow_score?: number | null
          given_by?: string | null
          highlights?: string | null
          id?: string
          improvements?: string | null
          incidents_count?: number | null
          organization_score?: number | null
        }
        Update: {
          bottlenecks?: string | null
          created_at?: string
          feedback_date?: string
          flow_score?: number | null
          given_by?: string | null
          highlights?: string | null
          id?: string
          improvements?: string | null
          incidents_count?: number | null
          organization_score?: number | null
        }
        Relationships: []
      }
      patio_feedback: {
        Row: {
          capacidade_media: number | null
          created_at: string
          data: string
          gargalos_identificados: string[] | null
          given_by: string | null
          id: string
          observacoes: string | null
          problemas: string | null
          sugestoes: string | null
        }
        Insert: {
          capacidade_media?: number | null
          created_at?: string
          data: string
          gargalos_identificados?: string[] | null
          given_by?: string | null
          id?: string
          observacoes?: string | null
          problemas?: string | null
          sugestoes?: string | null
        }
        Update: {
          capacidade_media?: number | null
          created_at?: string
          data?: string
          gargalos_identificados?: string[] | null
          given_by?: string | null
          id?: string
          observacoes?: string | null
          problemas?: string | null
          sugestoes?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          cep: string | null
          cidade: string | null
          company_id: string | null
          cpf: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          full_name: string | null
          id: string
          internal_notes: string | null
          is_recurrent: boolean | null
          lifetime_value: number | null
          loyalty_level: string | null
          loyalty_points: number | null
          origem_cadastro: string | null
          phone: string | null
          priority_score: number | null
          referral_cashback_applied: boolean | null
          referral_source: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          cep?: string | null
          cidade?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          is_recurrent?: boolean | null
          lifetime_value?: number | null
          loyalty_level?: string | null
          loyalty_points?: number | null
          origem_cadastro?: string | null
          phone?: string | null
          priority_score?: number | null
          referral_cashback_applied?: boolean | null
          referral_source?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          cep?: string | null
          cidade?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          is_recurrent?: boolean | null
          lifetime_value?: number | null
          loyalty_level?: string | null
          loyalty_points?: number | null
          origem_cadastro?: string | null
          phone?: string | null
          priority_score?: number | null
          referral_cashback_applied?: boolean | null
          referral_source?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_clicks: {
        Row: {
          clicked_at: string
          id: string
          promotion_id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          promotion_id: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          promotion_id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_clicks_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          available_dates: string[] | null
          created_at: string
          description: string | null
          discount_label: string
          discount_percent: number
          id: string
          is_active: boolean
          service_id: string | null
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
          vehicle_models: string[] | null
        }
        Insert: {
          available_dates?: string[] | null
          created_at?: string
          description?: string | null
          discount_label: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          service_id?: string | null
          title: string
          updated_at?: string
          valid_from: string
          valid_to: string
          vehicle_models?: string[] | null
        }
        Update: {
          available_dates?: string[] | null
          created_at?: string
          description?: string | null
          discount_label?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          service_id?: string | null
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
          vehicle_models?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_leads: {
        Row: {
          appointment_id: string | null
          cancellation_reason: string | null
          client_name: string
          contacted_at: string | null
          created_at: string
          id: string
          notes: string | null
          original_date: string | null
          original_service: string | null
          phone: string
          recovered_at: string | null
          recovery_status: string
          updated_at: string
          user_id: string
          vehicle_info: string | null
        }
        Insert: {
          appointment_id?: string | null
          cancellation_reason?: string | null
          client_name: string
          contacted_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          original_date?: string | null
          original_service?: string | null
          phone: string
          recovered_at?: string | null
          recovery_status?: string
          updated_at?: string
          user_id: string
          vehicle_info?: string | null
        }
        Update: {
          appointment_id?: string | null
          cancellation_reason?: string | null
          client_name?: string
          contacted_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          original_date?: string | null
          original_service?: string | null
          phone?: string
          recovered_at?: string | null
          recovery_status?: string
          updated_at?: string
          user_id?: string
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recovery_leads_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos: {
        Row: {
          company_id: string | null
          created_at: string
          horas_mes: number | null
          id: string
          nome: string
          ocupado_desde: string | null
          status: string
          tipo: string
          ultima_manutencao: string | null
          updated_at: string
          valor_produzido: number | null
          vehicle_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          horas_mes?: number | null
          id?: string
          nome: string
          ocupado_desde?: string | null
          status?: string
          tipo: string
          ultima_manutencao?: string | null
          updated_at?: string
          valor_produzido?: number | null
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          horas_mes?: number | null
          id?: string
          nome?: string
          ocupado_desde?: string | null
          status?: string
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
          valor_produzido?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_campaigns: {
        Row: {
          cashback_points: number
          code: string
          created_at: string
          current_uses: number
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          cashback_points?: number
          code: string
          created_at?: string
          current_uses?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          cashback_points?: number
          code?: string
          created_at?: string
          current_uses?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      service_history: {
        Row: {
          client_name: string | null
          client_phone: string | null
          created_at: string
          created_by: string | null
          entry_date: string | null
          exit_date: string | null
          id: string
          plate: string
          service_description: string | null
          trello_card_id: string | null
          trello_card_url: string | null
          vehicle: string
        }
        Insert: {
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          entry_date?: string | null
          exit_date?: string | null
          id?: string
          plate: string
          service_description?: string | null
          trello_card_id?: string | null
          trello_card_url?: string | null
          vehicle: string
        }
        Update: {
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          entry_date?: string | null
          exit_date?: string | null
          id?: string
          plate?: string
          service_description?: string | null
          trello_card_id?: string | null
          trello_card_url?: string | null
          vehicle?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          is_full_day: boolean
          name: string
          price: number
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_full_day?: boolean
          name: string
          price?: number
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_full_day?: boolean
          name?: string
          price?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          appointment_id: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          appointment_id?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          appointment_id?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
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
      vehicle_workflow_history: {
        Row: {
          appointment_id: string | null
          changed_by: string | null
          created_at: string
          etapa_anterior_id: string | null
          etapa_atual_id: string | null
          id: string
          notas: string | null
          tempo_na_etapa_minutos: number | null
          vehicle_id: string
        }
        Insert: {
          appointment_id?: string | null
          changed_by?: string | null
          created_at?: string
          etapa_anterior_id?: string | null
          etapa_atual_id?: string | null
          id?: string
          notas?: string | null
          tempo_na_etapa_minutos?: number | null
          vehicle_id: string
        }
        Update: {
          appointment_id?: string | null
          changed_by?: string | null
          created_at?: string
          etapa_anterior_id?: string | null
          etapa_atual_id?: string | null
          id?: string
          notas?: string | null
          tempo_na_etapa_minutos?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_workflow_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_workflow_history_etapa_anterior_id_fkey"
            columns: ["etapa_anterior_id"]
            isOneToOne: false
            referencedRelation: "workflow_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_workflow_history_etapa_atual_id_fkey"
            columns: ["etapa_atual_id"]
            isOneToOne: false
            referencedRelation: "workflow_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_workflow_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          color: string | null
          combustivel: string | null
          created_at: string
          id: string
          is_active: boolean
          km_atual: number | null
          model: string
          origem_contato: string | null
          plate: string
          ultimo_km: number | null
          updated_at: string
          user_id: string
          versao: string | null
          year: string | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          combustivel?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          km_atual?: number | null
          model: string
          origem_contato?: string | null
          plate: string
          ultimo_km?: number | null
          updated_at?: string
          user_id: string
          versao?: string | null
          year?: string | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          combustivel?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          km_atual?: number | null
          model?: string
          origem_contato?: string | null
          plate?: string
          ultimo_km?: number | null
          updated_at?: string
          user_id?: string
          versao?: string | null
          year?: string | null
        }
        Relationships: []
      }
      waitlist_interests: {
        Row: {
          created_at: string
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workflow_etapas: {
        Row: {
          cor: string
          created_at: string
          icone: string | null
          id: string
          is_active: boolean
          nome: string
          ordem: number
        }
        Insert: {
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          is_active?: boolean
          nome: string
          ordem: number
        }
        Update: {
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
    }
    Views: {
      profiles_client_view: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aplicar_regras_automacao: { Args: { p_os_id: string }; Returns: Json }
      buscar_diagnosticos_similares: {
        Args: { p_limite?: number; p_modelo?: string; p_sintomas?: string }
        Returns: {
          custo_estimado: number
          diagnostico: string
          id: string
          modelo_veiculo: string
          similaridade: number
          sintomas: string
          solucao: string
          tempo_medio_minutos: number
        }[]
      }
      can_manage_roles: { Args: { _user_id: string }; Returns: boolean }
      get_active_kommo_config: {
        Args: never
        Returns: {
          access_token: string
          client_id: string
          client_secret: string
          redirect_uri: string
          refresh_token: string
          subdomain: string
        }[]
      }
      has_admin_access: { Args: never; Returns: boolean }
      has_any_role: { Args: { _roles: string[] }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_dev: { Args: { _user_id: string }; Returns: boolean }
      log_kommo_sync: {
        Args: { p_detalhes?: Json; p_erro?: string; p_tipo: string }
        Returns: string
      }
      use_invite:
        | { Args: { invite_code: string }; Returns: boolean }
        | { Args: { invite_code: string; user_uuid: string }; Returns: boolean }
      validate_invite_code: {
        Args: { check_code: string }
        Returns: {
          invite_role: Database["public"]["Enums"]["app_role"]
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      alert_status: "scheduled" | "sent" | "read" | "dismissed" | "completed"
      alert_target: "client" | "admin"
      alert_type: "pending_items" | "oil_change" | "seasonal" | "custom"
      app_role: "admin" | "user" | "gestao" | "dev"
      appointment_status:
        | "pendente"
        | "confirmado"
        | "concluido"
        | "cancelado"
        | "diagnostico"
        | "orcamento"
        | "aguardando_aprovacao"
        | "aguardando_pecas"
        | "pronto_iniciar"
        | "em_execucao"
        | "em_teste"
        | "pronto_retirada"
      event_type: "workshop" | "meetup" | "carwash" | "training" | "other"
      funnel_step:
        | "flow_started"
        | "vehicle_selected"
        | "type_selected"
        | "services_selected"
        | "date_selected"
        | "flow_completed"
        | "flow_abandoned"
      item_priority: "critical" | "half_life" | "good"
      service_type: "revisao" | "diagnostico"
      widget_type:
        | "card_numero"
        | "card_percentual"
        | "grafico_linha"
        | "grafico_barra"
        | "grafico_pizza"
        | "lista"
        | "tabela"
        | "gauge"
        | "texto"
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
      alert_status: ["scheduled", "sent", "read", "dismissed", "completed"],
      alert_target: ["client", "admin"],
      alert_type: ["pending_items", "oil_change", "seasonal", "custom"],
      app_role: ["admin", "user", "gestao", "dev"],
      appointment_status: [
        "pendente",
        "confirmado",
        "concluido",
        "cancelado",
        "diagnostico",
        "orcamento",
        "aguardando_aprovacao",
        "aguardando_pecas",
        "pronto_iniciar",
        "em_execucao",
        "em_teste",
        "pronto_retirada",
      ],
      event_type: ["workshop", "meetup", "carwash", "training", "other"],
      funnel_step: [
        "flow_started",
        "vehicle_selected",
        "type_selected",
        "services_selected",
        "date_selected",
        "flow_completed",
        "flow_abandoned",
      ],
      item_priority: ["critical", "half_life", "good"],
      service_type: ["revisao", "diagnostico"],
      widget_type: [
        "card_numero",
        "card_percentual",
        "grafico_linha",
        "grafico_barra",
        "grafico_pizza",
        "lista",
        "tabela",
        "gauge",
        "texto",
      ],
    },
  },
} as const
