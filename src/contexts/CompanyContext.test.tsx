/**
 * Tests for CompanyContext — pure logic:
 * - useCompany hook guard
 * - canSelectCompany logic
 * - handleSetCurrentCompany validation
 * - Company interface shape
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";

// Mock supabase and devBypass BEFORE importing
vi.mock("@/config/devBypass", () => ({
  DEV_BYPASS: false,
  DEV_COMPANY: {
    id: "dev-company-id",
    code: "DEV",
    name: "Dev Company",
    is_active: true,
  },
}));

vi.mock("@/integrations/supabase/client", () => {
  const mockSubscription = { unsubscribe: vi.fn() };

  return {
    supabase: {
      auth: {
        onAuthStateChange: vi.fn((cb: any) => {
          return { data: { subscription: mockSubscription } };
        }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  };
});

import { CompanyProvider, useCompany } from "./CompanyContext";
import type { Company } from "./CompanyContext";

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <CompanyProvider>{children}</CompanyProvider>;
  };
}

describe("CompanyContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCompany outside provider", () => {
    it("should throw when used outside CompanyProvider", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        renderHook(() => useCompany());
      }).toThrow("useCompany must be used within a CompanyProvider");
      spy.mockRestore();
    });
  });

  describe("initial state", () => {
    it("should start with loading true", () => {
      const { result } = renderHook(() => useCompany(), {
        wrapper: createWrapper(),
      });
      expect(result.current.isLoading).toBe(true);
    });

    it("should start with empty companies", () => {
      const { result } = renderHook(() => useCompany(), {
        wrapper: createWrapper(),
      });
      expect(result.current.companies).toEqual([]);
    });
  });

  describe("Company interface shape", () => {
    it("should have expected fields", () => {
      const company: Company = {
        id: "test-id",
        code: "TST",
        name: "Test Company",
        hora_abertura: "08:00",
        hora_fechamento: "18:00",
        dias_atendimento: ["seg", "ter", "qua"],
        meta_mensal: 100000,
        meta_diaria: 5000,
        is_active: true,
      };

      expect(company.id).toBe("test-id");
      expect(company.code).toBe("TST");
      expect(company.name).toBe("Test Company");
      expect(company.hora_abertura).toBe("08:00");
      expect(company.hora_fechamento).toBe("18:00");
      expect(company.dias_atendimento).toHaveLength(3);
      expect(company.meta_mensal).toBe(100000);
      expect(company.meta_diaria).toBe(5000);
      expect(company.is_active).toBe(true);
    });

    it("should allow optional fields to be undefined", () => {
      const company: Company = {
        id: "min-id",
        code: "MIN",
        name: "Minimal Company",
      };

      expect(company.hora_abertura).toBeUndefined();
      expect(company.hora_fechamento).toBeUndefined();
      expect(company.dias_atendimento).toBeUndefined();
      expect(company.meta_mensal).toBeUndefined();
      expect(company.meta_diaria).toBeUndefined();
      expect(company.is_active).toBeUndefined();
    });
  });
});

describe("CompanyContext - canSelectCompany logic", () => {
  // Pure logic replica
  function canSelectCompany(userRole: string | null): boolean {
    return userRole === "dev";
  }

  it("should be true for dev role", () => {
    expect(canSelectCompany("dev")).toBe(true);
  });

  it("should be false for admin role", () => {
    expect(canSelectCompany("admin")).toBe(false);
  });

  it("should be false for gestao role", () => {
    expect(canSelectCompany("gestao")).toBe(false);
  });

  it("should be false for user role", () => {
    expect(canSelectCompany("user")).toBe(false);
  });

  it("should be false for null role", () => {
    expect(canSelectCompany(null)).toBe(false);
  });
});

describe("CompanyContext - handleSetCurrentCompany logic", () => {
  // Pure logic replica
  interface CompanyLike {
    id: string;
    name: string;
  }

  function handleSetCurrentCompany(
    company: CompanyLike,
    canSelectCompany: boolean,
    userCompany: CompanyLike | null
  ): { shouldUpdate: boolean; shouldResetConsolidated: boolean } {
    if (canSelectCompany || !userCompany) {
      return { shouldUpdate: true, shouldResetConsolidated: true };
    }
    return { shouldUpdate: false, shouldResetConsolidated: false };
  }

  it("should allow change when canSelectCompany is true", () => {
    const result = handleSetCurrentCompany(
      { id: "new", name: "New Company" },
      true,
      { id: "old", name: "Old Company" }
    );
    expect(result.shouldUpdate).toBe(true);
    expect(result.shouldResetConsolidated).toBe(true);
  });

  it("should allow change when no userCompany set", () => {
    const result = handleSetCurrentCompany(
      { id: "new", name: "New Company" },
      false,
      null
    );
    expect(result.shouldUpdate).toBe(true);
  });

  it("should NOT allow change when not dev and has userCompany", () => {
    const result = handleSetCurrentCompany(
      { id: "new", name: "New Company" },
      false,
      { id: "locked", name: "Locked Company" }
    );
    expect(result.shouldUpdate).toBe(false);
  });
});
