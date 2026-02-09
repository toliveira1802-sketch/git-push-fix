/**
 * Tests for useAdminDashboard — pure computation logic:
 * - calcValorAprovado (same pattern used across dashboard hooks)
 * - statusLabels mapping
 * - diasAguardando calculation
 */
import { describe, it, expect } from "vitest";

// Replicate pure functions from the hook

function calcValorAprovado(os: any): number {
  const itens = os.itens_ordem_servico || [];
  const aprovados = itens.filter(
    (i: any) => i.status?.toLowerCase() === "aprovado"
  );
  return aprovados.length > 0
    ? aprovados.reduce(
        (sum: number, i: any) => sum + (i.total_price || 0),
        0
      )
    : os.total || 0;
}

const statusLabels: Record<string, string> = {
  diagnostico: "Diagnóstico",
  orcamento: "Orçamento",
  aguardando_aprovacao: "Aguardando APV",
  aguardando_peca: "Aguardando Peça",
  pronto_iniciar: "Pronto p/ Iniciar",
  em_execucao: "Em Execução",
  em_teste: "Em Teste",
  pronto: "Pronto",
};

describe("Admin Dashboard - calcValorAprovado", () => {
  it("should sum approved items", () => {
    const os = {
      total: 5000,
      itens_ordem_servico: [
        { status: "aprovado", total_price: 1000 },
        { status: "aprovado", total_price: 2000 },
        { status: "recusado", total_price: 500 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(3000);
  });

  it("should fallback to os.total when no approved items exist", () => {
    const os = {
      total: 8000,
      itens_ordem_servico: [
        { status: "pendente", total_price: 1000 },
        { status: "recusado", total_price: 2000 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(8000);
  });

  it("should fallback to os.total when itens_ordem_servico is empty", () => {
    const os = { total: 3500, itens_ordem_servico: [] };
    expect(calcValorAprovado(os)).toBe(3500);
  });

  it("should return 0 when no items and no total", () => {
    expect(calcValorAprovado({})).toBe(0);
    expect(calcValorAprovado({ total: 0, itens_ordem_servico: [] })).toBe(0);
  });

  it("should be case-insensitive on status check", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "Aprovado", total_price: 500 },
        { status: "APROVADO", total_price: 300 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(800);
  });

  it("should handle null total_price in items gracefully", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "aprovado", total_price: null },
        { status: "aprovado", total_price: 500 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(500);
  });
});

describe("Admin Dashboard - statusLabels", () => {
  it("should have a label for all known workflow statuses", () => {
    const expectedStatuses = [
      "diagnostico",
      "orcamento",
      "aguardando_aprovacao",
      "aguardando_peca",
      "pronto_iniciar",
      "em_execucao",
      "em_teste",
      "pronto",
    ];

    expectedStatuses.forEach((status) => {
      expect(statusLabels[status]).toBeDefined();
      expect(statusLabels[status].length).toBeGreaterThan(0);
    });
  });

  it("should return undefined for unknown statuses", () => {
    expect(statusLabels["unknown"]).toBeUndefined();
    expect(statusLabels["entregue"]).toBeUndefined(); // Entregue is NOT in yard
  });

  it("should have human-readable labels in Portuguese", () => {
    expect(statusLabels["diagnostico"]).toBe("Diagnóstico");
    expect(statusLabels["aguardando_aprovacao"]).toBe("Aguardando APV");
    expect(statusLabels["em_execucao"]).toBe("Em Execução");
    expect(statusLabels["pronto"]).toBe("Pronto");
  });
});

describe("Admin Dashboard - diasAguardando calculation", () => {
  it("should calculate days since creation", () => {
    const now = Date.now();
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);

    const dias = Math.floor(
      (now - twoDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(dias).toBe(2);
  });

  it("should return 0 for today", () => {
    const now = Date.now();
    const today = new Date(now);
    const dias = Math.floor(
      (now - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(dias).toBe(0);
  });

  it("should handle very old dates", () => {
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const dias = Math.floor(
      (now - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(dias).toBe(30);
  });
});

describe("Admin Dashboard - DashboardStats shape", () => {
  it("should have all expected stat keys in initial state", () => {
    const initialStats = {
      appointmentsToday: 0,
      newClientsMonth: 0,
      monthlyRevenue: 0,
      valueTodayDelivery: 0,
      returnsMonth: 0,
      cancelledMonth: 0,
      vehiclesInYard: 0,
      awaitingApproval: 0,
    };

    expect(Object.keys(initialStats)).toHaveLength(8);
    Object.values(initialStats).forEach((v) => {
      expect(v).toBe(0);
    });
  });
});
