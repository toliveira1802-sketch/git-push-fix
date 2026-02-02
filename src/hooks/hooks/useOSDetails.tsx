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
  // Related data
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
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          clients!service_orders_client_id_fkey (
            id, name, phone, email
          ),
          vehicles!service_orders_vehicle_id_fkey (
            id, plate, brand, model, year, color, km
          ),
          mechanics!service_orders_mechanic_id_fkey (
            id, name
          )
        `)
        .eq("id", osId)
        .single();

      if (error) throw error;

      if (data) {
        const osData: OSData = {
          id: data.id,
          order_number: data.order_number,
          status: data.status,
          priority: data.priority,
          problem_description: data.problem_description,
          diagnosis: data.diagnosis,
          observations: data.observations,
          entry_km: data.entry_km,
          entry_checklist: data.entry_checklist as Record<string, boolean> | null,
          estimated_completion: data.estimated_completion,
          total: Number(data.total) || 0,
          total_parts: Number(data.total_parts) || 0,
          total_labor: Number(data.total_labor) || 0,
          total_discount: Number(data.total_discount) || 0,
          approved_total: Number((data as any).approved_total) || 0,
          payment_status: data.payment_status,
          payment_method: data.payment_method,
          em_terceiros: data.em_terceiros,
          recurso: data.recurso,
          created_at: data.created_at,
          completed_at: data.completed_at,
          budget_sent_at: (data as any).budget_sent_at || null,
          budget_approved_at: (data as any).budget_approved_at || null,
          client: data.clients
            ? {
                id: data.clients.id,
                name: data.clients.name,
                phone: data.clients.phone,
                email: data.clients.email,
              }
            : null,
          vehicle: data.vehicles
            ? {
                id: data.vehicles.id,
                plate: data.vehicles.plate,
                brand: data.vehicles.brand,
                model: data.vehicles.model,
                year: data.vehicles.year,
                color: data.vehicles.color,
                km: data.vehicles.km,
              }
            : null,
          mechanic: data.mechanics
            ? {
                id: data.mechanics.id,
                name: data.mechanics.name,
              }
            : null,
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
      const { data, error } = await supabase
        .from("service_order_history")
        .select("*")
        .eq("service_order_id", osId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHistory(
        (data || []).map((e) => ({
          id: e.id,
          event_type: e.event_type,
          description: e.description,
          created_at: e.created_at,
          metadata: e.metadata as Record<string, any> | null,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }, [osId]);

  useEffect(() => {
    fetchOS();
    fetchHistory();
  }, [fetchOS, fetchHistory]);

  // Update OS
  const updateOS = async (
    updates: Partial<
      Omit<OSData, "id" | "client" | "vehicle" | "mechanic" | "created_at">
    >
  ): Promise<boolean> => {
    if (!osId) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("service_orders")
        .update(updates)
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
      const { error } = await supabase.from("service_order_history").insert({
        service_order_id: osId,
        event_type: eventType,
        description,
        metadata: metadata || null,
      });

      if (error) throw error;
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
