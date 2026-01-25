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
          data_aniversario: string | null
          email: string | null
          id: string
          indicacoes_feitas: number | null
          indicado_por: string | null
          last_service_date: string | null
          motivo_contato: string | null
          name: string
          nivel_satisfacao: number | null
          notes: string | null
          origem: string | null
          pending_review: boolean
          phone: string
          preferencias: string | null
          proximo_contato: string | null
          reclamacoes: number | null
          registration_source: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          status_crm: string | null
          tags: string[] | null
          total_spent: number | null
          ultima_interacao: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          data_aniversario?: string | null
          email?: string | null
          id?: string
          indicacoes_feitas?: number | null
          indicado_por?: string | null
          last_service_date?: string | null
          motivo_contato?: string | null
          name: string
          nivel_satisfacao?: number | null
          notes?: string | null
          origem?: string | null
          pending_review?: boolean
          phone: string
          preferencias?: string | null
          proximo_contato?: string | null
          reclamacoes?: number | null
          registration_source?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          status_crm?: string | null
          tags?: string[] | null
          total_spent?: number | null
          ultima_interacao?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          data_aniversario?: string | null
          email?: string | null
          id?: string
          indicacoes_feitas?: number | null
          indicado_por?: string | null
          last_service_date?: string | null
          motivo_contato?: string | null
          name?: string
          nivel_satisfacao?: number | null
          notes?: string | null
          origem?: string | null
          pending_review?: boolean
          phone?: string
          preferencias?: string | null
          proximo_contato?: string | null
          reclamacoes?: number | null
          registration_source?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          status_crm?: string | null
          tags?: string[] | null
          total_spent?: number | null
          ultima_interacao?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_indicado_por_fkey"
            columns: ["indicado_por"]
            isOneToOne: false
            referencedRelation: "client_service_history"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "clients_indicado_por_fkey"
            columns: ["indicado_por"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      ia_anna_atendimentos: {
        Row: {
          agendou: boolean | null
          chegou_boca_gol: boolean | null
          created_at: string
          data_agendamento: string | null
          fim_atendimento: string | null
          id: string
          inicio_atendimento: string | null
          lead_id: string
          lead_nome: string | null
          lead_telefone: string | null
          motivo_transferencia: string | null
          pos_venda_data: string | null
          pos_venda_iniciado: boolean | null
          quantidade_mensagens: number | null
          satisfacao_cliente: number | null
          score_qualidade: number | null
          status: string | null
          temperatura: string | null
          tempo_medio_resposta_segundos: number | null
          tempo_total_minutos: number | null
          transferiu_humano: boolean | null
          updated_at: string
        }
        Insert: {
          agendou?: boolean | null
          chegou_boca_gol?: boolean | null
          created_at?: string
          data_agendamento?: string | null
          fim_atendimento?: string | null
          id?: string
          inicio_atendimento?: string | null
          lead_id: string
          lead_nome?: string | null
          lead_telefone?: string | null
          motivo_transferencia?: string | null
          pos_venda_data?: string | null
          pos_venda_iniciado?: boolean | null
          quantidade_mensagens?: number | null
          satisfacao_cliente?: number | null
          score_qualidade?: number | null
          status?: string | null
          temperatura?: string | null
          tempo_medio_resposta_segundos?: number | null
          tempo_total_minutos?: number | null
          transferiu_humano?: boolean | null
          updated_at?: string
        }
        Update: {
          agendou?: boolean | null
          chegou_boca_gol?: boolean | null
          created_at?: string
          data_agendamento?: string | null
          fim_atendimento?: string | null
          id?: string
          inicio_atendimento?: string | null
          lead_id?: string
          lead_nome?: string | null
          lead_telefone?: string | null
          motivo_transferencia?: string | null
          pos_venda_data?: string | null
          pos_venda_iniciado?: boolean | null
          quantidade_mensagens?: number | null
          satisfacao_cliente?: number | null
          score_qualidade?: number | null
          status?: string | null
          temperatura?: string | null
          tempo_medio_resposta_segundos?: number | null
          tempo_total_minutos?: number | null
          transferiu_humano?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      ia_joao_qualidade: {
        Row: {
          analise_texto: string | null
          atendimento_id: string | null
          created_at: string
          demonstrou_desinteresse: boolean | null
          enviou_audio: boolean | null
          enviou_midia: boolean | null
          id: string
          lead_id: string
          mencionou_urgencia: boolean | null
          pediu_agendamento: boolean | null
          perguntou_prazo: boolean | null
          perguntou_preco: boolean | null
          recomendacao: string | null
          score_engajamento: number | null
          score_intencao_compra: number | null
          score_tempo_resposta: number | null
          score_total: number | null
          score_urgencia: number | null
          temperatura: string | null
          updated_at: string
        }
        Insert: {
          analise_texto?: string | null
          atendimento_id?: string | null
          created_at?: string
          demonstrou_desinteresse?: boolean | null
          enviou_audio?: boolean | null
          enviou_midia?: boolean | null
          id?: string
          lead_id: string
          mencionou_urgencia?: boolean | null
          pediu_agendamento?: boolean | null
          perguntou_prazo?: boolean | null
          perguntou_preco?: boolean | null
          recomendacao?: string | null
          score_engajamento?: number | null
          score_intencao_compra?: number | null
          score_tempo_resposta?: number | null
          score_total?: number | null
          score_urgencia?: number | null
          temperatura?: string | null
          updated_at?: string
        }
        Update: {
          analise_texto?: string | null
          atendimento_id?: string | null
          created_at?: string
          demonstrou_desinteresse?: boolean | null
          enviou_audio?: boolean | null
          enviou_midia?: boolean | null
          id?: string
          lead_id?: string
          mencionou_urgencia?: boolean | null
          pediu_agendamento?: boolean | null
          perguntou_prazo?: boolean | null
          perguntou_preco?: boolean | null
          recomendacao?: string | null
          score_engajamento?: number | null
          score_intencao_compra?: number | null
          score_tempo_resposta?: number | null
          score_total?: number | null
          score_urgencia?: number | null
          temperatura?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ia_joao_qualidade_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "ia_anna_atendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_luiz_base_leads: {
        Row: {
          carro: string | null
          created_at: string
          data_primeiro_contato: string | null
          data_ultimo_contato: string | null
          dias_sem_contato: number | null
          email: string | null
          enviado_em: string | null
          enviado_para_pedro: boolean | null
          id: string
          interesse: string | null
          lead_id: string
          nome: string | null
          onda: number | null
          origem: string | null
          score_historico: number | null
          status: string | null
          tags: Json | null
          telefone: string | null
          temperatura: string | null
          updated_at: string
        }
        Insert: {
          carro?: string | null
          created_at?: string
          data_primeiro_contato?: string | null
          data_ultimo_contato?: string | null
          dias_sem_contato?: number | null
          email?: string | null
          enviado_em?: string | null
          enviado_para_pedro?: boolean | null
          id?: string
          interesse?: string | null
          lead_id: string
          nome?: string | null
          onda?: number | null
          origem?: string | null
          score_historico?: number | null
          status?: string | null
          tags?: Json | null
          telefone?: string | null
          temperatura?: string | null
          updated_at?: string
        }
        Update: {
          carro?: string | null
          created_at?: string
          data_primeiro_contato?: string | null
          data_ultimo_contato?: string | null
          dias_sem_contato?: number | null
          email?: string | null
          enviado_em?: string | null
          enviado_para_pedro?: boolean | null
          id?: string
          interesse?: string | null
          lead_id?: string
          nome?: string | null
          onda?: number | null
          origem?: string | null
          score_historico?: number | null
          status?: string | null
          tags?: Json | null
          telefone?: string | null
          temperatura?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ia_metricas_diarias: {
        Row: {
          anna_leads_atendidos: number | null
          anna_pos_vendas: number | null
          anna_taxa_agendamento: number | null
          anna_taxa_boca_gol: number | null
          anna_tempo_medio_resposta: number | null
          anna_transferencias: number | null
          created_at: string
          data: string
          id: string
          joao_leads_analisados: number | null
          joao_leads_frios: number | null
          joao_leads_gelados: number | null
          joao_leads_mornos: number | null
          joao_leads_quentes: number | null
          joao_score_medio: number | null
          luiz_enviados_pedro: number | null
          luiz_leads_mapeados: number | null
          luiz_onda1: number | null
          luiz_onda2: number | null
          luiz_onda3: number | null
          luiz_onda4: number | null
          pedro_reativacoes_enviadas: number | null
          pedro_reativados: number | null
          pedro_respostas: number | null
          pedro_taxa_reativacao: number | null
          pedro_taxa_resposta: number | null
          updated_at: string
          zoraide_alertas_resolvidos: number | null
          zoraide_alertas_total: number | null
          zoraide_campos_preenchidos: number | null
          zoraide_tempo_medio_resolucao: number | null
        }
        Insert: {
          anna_leads_atendidos?: number | null
          anna_pos_vendas?: number | null
          anna_taxa_agendamento?: number | null
          anna_taxa_boca_gol?: number | null
          anna_tempo_medio_resposta?: number | null
          anna_transferencias?: number | null
          created_at?: string
          data: string
          id?: string
          joao_leads_analisados?: number | null
          joao_leads_frios?: number | null
          joao_leads_gelados?: number | null
          joao_leads_mornos?: number | null
          joao_leads_quentes?: number | null
          joao_score_medio?: number | null
          luiz_enviados_pedro?: number | null
          luiz_leads_mapeados?: number | null
          luiz_onda1?: number | null
          luiz_onda2?: number | null
          luiz_onda3?: number | null
          luiz_onda4?: number | null
          pedro_reativacoes_enviadas?: number | null
          pedro_reativados?: number | null
          pedro_respostas?: number | null
          pedro_taxa_reativacao?: number | null
          pedro_taxa_resposta?: number | null
          updated_at?: string
          zoraide_alertas_resolvidos?: number | null
          zoraide_alertas_total?: number | null
          zoraide_campos_preenchidos?: number | null
          zoraide_tempo_medio_resolucao?: number | null
        }
        Update: {
          anna_leads_atendidos?: number | null
          anna_pos_vendas?: number | null
          anna_taxa_agendamento?: number | null
          anna_taxa_boca_gol?: number | null
          anna_tempo_medio_resposta?: number | null
          anna_transferencias?: number | null
          created_at?: string
          data?: string
          id?: string
          joao_leads_analisados?: number | null
          joao_leads_frios?: number | null
          joao_leads_gelados?: number | null
          joao_leads_mornos?: number | null
          joao_leads_quentes?: number | null
          joao_score_medio?: number | null
          luiz_enviados_pedro?: number | null
          luiz_leads_mapeados?: number | null
          luiz_onda1?: number | null
          luiz_onda2?: number | null
          luiz_onda3?: number | null
          luiz_onda4?: number | null
          pedro_reativacoes_enviadas?: number | null
          pedro_reativados?: number | null
          pedro_respostas?: number | null
          pedro_taxa_reativacao?: number | null
          pedro_taxa_resposta?: number | null
          updated_at?: string
          zoraide_alertas_resolvidos?: number | null
          zoraide_alertas_total?: number | null
          zoraide_campos_preenchidos?: number | null
          zoraide_tempo_medio_resolucao?: number | null
        }
        Relationships: []
      }
      ia_pedro_reativacoes: {
        Row: {
          atendimento_id: string | null
          base_lead_id: string | null
          created_at: string
          entregue: boolean | null
          enviado_em: string | null
          id: string
          lead_id: string
          lido: boolean | null
          mensagem_enviada: string | null
          nome: string | null
          onda: number | null
          reativou: boolean | null
          respondeu: boolean | null
          resposta_em: string | null
          sentimento_resposta: string | null
          telefone: string | null
          tempo_ate_resposta_minutos: number | null
          tipo_abordagem: string | null
          virou_atendimento: boolean | null
        }
        Insert: {
          atendimento_id?: string | null
          base_lead_id?: string | null
          created_at?: string
          entregue?: boolean | null
          enviado_em?: string | null
          id?: string
          lead_id: string
          lido?: boolean | null
          mensagem_enviada?: string | null
          nome?: string | null
          onda?: number | null
          reativou?: boolean | null
          respondeu?: boolean | null
          resposta_em?: string | null
          sentimento_resposta?: string | null
          telefone?: string | null
          tempo_ate_resposta_minutos?: number | null
          tipo_abordagem?: string | null
          virou_atendimento?: boolean | null
        }
        Update: {
          atendimento_id?: string | null
          base_lead_id?: string | null
          created_at?: string
          entregue?: boolean | null
          enviado_em?: string | null
          id?: string
          lead_id?: string
          lido?: boolean | null
          mensagem_enviada?: string | null
          nome?: string | null
          onda?: number | null
          reativou?: boolean | null
          respondeu?: boolean | null
          resposta_em?: string | null
          sentimento_resposta?: string | null
          telefone?: string | null
          tempo_ate_resposta_minutos?: number | null
          tipo_abordagem?: string | null
          virou_atendimento?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ia_pedro_reativacoes_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "ia_anna_atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ia_pedro_reativacoes_base_lead_id_fkey"
            columns: ["base_lead_id"]
            isOneToOne: false
            referencedRelation: "ia_luiz_base_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_zoraide_monitor: {
        Row: {
          acao_tomada: string | null
          campos_extraidos: Json | null
          campos_preenchidos_em: string | null
          created_at: string
          id: string
          lead_carro: string | null
          lead_email: string | null
          lead_id: string
          lead_nome: string | null
          lead_telefone: string | null
          resolvido: boolean | null
          resolvido_em: string | null
          tempo_sem_resposta: number | null
          tipo_alerta: string | null
          updated_at: string
        }
        Insert: {
          acao_tomada?: string | null
          campos_extraidos?: Json | null
          campos_preenchidos_em?: string | null
          created_at?: string
          id?: string
          lead_carro?: string | null
          lead_email?: string | null
          lead_id: string
          lead_nome?: string | null
          lead_telefone?: string | null
          resolvido?: boolean | null
          resolvido_em?: string | null
          tempo_sem_resposta?: number | null
          tipo_alerta?: string | null
          updated_at?: string
        }
        Update: {
          acao_tomada?: string | null
          campos_extraidos?: Json | null
          campos_preenchidos_em?: string | null
          created_at?: string
          id?: string
          lead_carro?: string | null
          lead_email?: string | null
          lead_id?: string
          lead_nome?: string | null
          lead_telefone?: string | null
          resolvido?: boolean | null
          resolvido_em?: string | null
          tempo_sem_resposta?: number | null
          tipo_alerta?: string | null
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
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
          budget_tier: string | null
          cost_price: number | null
          created_at: string
          description: string
          discount_justification: string | null
          estimated_return_date: string | null
          id: string
          margin_percent: number | null
          notes: string | null
          priority: string | null
          quantity: number | null
          refusal_reason: string | null
          service_order_id: string
          status: string | null
          suggested_price: number | null
          total_price: number
          type: string
          unit_price: number
        }
        Insert: {
          budget_tier?: string | null
          cost_price?: number | null
          created_at?: string
          description: string
          discount_justification?: string | null
          estimated_return_date?: string | null
          id?: string
          margin_percent?: number | null
          notes?: string | null
          priority?: string | null
          quantity?: number | null
          refusal_reason?: string | null
          service_order_id: string
          status?: string | null
          suggested_price?: number | null
          total_price: number
          type: string
          unit_price: number
        }
        Update: {
          budget_tier?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string
          discount_justification?: string | null
          estimated_return_date?: string | null
          id?: string
          margin_percent?: number | null
          notes?: string | null
          priority?: string | null
          quantity?: number | null
          refusal_reason?: string | null
          service_order_id?: string
          status?: string | null
          suggested_price?: number | null
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
          approved_total: number | null
          budget_approved_at: string | null
          budget_sent_at: string | null
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
          approved_total?: number | null
          budget_approved_at?: string | null
          budget_sent_at?: string | null
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
          approved_total?: number | null
          budget_approved_at?: string | null
          budget_sent_at?: string | null
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
