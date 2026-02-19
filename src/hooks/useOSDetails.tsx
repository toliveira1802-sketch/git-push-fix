import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OSData {
  id: string;
  order_number: string;
  status: string;
  priority: string | null;
  problem_description: string | null;
  diagnosis: string | null;
  observations: string | null;
  entry_km: number | null;
  entry_checklist: Record<string, boolean> | null;
  estimated_completion: string | null;
  total: number;
  total_parts: number;
  total_labor: number;
  total_discount: number;
  approved_total: number;
  payment_status: string | null;
  payment_method: string | null;
  em_terceiros: boolean;
  recurso: string | null;
  created_at: string;
  completed_at: string | null;
  budget_sent_at: string | null;
  budget_approved_at: string | null;
  // Related data (desnormalizado na ordens_servico)
  client: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number | null;
    color: string | null;
    km: number | null;
  } | null;
  mechanic: {
    id: string;
    name: string;
  } | null;
}

export interface OSHistoryEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata: Record<string, any> | null;
}

export function useOSDetails(osId: string | undefined) {
  const [os, setOS] = useState<OSData | null>(null);
  const [history, setHistory] = useState<OSHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when osId changes
  useEffect(() => {
    if (osId) {
      setOS(null);
      setIsLoading(true);
    }
  }, [osId]);

  // Fetch OS data
  const fetchOS = useCallback(async () => {
    if (!osId) {
      setOS(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // ordens_servico tem dados desnormalizados: client_name, client_phone, plate, vehicle
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*")
        .eq("id", osId)
        .single();

      if (error) throw error;

      if (data) {
        // Mapear colunas reais da ordens_servico para a interface OSData
        const d = data as any;

        // Extrair brand e model do campo "vehicle" (ex: "VW Jetta GLI 2.0 TSI")
        const vehicleParts = (d.vehicle || '').split(' ');
        const brand = vehicleParts[0] || '';
        const model = vehicleParts.slice(1).join(' ') || '';

        const osData: OSData = {
          id: d.id,
          order_number: d.numero_os || '',
          status: d.status || 'diagnostico',
          priority: d.prioridade || null,
          problem_description: d.descricao_problema || null,
          diagnosis: d.diagnostico || null,
          observations: d.observacoes || null,
          entry_km: d.km_atual || d.km_entrada || null,
          entry_checklist: d.checklist_entrada || null,
          estimated_completion: d.data_previsao_entrega || null,
          total: Number(d.valor_orcado) || 0,
          total_parts: 0, // calculado pelos itens
          total_labor: 0,
          total_discount: 0,
          approved_total: Number(d.valor_aprovado) || 0,
          payment_status: d.status_pagamento || null,
          payment_method: d.forma_pagamento || null,
          em_terceiros: false,
          recurso: null,
          created_at: d.created_at || d.data_entrada,
          completed_at: d.data_conclusao || null,
          budget_sent_at: d.enviado_gestao_em || null,
          budget_approved_at: d.data_aprovacao || null,
          // Dados desnormalizados
          client: d.client_name ? {
            id: d.id, // sem FK real
            name: d.client_name,
            phone: d.client_phone || '',
            email: null,
          } : null,
          vehicle: d.plate ? {
            id: d.id, // sem FK real
            plate: d.plate,
            brand: brand,
            model: model,
            year: null,
            color: null,
            km: d.km_atual || null,
          } : null,
          mechanic: d.mecanico_responsavel ? {
            id: d.mechanic_id || d.id,
            name: d.mecanico_responsavel,
          } : null,
        };
        setOS(osData);
      }
    } catch (error) {
      console.error("Erro ao carregar OS:", error);
      toast.error("Erro ao carregar detalhes da OS");
    } finally {
      setIsLoading(false);
    }
  }, [osId]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (!osId) {
      setHistory([]);
      return;
    }

    try {
      // Tentar os_historico primeiro, depois historico_ordem_servico
      const { data, error } = await supabase
        .from("os_historico" as any)
        .select("*")
        .eq("ordem_servico_id", osId)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback: tabela pode não existir
        console.warn("os_historico não disponível:", error.message);
        setHistory([]);
        return;
      }

      setHistory(
        (data || []).map((e: any) => ({
          id: e.id,
          event_type: e.tipo_evento || e.event_type || 'info',
          description: e.descricao || e.description || '',
          created_at: e.created_at,
          metadata: e.metadata || null,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistory([]);
    }
  }, [osId]);

  useEffect(() => {
    fetchOS();
    fetchHistory();
  }, [fetchOS, fetchHistory]);

  // Update OS — mapear de volta para colunas reais
  const updateOS = async (
    updates: Partial<
      Omit<OSData, "id" | "client" | "vehicle" | "mechanic" | "created_at">
    >
  ): Promise<boolean> => {
    if (!osId) return false;

    setIsSaving(true);
    try {
      // Mapear nomes de campo da interface para colunas reais
      const dbUpdates: Record<string, any> = {};
      if (updates.problem_description !== undefined) dbUpdates.descricao_problema = updates.problem_description;
      if (updates.diagnosis !== undefined) dbUpdates.diagnostico = updates.diagnosis;
      if (updates.observations !== undefined) dbUpdates.observacoes = updates.observations;
      if (updates.entry_km !== undefined) dbUpdates.km_atual = updates.entry_km;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if ((updates as any).entry_checklist !== undefined) dbUpdates.checklist_entrada = (updates as any).entry_checklist;
      if ((updates as any).budget_sent_at !== undefined) dbUpdates.enviado_gestao_em = (updates as any).budget_sent_at;
      if ((updates as any).budget_approved_at !== undefined) dbUpdates.data_aprovacao = (updates as any).budget_approved_at;

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("ordens_servico")
        .update(dbUpdates)
        .eq("id", osId);

      if (error) throw error;

      await fetchOS();
      toast.success("OS atualizada!");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Erro ao atualizar OS");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update status
  const updateStatus = async (newStatus: string): Promise<boolean> => {
    const success = await updateOS({ status: newStatus });
    if (success) {
      await addHistoryEvent("status_change", `Status alterado para "${newStatus}"`);
    }
    return success;
  };

  // Update checklist
  const updateChecklist = async (
    checklist: Record<string, boolean>
  ): Promise<boolean> => {
    return updateOS({ entry_checklist: checklist } as any);
  };

  // Add history event
  const addHistoryEvent = async (
    eventType: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!osId) return false;

    try {
      const { error } = await supabase.from("os_historico" as any).insert({
        ordem_servico_id: osId,
        tipo_evento: eventType,
        descricao: description,
        metadata: metadata || null,
      });

      if (error) {
        // Se tabela não existir, log silencioso
        console.warn("Não foi possível gravar histórico:", error.message);
        return false;
      }
      await fetchHistory();
      return true;
    } catch (error) {
      console.error("Erro ao registrar evento:", error);
      return false;
    }
  };

  // Mark budget as sent
  const markBudgetSent = async (): Promise<boolean> => {
    if (!osId) return false;

    const success = await updateOS({
      budget_sent_at: new Date().toISOString(),
      status: os?.status === "orcamento" ? "aguardando_aprovacao" : os?.status || "orcamento",
    } as any);

    if (success) {
      await addHistoryEvent("budget_sent", "Orçamento enviado ao cliente via WhatsApp");
    }
    return success;
  };

  // Mark budget as approved
  const markBudgetApproved = async (): Promise<boolean> => {
    if (!osId) return false;

    const success = await updateOS({
      budget_approved_at: new Date().toISOString(),
      status: "aprovado",
    } as any);

    if (success) {
      await addHistoryEvent("budget_approved", "Orçamento aprovado pelo cliente");
    }
    return success;
  };

  return {
    os,
    history,
    isLoading,
    isSaving,
    // Actions
    updateOS,
    updateStatus,
    updateChecklist,
    addHistoryEvent,
    markBudgetSent,
    markBudgetApproved,
    // Refresh
    refetch: () => {
      fetchOS();
      fetchHistory();
    },
  };
}
