/**
 * Tests for useProdutividadeDashboard — focuses on pure logic:
 * - Ranking emoji assignment
 * - calcValorAprovado calculation
 * - Mechanic ranking sorting
 * - Metric projections
 */
import { describe, it, expect } from "vitest";

// -------------------------------------------------------
// Pure function replicas from the hook (not exported)
// -------------------------------------------------------

function getEmojiForRanking(ranking: number): string {
  const emojis = ["🏆", "🥈", "🥉", "⭐", "🔧", "🛠️"];
  return emojis[ranking - 1] || "🔩";
}

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

describe("Produtividade Dashboard - getEmojiForRanking", () => {
  it("should return 🏆 for rank 1", () => {
    expect(getEmojiForRanking(1)).toBe("🏆");
  });

  it("should return 🥈 for rank 2", () => {
    expect(getEmojiForRanking(2)).toBe("🥈");
  });

  it("should return 🥉 for rank 3", () => {
    expect(getEmojiForRanking(3)).toBe("🥉");
  });

  it("should return ⭐ for rank 4", () => {
    expect(getEmojiForRanking(4)).toBe("⭐");
  });

  it("should return 🔧 for rank 5", () => {
    expect(getEmojiForRanking(5)).toBe("🔧");
  });

  it("should return 🛠️ for rank 6", () => {
    expect(getEmojiForRanking(6)).toBe("🛠️");
  });

  it("should return 🔩 for rank 7 and beyond", () => {
    expect(getEmojiForRanking(7)).toBe("🔩");
    expect(getEmojiForRanking(10)).toBe("🔩");
    expect(getEmojiForRanking(100)).toBe("🔩");
  });

  it("should return 🔩 for rank 0 or negative", () => {
    expect(getEmojiForRanking(0)).toBe("🔩");
    expect(getEmojiForRanking(-1)).toBe("🔩");
  });
});

describe("Produtividade Dashboard - calcValorAprovado", () => {
  it("should sum approved items", () => {
    const os = {
      total: 1000,
      itens_ordem_servico: [
        { status: "aprovado", total_price: 500 },
        { status: "aprovado", total_price: 300 },
        { status: "pendente", total_price: 200 },
      ],
    };
    expect(calcValorAprovado(os)).toBe(800);
  });

  it("should fallback to os.total when no approved items", () => {
    const os = {
      total: 1500,
      itens_ordem_servico: [{ status: "pendente", total_price: 500 }],
    };
    expect(calcValorAprovado(os)).toBe(1500);
  });

  it("should return 0 with no items and no total", () => {
    expect(calcValorAprovado({})).toBe(0);
  });
});

