import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PrioridadeType = "verde" | "amarelo" | "vermelho";
export type ItemStatus = "pendente" | "aprovado" | "recusado";
export type BudgetTier = "premium" | "standard" | "eco";

export interface OSItemData {
  id: string;
  ordem_servico_id: string;
  description: string;
  type: "peca" | "mao_de_obra";
  quantity: number;
  cost_price: number;
  suggested_price: number | null;
  unit_price: number;
  total_price: number;
  margin_percent: number;
  status: ItemStatus;
  priority: PrioridadeType;
  notes: string | null;
  refusal_reason: string | null;
  discount_justification: string | null;
  estimated_return_date: string | null;
  budget_tier: BudgetTier;
  created_at: string;
}

export interface NewItemInput {
  description: string;
  type: "peca" | "mao_de_obra";
  quantity: number;
  cost_price: number;
  unit_price: number;
  priority: PrioridadeType;
  margin_percent?: number;
  discount_justification?: string;
  budget_tier?: BudgetTier;
  notes?: string;
}

const DEFAULT_MARGIN = 40;

export function useOSItems(serviceOrderId: string | undefined) {
  const [items, setItems] = useState<OSItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate suggested price from cost and margin
  const calculateSuggestedPrice = (costPrice: number, marginPercent: number = DEFAULT_MARGIN) => {
    return costPrice * (1 + marginPercent / 100);
  };

  // Calculate margin from cost and unit price
  const calculateMargin = (costPrice: number, unitPrice: number) => {
    if (costPrice <= 0) return 100; // Mão de obra sem custo = 100% margem
    return ((unitPrice - costPrice) / costPrice) * 100;
  };

  // Fetch items from database
  const fetchItems = useCallback(async () => {
    if (!serviceOrderId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ordens_servico_itens" as any)
        .select("*")
        .eq("ordem_servico_id", serviceOrderId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Map database fields (PT) to our interface (EN)
      // DB cols: descricao, tipo, quantidade, valor_unitario, valor_total, status, prioridade, motivo_recusa, valor_custo, valor_venda_sugerido, margem_aplicada, justificativa_desconto, data_retorno_estimada
      const mappedItems: OSItemData[] = (data || []).map((item: any) => ({
        id: item.id,
        ordem_servico_id: item.ordem_servico_id,
        description: item.descricao || item.description || '',
        type: (item.tipo || item.type || 'servico') as "peca" | "mao_de_obra",
        quantity: Number(item.quantidade || item.quantity) || 1,
        cost_price: Number(item.valor_custo || item.cost_price) || 0,
        suggested_price: item.valor_venda_sugerido ? Number(item.valor_venda_sugerido) : null,
        unit_price: Number(item.valor_unitario || item.unit_price) || 0,
        total_price: Number(item.valor_total || item.total_price) || 0,
        margin_percent: Number(item.margem_aplicada || item.margin_percent) || DEFAULT_MARGIN,
        status: (item.status as ItemStatus) || "pendente",
        priority: (item.prioridade || item.priority || "amarelo") as PrioridadeType,
        notes: item.notes || null,
        refusal_reason: item.motivo_recusa || item.refusal_reason || null,
        discount_justification: item.justificativa_desconto || item.discount_justification || null,
        estimated_return_date: item.data_retorno_estimada || item.estimated_return_date || null,
        budget_tier: ((item.budget_tier || "standard") as BudgetTier),
        created_at: item.created_at,
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens da OS");
    } finally {
      setIsLoading(false);
    }
  }, [serviceOrderId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Add new item
  const addItem = async (input: NewItemInput): Promise<boolean> => {
    if (!serviceOrderId) return false;

    setIsSaving(true);
    try {
      const margin = input.margin_percent ?? DEFAULT_MARGIN;
      const suggestedPrice = calculateSuggestedPrice(input.cost_price, margin);
      const totalPrice = input.unit_price * input.quantity;

      const { error } = await supabase.from("ordens_servico_itens" as any).insert({
        ordem_servico_id: serviceOrderId,
        descricao: input.description,
        tipo: input.type === "peca" ? "peca" : "servico",
        quantidade: input.quantity,
        valor_unitario: input.unit_price,
        valor_total: totalPrice,
        prioridade: input.priority,
        status: "pendente",
        valor_custo: input.cost_price,
        valor_venda_sugerido: suggestedPrice,
        margem_aplicada: calculateMargin(input.cost_price, input.unit_price),
        justificativa_desconto: input.discount_justification || null,
      });

      if (error) throw error;

      toast.success("Item adicionado!");
      await fetchItems();
      await updateOSTotals();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update item
  const updateItem = async (
    itemId: string,
    updates: Partial<Omit<OSItemData, "id" | "ordem_servico_id" | "created_at">>
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Recalculate total if quantity or unit_price changed
      const item = items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item não encontrado");

      const quantity = updates.quantity ?? item.quantity;
      const unitPrice = updates.unit_price ?? item.unit_price;
      const costPrice = updates.cost_price ?? item.cost_price;

      // Mapear EN -> PT para o banco
      const dbUpdate: any = {};
      if (updates.description !== undefined) dbUpdate.descricao = updates.description;
      if (updates.quantity !== undefined) dbUpdate.quantidade = updates.quantity;
      if (updates.unit_price !== undefined) dbUpdate.valor_unitario = updates.unit_price;
      if (updates.cost_price !== undefined) dbUpdate.valor_custo = updates.cost_price;
      if (updates.status !== undefined) dbUpdate.status = updates.status;
      if (updates.priority !== undefined) dbUpdate.prioridade = updates.priority;
      if (updates.refusal_reason !== undefined) dbUpdate.motivo_recusa = updates.refusal_reason;
      if (updates.discount_justification !== undefined) dbUpdate.justificativa_desconto = updates.discount_justification;

      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        dbUpdate.valor_total = quantity * unitPrice;
      }

      if (updates.cost_price !== undefined || updates.unit_price !== undefined) {
        dbUpdate.margem_aplicada = calculateMargin(costPrice, unitPrice);
      }

      const { error } = await supabase
        .from("ordens_servico_itens" as any)
        .update(dbUpdate)
        .eq("id", itemId);

      if (error) throw error;

      await fetchItems();
      await updateOSTotals();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete item
  const deleteItem = async (itemId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("ordens_servico_itens" as any)
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast.success("Item removido!");
      await fetchItems();
      await updateOSTotals();
      return true;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Approve item
  const approveItem = async (itemId: string): Promise<boolean> => {
    const success = await updateItem(itemId, { status: "aprovado", refusal_reason: null });
    if (success) toast.success("Item aprovado!");
    return success;
  };

  // Refuse item
  const refuseItem = async (itemId: string, reason?: string): Promise<boolean> => {
    const success = await updateItem(itemId, { 
      status: "recusado", 
      refusal_reason: reason || null 
    });
    if (success) toast.success("Item recusado!");
    return success;
  };

  // Reset item to pending
  const resetItemStatus = async (itemId: string): Promise<boolean> => {
    return updateItem(itemId, { status: "pendente", refusal_reason: null });
  };

  // Update OS totals
  const updateOSTotals = async () => {
    if (!serviceOrderId) return;

    try {
      // Fetch fresh items
      const { data: freshItems, error: fetchError } = await supabase
        .from("ordens_servico_itens" as any)
        .select("valor_total, status, tipo")
        .eq("ordem_servico_id", serviceOrderId);

      if (fetchError) throw fetchError;

      const total = (freshItems || []).reduce((sum: number, i: any) => sum + Number(i.valor_total), 0);
      const totalApproved = (freshItems || [])
        .filter((i: any) => i.status === "aprovado")
        .reduce((sum: number, i: any) => sum + Number(i.valor_total), 0);

      const { error } = await supabase
        .from("ordens_servico")
        .update({
          valor_orcado: total,
          valor_aprovado: totalApproved,
        })
        .eq("id", serviceOrderId);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar totais:", error);
    }
  };

  // Calculated values
  const totalOrcado = items.reduce((sum, i) => sum + i.total_price, 0);
  const totalAprovado = items
    .filter((i) => i.status === "aprovado")
    .reduce((sum, i) => sum + i.total_price, 0);
  const totalRecusado = items
    .filter((i) => i.status === "recusado")
    .reduce((sum, i) => sum + i.total_price, 0);
  const totalPendente = totalOrcado - totalAprovado - totalRecusado;

  const itensAprovados = items.filter((i) => i.status === "aprovado");
  const itensPendentes = items.filter((i) => i.status === "pendente");
  const itensRecusados = items.filter((i) => i.status === "recusado");

  const itemsByPriority = {
    vermelho: items.filter((i) => i.priority === "vermelho"),
    amarelo: items.filter((i) => i.priority === "amarelo"),
    verde: items.filter((i) => i.priority === "verde"),
  };

  const itemsByTier = {
    premium: items.filter((i) => i.budget_tier === "premium"),
    standard: items.filter((i) => i.budget_tier === "standard"),
    eco: items.filter((i) => i.budget_tier === "eco"),
  };

  // Check if any item has low margin (needs justification)
  const itemsWithLowMargin = items.filter(
    (i) => i.margin_percent < DEFAULT_MARGIN && !i.discount_justification
  );

  return {
    items,
    isLoading,
    isSaving,
    // CRUD
    addItem,
    updateItem,
    deleteItem,
    refetchItems: fetchItems,
    // Status actions
    approveItem,
    refuseItem,
    resetItemStatus,
    // Totals
    totalOrcado,
    totalAprovado,
    totalRecusado,
    totalPendente,
    // Grouped items
    itensAprovados,
    itensPendentes,
    itensRecusados,
    itemsByPriority,
    itemsByTier,
    // Utilities
    itemsWithLowMargin,
    calculateSuggestedPrice,
    calculateMargin,
    DEFAULT_MARGIN,
  };
}
