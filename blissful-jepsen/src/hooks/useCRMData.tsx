import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

export interface CRMClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string | null;
  address: string | null;
  city: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  user_id: string | null;
  pending_review: boolean;
  registration_source: string;
  data_aniversario: string | null;
  // CRM fields (from clientes_crm)
  status_crm: string;
  origem: string;
  ultima_interacao: string | null;
  indicacoes_feitas: number;
  indicado_por: string | null;
  tags: string[];
  proximo_contato: string | null;
  motivo_contato: string | null;
  nivel_satisfacao: number | null;
  preferencias: string | null;
  reclamacoes: number;
  // Metrics (from clientes_metricas)
  total_spent: number;
  last_service_date: string | null;
  ticket_medio: number;
  // Computed
  vehicles_count: number;
  orders_count: number;
  dias_sem_visita: number | null;
  // Profile data (if linked)
  loyalty_level?: string;
  loyalty_points?: number;
}

export interface CRMStats {
  total: number;
  leads: number;
  ativos: number;
  em_risco: number;
  inativos: number;
  perdidos: number;
  total_faturamento: number;
  ticket_medio_geral: number;
  com_followup_pendente: number;
}

export function useCRMData() {
  return useQuery({
    queryKey: ["crm-clients"],
    queryFn: async (): Promise<{ clients: CRMClient[]; stats: CRMStats }> => {
      // Fetch clients with related data from all 3 tables
      const { data: clients, error } = await (supabase as any)
        .from("clientes")
        .select(`
          *,
          veiculos:veiculos(count),
          ordens_servico:ordens_servico(count),
          clientes_crm(*),
          clientes_metricas(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for loyalty data
      const { data: profiles } = await supabase
        .from("colaboradores")
        .select("user_id, loyalty_level, loyalty_points");

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p]) || []
      );

      // Process clients
      const processedClients: CRMClient[] = (clients || []).map((client: any) => {
        const vehiclesCount = client.veiculos?.[0]?.count || 0;
        const ordersCount = client.ordens_servico?.[0]?.count || 0;
        
        // Get CRM data (one-to-one relationship)
        const crm = client.clientes_crm?.[0] || client.clientes_crm || {};
        
        // Get metrics data (one-to-one relationship)
        const metrics = client.clientes_metricas?.[0] || client.clientes_metricas || {};

        const diasSemVisita = metrics.last_service_date
          ? differenceInDays(new Date(), new Date(metrics.last_service_date))
          : null;

        const profile = client.user_id ? profileMap.get(client.user_id) : null;

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          cpf: client.cpf,
          address: client.address,
          city: client.city,
          status: client.status,
          created_at: client.created_at,
          updated_at: client.updated_at,
          notes: client.notes,
          user_id: client.user_id,
          pending_review: client.pending_review,
          registration_source: client.registration_source,
          data_aniversario: client.data_aniversario,
          // CRM fields from clientes_crm
          status_crm: crm.status_crm || "ativo",
          origem: crm.origem || "direto",
          ultima_interacao: crm.ultima_interacao,
          indicacoes_feitas: crm.indicacoes_feitas || 0,
          indicado_por: crm.indicado_por,
          tags: crm.tags || [],
          proximo_contato: crm.proximo_contato,
          motivo_contato: crm.motivo_contato,
          nivel_satisfacao: crm.nivel_satisfacao,
          preferencias: crm.preferencias,
          reclamacoes: crm.reclamacoes || 0,
          // Metrics from clientes_metricas
          total_spent: metrics.total_spent || 0,
          last_service_date: metrics.last_service_date,
          ticket_medio: metrics.ticket_medio || 0,
          // Computed
          vehicles_count: vehiclesCount,
          orders_count: ordersCount,
          dias_sem_visita: diasSemVisita,
          // Profile
          loyalty_level: profile?.loyalty_level || "bronze",
          loyalty_points: profile?.loyalty_points || 0,
        };
      });

      // Calculate stats
      const stats: CRMStats = {
        total: processedClients.length,
        leads: processedClients.filter((c) => c.status_crm === "lead").length,
        ativos: processedClients.filter((c) => c.status_crm === "ativo").length,
        em_risco: processedClients.filter((c) => c.status_crm === "em_risco").length,
        inativos: processedClients.filter((c) => c.status_crm === "inativo").length,
        perdidos: processedClients.filter((c) => c.status_crm === "perdido").length,
        total_faturamento: processedClients.reduce((sum, c) => sum + c.total_spent, 0),
        ticket_medio_geral:
          processedClients.length > 0
            ? processedClients.reduce((sum, c) => sum + c.total_spent, 0) /
              processedClients.filter((c) => c.orders_count > 0).length || 0
            : 0,
        com_followup_pendente: processedClients.filter(
          (c) => c.proximo_contato && new Date(c.proximo_contato) <= new Date()
        ).length,
      };

      return { clients: processedClients, stats };
    },
  });
}

export function useUpdateClientCRM() {
  const updateClient = async (clientId: string, updates: Partial<CRMClient>) => {
    // Separate updates for each table
    const clientUpdates: Record<string, any> = {};
    const crmUpdates: Record<string, any> = {};
    const metricsUpdates: Record<string, any> = {};

    // Client base fields
    const clientFields = ['name', 'email', 'phone', 'cpf', 'address', 'city', 'status', 'notes', 'pending_review', 'data_aniversario'];
    // CRM fields
    const crmFields = ['status_crm', 'origem', 'ultima_interacao', 'indicacoes_feitas', 'indicado_por', 'tags', 'proximo_contato', 'motivo_contato', 'nivel_satisfacao', 'preferencias', 'reclamacoes'];
    // Metrics fields
    const metricsFields = ['total_spent', 'last_service_date', 'ticket_medio'];

    Object.entries(updates).forEach(([key, value]) => {
      if (clientFields.includes(key)) {
        clientUpdates[key] = value;
      } else if (crmFields.includes(key)) {
        crmUpdates[key] = value;
      } else if (metricsFields.includes(key)) {
        metricsUpdates[key] = value;
      }
    });

    // Update each table if there are changes
    if (Object.keys(clientUpdates).length > 0) {
      const { error } = await supabase.from("clientes").update(clientUpdates).eq("id", clientId);
      if (error) throw error;
    }

    if (Object.keys(crmUpdates).length > 0) {
      const { error } = await (supabase as any).from("clientes_crm").update(crmUpdates).eq("cliente_id", clientId);
      if (error) throw error;
    }

    if (Object.keys(metricsUpdates).length > 0) {
      const { error } = await (supabase as any).from("clientes_metricas").update(metricsUpdates).eq("cliente_id", clientId);
      if (error) throw error;
    }
  };

  return { updateClient };
}

// Helper to create CRM and metrics records for new clients
export async function createClientRelatedRecords(clientId: string) {
  const [crmResult, metricsResult] = await Promise.all([
    (supabase as any).from("clientes_crm").insert({ cliente_id: clientId }),
    (supabase as any).from("clientes_metricas").insert({ cliente_id: clientId }),
  ]);

  if (crmResult.error) throw crmResult.error;
  if (metricsResult.error) throw metricsResult.error;
}