describe("Produtividade Dashboard - mechanic ranking logic", () => {
  // Simulate the ranking algorithm from the hook
  interface MechanicStat {
    id: string;
    name: string;
    valor: number;
    carros: number;
    metaPorMecanico: number;
  }

  function buildRanking(stats: MechanicStat[]) {
    const ranking = stats.map((m) => {
      const ticketMedio = m.carros > 0 ? m.valor / m.carros : 0;
      const percentual =
        m.metaPorMecanico > 0
          ? (m.valor / m.metaPorMecanico) * 100
          : 0;

      return {
        id: m.id,
        name: m.name,
        valorProduzido: m.valor,
        carrosAtendidos: m.carros,
        ticketMedio,
        metaMensal: m.metaPorMecanico,
        percentualMeta: percentual,
        ranking: 0,
        emoji: "",
      };
    });

    // Sort by valor descending
    ranking.sort((a, b) => b.valorProduzido - a.valorProduzido);

    // Assign ranking and emoji
    ranking.forEach((m, i) => {
      m.ranking = i + 1;
      if (m.id !== "terceirizado") {
        m.emoji = getEmojiForRanking(i + 1);
      }
    });

    return ranking;
  }

  it("should sort mechanics by valor descending", () => {
    const stats: MechanicStat[] = [
      { id: "m1", name: "Carlos", valor: 30000, carros: 5, metaPorMecanico: 60000 },
      { id: "m2", name: "João", valor: 50000, carros: 8, metaPorMecanico: 60000 },
      { id: "m3", name: "Ana", valor: 45000, carros: 7, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);

    expect(ranking[0].name).toBe("João");
    expect(ranking[1].name).toBe("Ana");
    expect(ranking[2].name).toBe("Carlos");
  });

  it("should assign correct ranking numbers", () => {
    const stats: MechanicStat[] = [
      { id: "m1", name: "A", valor: 100, carros: 1, metaPorMecanico: 60000 },
      { id: "m2", name: "B", valor: 200, carros: 2, metaPorMecanico: 60000 },
      { id: "m3", name: "C", valor: 300, carros: 3, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);
    expect(ranking[0].ranking).toBe(1);
    expect(ranking[1].ranking).toBe(2);
    expect(ranking[2].ranking).toBe(3);
  });

  it("should assign correct emojis based on ranking position", () => {
    const stats: MechanicStat[] = [
      { id: "m1", name: "1st", valor: 500, carros: 5, metaPorMecanico: 60000 },
      { id: "m2", name: "2nd", valor: 400, carros: 4, metaPorMecanico: 60000 },
      { id: "m3", name: "3rd", valor: 300, carros: 3, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);
    expect(ranking[0].emoji).toBe("🏆");
    expect(ranking[1].emoji).toBe("🥈");
    expect(ranking[2].emoji).toBe("🥉");
  });

  it("should calculate ticket médio correctly", () => {
    const stats: MechanicStat[] = [
      { id: "m1", name: "A", valor: 50000, carros: 10, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);
    expect(ranking[0].ticketMedio).toBe(5000);
  });

  it("should handle mechanic with 0 cars (ticket medio = 0)", () => {
    const stats: MechanicStat[] = [
      { id: "m1", name: "New", valor: 0, carros: 0, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);
    expect(ranking[0].ticketMedio).toBe(0);
  });

  it("should calculate percentualMeta correctly", () => {
    const stats: MechanicStat[] = [
      { id: "m1", name: "A", valor: 30000, carros: 5, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);
    expect(ranking[0].percentualMeta).toBe(50); // 30000/60000 * 100
  });

  it("should not assign emoji to 'terceirizado'", () => {
    const stats: MechanicStat[] = [
      { id: "terceirizado", name: "TERCEIRIZADO", valor: 10000, carros: 2, metaPorMecanico: 60000 },
      { id: "m1", name: "Carlos", valor: 5000, carros: 1, metaPorMecanico: 60000 },
    ];

    const ranking = buildRanking(stats);
    const terc = ranking.find((m) => m.id === "terceirizado")!;
    expect(terc.emoji).toBe(""); // Terceirizado keeps empty, gets 🏭 in hook
  });
});

describe("Produtividade Dashboard - projection calculations", () => {
  it("should project monthly total based on daily average", () => {
    const realizadoTotal = 100000;
    const diasTrabalhados = 10;
    const diasUteis = 24;

    const projecao =
      diasTrabalhados > 0
        ? (realizadoTotal / diasTrabalhados) * diasUteis
        : 0;

    expect(projecao).toBe(240000);
  });

  it("should calculate faltam (remaining to goal)", () => {
    const meta = 300000;
    const realizadoTotal = 180000;
    const faltam = Math.max(0, meta - realizadoTotal);

    expect(faltam).toBe(120000);
  });

  it("should not allow faltam to go negative", () => {
    const meta = 300000;
    const realizadoTotal = 350000;
    const faltam = Math.max(0, meta - realizadoTotal);

    expect(faltam).toBe(0);
  });

  it("should calculate percentualMeta correctly", () => {
    const meta = 300000;
    const realizadoTotal = 225000;
    const percentual = meta > 0 ? (realizadoTotal / meta) * 100 : 0;

    expect(percentual).toBe(75);
  });

  it("should handle zero meta without division error", () => {
    const meta = 0;
    const realizadoTotal = 100000;
    const percentual = meta > 0 ? (realizadoTotal / meta) * 100 : 0;

    expect(percentual).toBe(0);
  });

  it("should handle zero diasTrabalhados without division error", () => {
    const realizadoTotal = 0;
    const diasTrabalhados = 0;
    const diasUteis = 24;
    const projecao =
      diasTrabalhados > 0
        ? (realizadoTotal / diasTrabalhados) * diasUteis
        : 0;

    expect(projecao).toBe(0);
  });
});
