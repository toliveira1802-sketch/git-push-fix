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
  last_service_date: string | null;
  total_spent: number;
  notes: string | null;
  user_id: string | null;
  pending_review: boolean;
  registration_source: string;
  // CRM fields
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
  data_aniversario: string | null;
  reclamacoes: number;
  // Computed
  vehicles_count: number;
  orders_count: number;
  dias_sem_visita: number | null;
  ticket_medio: number;
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
      // Fetch clients with vehicle and order counts
      const { data: clients, error } = await supabase
        .from("clientes")
        .select(`
          *,
          veiculos:veiculos(count),
          ordens_servico:ordens_servico(count)
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

      // Fetch order totals for ticket medio calculation
      const { data: orderTotals } = await supabase
        .from("ordens_servico")
        .select("client_id, total")
        .not("total", "is", null);

      const ordersByClient = new Map<string, number[]>();
      orderTotals?.forEach((order) => {
        if (!ordersByClient.has(order.client_id)) {
          ordersByClient.set(order.client_id, []);
        }
        ordersByClient.get(order.client_id)!.push(order.total || 0);
      });

      // Process clients
      const processedClients: CRMClient[] = (clients || []).map((client: any) => {
        const vehiclesCount = client.veiculos?.[0]?.count || 0;
        const ordersCount = client.ordens_servico?.[0]?.count || 0;
        const clientOrders = ordersByClient.get(client.id) || [];
        const ticketMedio = clientOrders.length > 0
          ? clientOrders.reduce((a, b) => a + b, 0) / clientOrders.length
          : 0;

        const diasSemVisita = client.last_service_date
          ? differenceInDays(new Date(), new Date(client.last_service_date))
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
          last_service_date: client.last_service_date,
          total_spent: client.total_spent || 0,
          notes: client.notes,
          user_id: client.user_id,
          pending_review: client.pending_review,
          registration_source: client.registration_source,
          // CRM fields
          status_crm: client.status_crm || "ativo",
          origem: client.origem || "direto",
          ultima_interacao: client.ultima_interacao,
          indicacoes_feitas: client.indicacoes_feitas || 0,
          indicado_por: client.indicado_por,
          tags: client.tags || [],
          proximo_contato: client.proximo_contato,
          motivo_contato: client.motivo_contato,
          nivel_satisfacao: client.nivel_satisfacao,
          preferencias: client.preferencias,
          data_aniversario: client.data_aniversario,
          reclamacoes: client.reclamacoes || 0,
          // Computed
          vehicles_count: vehiclesCount,
          orders_count: ordersCount,
          dias_sem_visita: diasSemVisita,
          ticket_medio: ticketMedio,
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
    const { error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", clientId);

    if (error) throw error;
  };

  return { updateClient };
}
