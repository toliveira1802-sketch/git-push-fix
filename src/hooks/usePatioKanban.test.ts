/**
 * Tests for usePatioKanban — focuses on the pure logic:
 * - Status ↔ Etapa mapping
 * - Category detection from problem descriptions
 * - Etapas configuration (all 10 stages)
 */
import { describe, it, expect } from "vitest";

// -------------------------------------------------------
// These maps are defined inside the module but not exported.
// We replicate them here to test the mapping logic.
// Recommendation: export these constants for direct testability.
// -------------------------------------------------------

const statusToEtapa: Record<string, string> = {
  agendamento_confirmado: "agendamento-confirmado",
  diagnostico: "diagnostico",
  orcamento: "orcamento",
  aguardando_aprovacao: "aguardando-apv",
  aguardando_peca: "aguardando-peca",
  pronto_iniciar: "pronto-iniciar",
  em_execucao: "execucao",
  em_teste: "teste",
  pronto: "pronto",
  entregue: "entregue",
};

const etapaToStatus: Record<string, string> = {
  "agendamento-confirmado": "agendamento_confirmado",
  diagnostico: "diagnostico",
  orcamento: "orcamento",
  "aguardando-apv": "aguardando_aprovacao",
  "aguardando-peca": "aguardando_peca",
  "pronto-iniciar": "pronto_iniciar",
  execucao: "em_execucao",
  teste: "em_teste",
  pronto: "pronto",
  entregue: "entregue",
};

function getCategoria(desc: string | null): string {
  if (!desc) return "Geral";
  const lower = desc.toLowerCase();
  if (lower.includes("revisão") || lower.includes("revisao")) return "Revisão";
  if (lower.includes("óleo") || lower.includes("oleo")) return "Troca de Óleo";
  if (lower.includes("freio")) return "Freios";
  if (lower.includes("suspensão") || lower.includes("suspensao")) return "Suspensão";
  if (lower.includes("motor")) return "Motor";
  if (lower.includes("elétric") || lower.includes("eletric")) return "Elétrica";
  if (lower.includes("ar condicionado") || lower.includes("ac")) return "Ar Condicionado";
  return "Manutenção";
}

describe("Patio Kanban - statusToEtapa mapping", () => {
  it("should map all 10 database statuses to kanban etapa IDs", () => {
    expect(Object.keys(statusToEtapa)).toHaveLength(10);
  });

  it("should map agendamento_confirmado → agendamento-confirmado", () => {
    expect(statusToEtapa["agendamento_confirmado"]).toBe("agendamento-confirmado");
  });

  it("should map diagnostico → diagnostico", () => {
    expect(statusToEtapa["diagnostico"]).toBe("diagnostico");
  });

  it("should map aguardando_aprovacao → aguardando-apv", () => {
    expect(statusToEtapa["aguardando_aprovacao"]).toBe("aguardando-apv");
  });

  it("should map em_execucao → execucao", () => {
    expect(statusToEtapa["em_execucao"]).toBe("execucao");
  });

  it("should map em_teste → teste", () => {
    expect(statusToEtapa["em_teste"]).toBe("teste");
  });

  it("should map entregue → entregue", () => {
    expect(statusToEtapa["entregue"]).toBe("entregue");
  });
});

describe("Patio Kanban - etapaToStatus mapping (inverse)", () => {
  it("should map all 10 etapa IDs back to database statuses", () => {
    expect(Object.keys(etapaToStatus)).toHaveLength(10);
  });

  it("should be the inverse of statusToEtapa", () => {
    Object.entries(statusToEtapa).forEach(([dbStatus, etapaId]) => {
      expect(etapaToStatus[etapaId]).toBe(dbStatus);
    });
  });

  it("should round-trip status → etapa → status", () => {
    Object.keys(statusToEtapa).forEach((dbStatus) => {
      const etapaId = statusToEtapa[dbStatus];
      const roundTripped = etapaToStatus[etapaId];
      expect(roundTripped).toBe(dbStatus);
    });
  });
});

