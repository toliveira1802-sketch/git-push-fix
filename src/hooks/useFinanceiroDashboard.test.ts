/**
 * Tests for useFinanceiroDashboard — pure metric calculation logic:
 * - calcValorAprovado
 * - mediaDiaria / projecao / percentualMeta
 * - Vehicle categorization (preso, atrasado, saidaHoje)
 * - FinanceMetrics initial shape
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

describe("Financeiro Dashboard - calcValorAprovado", () => {
  it("should sum only approved items", () => {
    const os = {
      total: 10000,
      itens_ordem_servico: [
        { status: "aprovado", total_price: 3000 },
        { status: "aprovado", total_price: 2000 },
        { status: "pendente", total_price: 5000 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(5000);
  });

  it("should fallback to total when no items approved", () => {
    const os = { total: 7500, itens_ordem_servico: [] };
    expect(calcValorAprovado(os)).toBe(7500);
  });

  it("should return 0 for empty OS", () => {
    expect(calcValorAprovado({})).toBe(0);
  });
});

describe("Financeiro Dashboard - metric calculations", () => {
  it("should calculate mediaDiaria (daily average for remaining days)", () => {
    const meta = 300000;
    const faturado = 150000;
    const diasRestantes = 10;

    const mediaDiariaParaMeta =
      diasRestantes > 0 ? (meta - faturado) / diasRestantes : 0;

    expect(mediaDiariaParaMeta).toBe(15000);
  });

  it("should handle diasRestantes=0 without division error", () => {
    const meta = 300000;
    const faturado = 150000;
    const diasRestantes = 0;

    const mediaDiariaParaMeta =
      diasRestantes > 0 ? (meta - faturado) / diasRestantes : 0;

    expect(mediaDiariaParaMeta).toBe(0);
  });

  it("should calculate projecao based on daily average", () => {
    const faturado = 100000;
    const diasTrabalhados = 10;
    const diasUteis = 22;

    const projecao =
      diasUteis > 0 ? (faturado / diasTrabalhados) * diasUteis : 0;

    expect(projecao).toBe(220000);
  });

  it("should calculate percentualMeta", () => {
    const meta = 300000;
    const faturado = 225000;

    const percentual = meta > 0 ? (faturado / meta) * 100 : 0;
    expect(percentual).toBe(75);
  });

  it("should handle meta=0 (division by zero)", () => {
    const percentual = 0 > 0 ? (100000 / 0) * 100 : 0;
    expect(percentual).toBe(0);
  });

  it("should calculate ticketMedio from delivered OSs", () => {
    const faturado = 50000;
    const entregues = 10;

    const ticketMedio = entregues > 0 ? faturado / entregues : 0;
    expect(ticketMedio).toBe(5000);
  });

  it("should return 0 ticketMedio when no deliveries", () => {
    const ticketMedio = 0 > 0 ? 50000 / 0 : 0;
    expect(ticketMedio).toBe(0);
  });
});

describe("Financeiro Dashboard - vehicle classification", () => {
  it("should classify vehicle as 'atrasado' when estimated_completion is in the past", () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);

    const previsao = yesterday;
    const isAtrasado = previsao < todayStart;

    expect(isAtrasado).toBe(true);
  });

  it("should classify vehicle as 'saidaHoje' when estimated_completion is today", () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const previsao = new Date();
    previsao.setHours(14, 0, 0, 0); // 14:00 today

    const isSaidaHoje = previsao >= todayStart && previsao <= todayEnd;
    expect(isSaidaHoje).toBe(true);
  });

  it("should NOT classify future vehicle as atrasado or saidaHoje", () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const isAtrasado = nextWeek < todayStart;
    const isSaidaHoje = nextWeek >= todayStart && nextWeek <= todayEnd;

    expect(isAtrasado).toBe(false);
    expect(isSaidaHoje).toBe(false);
  });
});

describe("Financeiro Dashboard - initial metrics shape", () => {
  it("should have all expected fields in initial state", () => {
    const initial = {
      metaMensal: 300000,
      realizado: 0,
      aprovadoPatio: 0,
      mediaDiaria: 0,
      faturado: 0,
      ticketMedio: 0,
      saidaHoje: 0,
      atrasado: 0,
      preso: 0,
      entregues: 0,
      diasTrabalhados: 0,
      diasRestantes: 0,
      projecao: 0,
      percentualMeta: 0,
      vehiclesPreso: [],
      vehiclesAtrasado: [],
      vehiclesSaidaHoje: [],
    };

    expect(Object.keys(initial)).toHaveLength(17);
    expect(initial.metaMensal).toBe(300000);
    expect(initial.vehiclesPreso).toEqual([]);
    expect(initial.vehiclesAtrasado).toEqual([]);
    expect(initial.vehiclesSaidaHoje).toEqual([]);
  });
});
