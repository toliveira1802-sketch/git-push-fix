import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PrioridadeType = "verde" | "amarelo" | "vermelho";
export type ItemStatus = "pendente" | "aprovado" | "recusado";
export type BudgetTier = "premium" | "standard" | "eco";

export interface OSItemData {
  id: string;
  service_order_id: string;
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
        .from("itens_ordem_servico")
        .select("*")
        .eq("service_order_id", serviceOrderId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Map database fields to our interface
      const mappedItems: OSItemData[] = (data || []).map((item) => ({
        id: item.id,
        service_order_id: item.service_order_id,
        description: item.description,
        type: item.type as "peca" | "mao_de_obra",
        quantity: Number(item.quantity) || 1,
        cost_price: Number((item as any).cost_price) || 0,
        suggested_price: (item as any).suggested_price ? Number((item as any).suggested_price) : null,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        margin_percent: Number((item as any).margin_percent) || DEFAULT_MARGIN,
        status: (item.status as ItemStatus) || "pendente",
        priority: (item.priority as PrioridadeType) || "amarelo",
        notes: item.notes,
        refusal_reason: (item as any).refusal_reason || null,
        discount_justification: (item as any).discount_justification || null,
        estimated_return_date: (item as any).estimated_return_date || null,
        budget_tier: ((item as any).budget_tier as BudgetTier) || "standard",
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

      const { error } = await supabase.from("itens_ordem_servico").insert({
        service_order_id: serviceOrderId,
        description: input.description,
        type: input.type,
        quantity: input.quantity,
        unit_price: input.unit_price,
        total_price: totalPrice,
        priority: input.priority,
        status: "pendente",
        notes: input.notes || null,
        cost_price: input.cost_price,
        suggested_price: suggestedPrice,
        margin_percent: calculateMargin(input.cost_price, input.unit_price),
        discount_justification: input.discount_justification || null,
        budget_tier: input.budget_tier || "standard",
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
    updates: Partial<Omit<OSItemData, "id" | "service_order_id" | "created_at">>
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Recalculate total if quantity or unit_price changed
      const item = items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item não encontrado");

      const quantity = updates.quantity ?? item.quantity;
      const unitPrice = updates.unit_price ?? item.unit_price;
      const costPrice = updates.cost_price ?? item.cost_price;

      const updateData: any = { ...updates };

      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        updateData.total_price = quantity * unitPrice;
      }

      if (updates.cost_price !== undefined || updates.unit_price !== undefined) {
        updateData.margin_percent = calculateMargin(costPrice, unitPrice);
      }

      const { error } = await supabase
        .from("itens_ordem_servico")
        .update(updateData)
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
        .from("itens_ordem_servico")
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
        .from("itens_ordem_servico")
        .select("total_price, status, type")
        .eq("service_order_id", serviceOrderId);

      if (fetchError) throw fetchError;

      const total = (freshItems || []).reduce((sum, i) => sum + Number(i.total_price), 0);
      const totalApproved = (freshItems || [])
        .filter((i) => i.status === "aprovado")
        .reduce((sum, i) => sum + Number(i.total_price), 0);
      const totalParts = (freshItems || [])
        .filter((i) => i.type === "peca")
        .reduce((sum, i) => sum + Number(i.total_price), 0);
      const totalLabor = (freshItems || [])
        .filter((i) => i.type === "mao_de_obra")
        .reduce((sum, i) => sum + Number(i.total_price), 0);

      const { error } = await supabase
        .from("ordens_servico")
        .update({
          total,
          total_parts: totalParts,
          total_labor: totalLabor,
          approved_total: totalApproved,
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