describe("Patio Kanban - getCategoria", () => {
  it('should return "Geral" for null', () => {
    expect(getCategoria(null)).toBe("Geral");
  });

  it('should return "Geral" for empty string (falsy)', () => {
    // empty string "" is falsy in JS, so `if (!desc)` catches it → "Geral"
    expect(getCategoria("")).toBe("Geral");
  });

  it('should detect "Revisão" (with accent)', () => {
    expect(getCategoria("Revisão dos 40 mil km")).toBe("Revisão");
  });

  it('should detect "revisao" (without accent)', () => {
    expect(getCategoria("revisao geral")).toBe("Revisão");
  });

  it('should detect "Troca de Óleo" (with accent)', () => {
    expect(getCategoria("Troca de óleo e filtro")).toBe("Troca de Óleo");
  });

  it('should detect "oleo" (without accent)', () => {
    expect(getCategoria("troca de oleo")).toBe("Troca de Óleo");
  });

  it('should detect "Freios"', () => {
    expect(getCategoria("Troca de pastilha de freio")).toBe("Freios");
    expect(getCategoria("FREIO traseiro com ruído")).toBe("Freios");
  });

  it('should detect "Suspensão"', () => {
    expect(getCategoria("Problema na suspensão dianteira")).toBe("Suspensão");
    expect(getCategoria("suspensao traseira")).toBe("Suspensão");
  });

  it('should detect "Motor"', () => {
    expect(getCategoria("Motor falhando em baixa rotação")).toBe("Motor");
  });

  it('should detect "Elétrica"', () => {
    expect(getCategoria("Problema elétrico no painel")).toBe("Elétrica");
    expect(getCategoria("sistema eletrico")).toBe("Elétrica");
  });

  it('should detect "Ar Condicionado"', () => {
    expect(getCategoria("Ar condicionado não gela")).toBe("Ar Condicionado");
    expect(getCategoria("manutenção do ac")).toBe("Ar Condicionado");
  });

  it('should default to "Manutenção" for unmatched descriptions', () => {
    expect(getCategoria("Pintura e polimento")).toBe("Manutenção");
    expect(getCategoria("Alinhamento e balanceamento")).toBe("Manutenção");
    expect(getCategoria("Funilaria geral")).toBe("Manutenção");
  });

  it("should prioritize first match (revisão before motor)", () => {
    // "revisão do motor" should match "revisão" first
    expect(getCategoria("Revisão do motor")).toBe("Revisão");
  });
});

describe("Patio Kanban - calcValorAprovado logic", () => {
  // Replicating the function since it's not exported
  const calcValorAprovado = (os: any): number => {
    const itens = os.itens_ordem_servico || [];
    const aprovados = itens.filter((i: any) => i.status?.toLowerCase() === "aprovado");
    return aprovados.length > 0
      ? aprovados.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0)
      : os.total || 0;
  };

  it("should sum approved items total_price", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "aprovado", total_price: 300 },
        { status: "aprovado", total_price: 200 },
        { status: "pendente", total_price: 500 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(500); // 300+200
  });

  it("should fall back to os.total when no items have approved status", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "pendente", total_price: 500 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(1000);
  });

  it("should fall back to os.total when itens_ordem_servico is empty", () => {
    const os = { total: 750, itens_ordem_servico: [] };
    expect(calcValorAprovado(os)).toBe(750);
  });

  it("should fall back to os.total when itens_ordem_servico is missing", () => {
    const os = { total: 500 };
    expect(calcValorAprovado(os)).toBe(500);
  });

  it("should return 0 when no items and no total", () => {
    const os = {};
    expect(calcValorAprovado(os)).toBe(0);
  });

  it("should handle case-insensitive status matching", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "Aprovado", total_price: 400 },
        { status: "APROVADO", total_price: 100 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(500);
  });

  it("should handle null total_price in items", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "aprovado", total_price: null },
        { status: "aprovado", total_price: 200 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(200);
  });
});
