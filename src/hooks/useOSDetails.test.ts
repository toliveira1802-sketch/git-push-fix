import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const { mockSupabase, mockChain } = vi.hoisted(() => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
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
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useOSDetails } from "./useOSDetails";

const fullOSData = {
  id: "os-1",
  order_number: "OS-2024-001",
  status: "diagnostico",
  priority: "alta",
  problem_description: "Motor falhando",
  diagnosis: null,
  observations: null,
  entry_km: 45000,
  entry_checklist: { farol: true, pneu: false },
  estimated_completion: "2024-02-15",
  total: 1500,
  total_parts: 800,
  total_labor: 700,
  total_discount: 0,
  approved_total: 1200,
  payment_status: null,
  payment_method: null,
  em_terceiros: false,
  recurso: null,
  created_at: "2024-01-15T10:00:00Z",
  completed_at: null,
  budget_sent_at: null,
  budget_approved_at: null,
  clientes: { id: "c-1", name: "João Silva", phone: "11999999999", email: "joao@test.com" },
  veiculos: { id: "v-1", plate: "ABC-1234", brand: "FIAT", model: "PALIO", year: 2020, color: "Prata", km: 45000 },
  mecanicos: { id: "m-1", name: "Carlos" },
};

describe("useOSDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: single returns full OS, order returns empty history
    mockChain.single.mockResolvedValue({ data: fullOSData, error: null });
    mockChain.order.mockResolvedValue({ data: [], error: null });
    mockChain.insert.mockResolvedValue({ error: null });
    mockChain.eq.mockReturnValue(mockChain);
    mockChain.select.mockReturnValue(mockChain);
    mockChain.update.mockReturnValue(mockChain);
  });

  describe("when no osId", () => {
    it("should have null OS and not loading", async () => {
      const { result } = renderHook(() => useOSDetails(undefined));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os).toBeNull();
      expect(result.current.history).toEqual([]);
    });
  });

  describe("data fetching", () => {
    it("should fetch OS and set data correctly", async () => {
      const { result } = renderHook(() => useOSDetails("os-1"));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os).not.toBeNull();
      expect(result.current.os?.id).toBe("os-1");
      expect(result.current.os?.order_number).toBe("OS-2024-001");
      expect(result.current.os?.status).toBe("diagnostico");
      expect(result.current.os?.total).toBe(1500);
      expect(result.current.os?.total_parts).toBe(800);
      expect(result.current.os?.total_labor).toBe(700);
    });

    it("should map client data", async () => {
      const { result } = renderHook(() => useOSDetails("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os?.client).toEqual({
        id: "c-1",
        name: "João Silva",
        phone: "11999999999",
        email: "joao@test.com",
      });
    });

    it("should map vehicle data", async () => {
      const { result } = renderHook(() => useOSDetails("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os?.vehicle).toEqual({
        id: "v-1",
        plate: "ABC-1234",
        brand: "FIAT",
        model: "PALIO",
        year: 2020,
        color: "Prata",
        km: 45000,
      });
    });

    it("should map mechanic data", async () => {
      const { result } = renderHook(() => useOSDetails("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os?.mechanic).toEqual({
        id: "m-1",
        name: "Carlos",
      });
    });

    it("should handle null related data (no client/vehicle/mechanic)", async () => {
      mockChain.single.mockResolvedValue({
        data: {
          ...fullOSData,
          clientes: null,
          veiculos: null,
          mecanicos: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useOSDetails("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os?.client).toBeNull();
      expect(result.current.os?.vehicle).toBeNull();
      expect(result.current.os?.mechanic).toBeNull();
    });
  });

  describe("history fetching", () => {
    it("should fetch history events", async () => {
      mockChain.order.mockResolvedValue({
        data: [
          {
            id: "h-1",
            event_type: "status_change",
            description: "Status alterado para diagnostico",
            created_at: "2024-01-15T10:05:00Z",
            metadata: null,
          },
          {
            id: "h-2",
            event_type: "created",
            description: "OS criada",
            created_at: "2024-01-15T10:00:00Z",
            metadata: { by: "admin" },
          },
        ],
        error: null,
      });

      const { result } = renderHook(() => useOSDetails("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].event_type).toBe("status_change");
      expect(result.current.history[1].metadata).toEqual({ by: "admin" });
    });
  });

  describe("error handling", () => {
    it("should handle fetch error gracefully", async () => {
      mockChain.single.mockResolvedValue({
        data: null,
        error: new Error("DB error"),
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useOSDetails("os-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.os).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
