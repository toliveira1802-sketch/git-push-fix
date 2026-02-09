import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ----- Supabase mock (vi.hoisted for ESM compat) -----
const { mockSupabase, mockChain } = vi.hoisted(() => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  const mockSupabase = {
    from: vi.fn(() => mockChain),
  };
  return { mockSupabase, mockChain };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

import { useOSItems, type OSItemData } from "./useOSItems";

// -----------------------------------------------------------
// Helper: create mock items
// -----------------------------------------------------------
function makeItem(overrides: Partial<OSItemData> = {}): OSItemData {
  return {
    id: "item-1",
    service_order_id: "os-1",
    description: "Pastilha de freio",
    type: "peca",
    quantity: 2,
    cost_price: 100,
    suggested_price: 140,
    unit_price: 150,
    total_price: 300,
    margin_percent: 50,
    status: "pendente",
    priority: "amarelo",
    notes: null,
    refusal_reason: null,
    discount_justification: null,
    estimated_return_date: null,
    budget_tier: "standard",
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("useOSItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: fetchItems returns empty list
    mockChain.order.mockResolvedValue({ data: [], error: null });
    mockChain.eq.mockReturnValue(mockChain);
    mockChain.select.mockReturnValue(mockChain);
  });

  // -------------------------------------------------------
  // Pure calculation tests (extracted from hook source)
  // -------------------------------------------------------
  describe("calculateSuggestedPrice (via hook)", () => {
    it("should apply default 40% margin", async () => {
      mockChain.order.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // costPrice * (1 + 40/100) = costPrice * 1.4
      expect(result.current.calculateSuggestedPrice(100)).toBe(140);
      expect(result.current.calculateSuggestedPrice(200)).toBe(280);
      expect(result.current.calculateSuggestedPrice(0)).toBe(0);
    });

    it("should apply custom margin", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.calculateSuggestedPrice(100, 50)).toBe(150);
      expect(result.current.calculateSuggestedPrice(100, 0)).toBe(100);
      expect(result.current.calculateSuggestedPrice(100, 100)).toBe(200);
    });
  });

  describe("calculateMargin (via hook)", () => {
    it("should calculate correct margin percentage", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // (unitPrice - costPrice) / costPrice * 100
      expect(result.current.calculateMargin(100, 140)).toBe(40);
      expect(result.current.calculateMargin(100, 200)).toBe(100);
      expect(result.current.calculateMargin(100, 100)).toBe(0);
      expect(result.current.calculateMargin(100, 50)).toBe(-50);
    });

    it("should return 100% margin when cost is 0 (labor)", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.calculateMargin(0, 150)).toBe(100);
      expect(result.current.calculateMargin(-10, 150)).toBe(100);
    });
  });

  describe("DEFAULT_MARGIN", () => {
    it("should be 40", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.DEFAULT_MARGIN).toBe(40);
    });
  });

  // -------------------------------------------------------
  // Computed values from items array
  // -------------------------------------------------------
  describe("computed totals", () => {
    const items: OSItemData[] = [
      makeItem({ id: "1", total_price: 300, status: "aprovado", priority: "vermelho", budget_tier: "premium", margin_percent: 50 }),
      makeItem({ id: "2", total_price: 200, status: "pendente", priority: "amarelo", budget_tier: "standard", margin_percent: 40 }),
      makeItem({ id: "3", total_price: 150, status: "recusado", priority: "verde", budget_tier: "eco", margin_percent: 30 }),
      makeItem({ id: "4", total_price: 100, status: "aprovado", priority: "vermelho", budget_tier: "premium", margin_percent: 20, discount_justification: null }),
    ];

    beforeEach(() => {
      mockChain.order.mockResolvedValue({ data: items, error: null });
    });

    it("should calculate totalOrcado as sum of all items", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalOrcado).toBe(750); // 300+200+150+100
    });

    it("should calculate totalAprovado from approved items", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalAprovado).toBe(400); // 300+100
    });

    it("should calculate totalRecusado from refused items", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalRecusado).toBe(150);
    });

    it("should calculate totalPendente = total - aprovado - recusado", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalPendente).toBe(200); // 750-400-150
    });

    it("should group items by status", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.itensAprovados).toHaveLength(2);
      expect(result.current.itensPendentes).toHaveLength(1);
      expect(result.current.itensRecusados).toHaveLength(1);
    });

    it("should group items by priority", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.itemsByPriority.vermelho).toHaveLength(2);
      expect(result.current.itemsByPriority.amarelo).toHaveLength(1);
      expect(result.current.itemsByPriority.verde).toHaveLength(1);
    });

    it("should group items by budget tier", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.itemsByTier.premium).toHaveLength(2);
      expect(result.current.itemsByTier.standard).toHaveLength(1);
      expect(result.current.itemsByTier.eco).toHaveLength(1);
    });

    it("should detect items with low margin and no justification", async () => {
      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // margin < 40 and no discount_justification
      // item 3: margin 30%, no justification → flagged
      // item 4: margin 20%, no justification → flagged
      expect(result.current.itemsWithLowMargin).toHaveLength(2);
    });
  });

  describe("computed totals with empty items", () => {
    it("should return zero totals when no items", async () => {
      mockChain.order.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useOSItems("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalOrcado).toBe(0);
      expect(result.current.totalAprovado).toBe(0);
      expect(result.current.totalRecusado).toBe(0);
      expect(result.current.totalPendente).toBe(0);
      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemsWithLowMargin).toHaveLength(0);
    });
  });

  // -------------------------------------------------------
  // No serviceOrderId behavior
  // -------------------------------------------------------
  describe("when no serviceOrderId", () => {
    it("should have empty items and not loading", async () => {
      const { result } = renderHook(() => useOSItems(undefined));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items).toEqual([]);
      expect(result.current.totalOrcado).toBe(0);
    });
  });
});
