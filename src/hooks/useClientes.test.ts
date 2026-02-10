/**
 * Tests for useClientes — pure logic:
 * - Local search filtering logic
 * - Vehicle grouping by client
 * - Computed values (totalClientes, totalVeiculos)
 */
import { describe, it, expect } from "vitest";

// Replicate the local search filtering logic from the hook
interface ClienteLike {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cpf: string | null;
}

function filterClientes(
  clientes: ClienteLike[],
  searchTerm: string
): ClienteLike[] {
  if (!searchTerm) return clientes;

  const term = searchTerm.toLowerCase();
  return clientes.filter(
    (c) =>
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.cpf?.includes(term)
  );
}

// Vehicle grouping logic
interface VeiculoLike {
  id: string;
  client_id: string;
  plate: string;
}

function groupVehiclesByClient(
  veiculos: VeiculoLike[]
): Record<string, VeiculoLike[]> {
  const grouped: Record<string, VeiculoLike[]> = {};
  veiculos.forEach((v) => {
    if (!grouped[v.client_id]) {
      grouped[v.client_id] = [];
    }
    grouped[v.client_id].push(v);
  });
  return grouped;
}

const sampleClientes: ClienteLike[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "11999990001",
    cpf: "12345678901",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "11999990002",
    cpf: "98765432101",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: null,
    phone: "21888880003",
    cpf: null,
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana@empresa.com",
    phone: "11777770004",
    cpf: "11122233344",
  },
];

describe("useClientes - search filter", () => {
  it("should return all clientes when searchTerm is empty", () => {
    expect(filterClientes(sampleClientes, "")).toHaveLength(4);
  });

  it("should filter by name (case-insensitive)", () => {
    const result = filterClientes(sampleClientes, "joão");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("should filter by email", () => {
    const result = filterClientes(sampleClientes, "maria@");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("should filter by phone", () => {
    const result = filterClientes(sampleClientes, "21888");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("should filter by CPF", () => {
    const result = filterClientes(sampleClientes, "987654");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("should match partial names", () => {
    const result = filterClientes(sampleClientes, "silva");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("should return empty when no match", () => {
    const result = filterClientes(sampleClientes, "zzzzz");
    expect(result).toHaveLength(0);
  });

  it("should handle clientes with null fields", () => {
    const result = filterClientes(sampleClientes, "Pedro");
    expect(result).toHaveLength(1);
    expect(result[0].email).toBeNull();
    expect(result[0].cpf).toBeNull();
  });

  it("should match across multiple fields", () => {
    // "11" appears in phone of multiple clients
    const result = filterClientes(sampleClientes, "11");
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe("useClientes - vehicle grouping", () => {
  it("should group vehicles by client_id", () => {
    const veiculos: VeiculoLike[] = [
      { id: "v1", client_id: "c1", plate: "ABC-1234" },
      { id: "v2", client_id: "c1", plate: "DEF-5678" },
      { id: "v3", client_id: "c2", plate: "GHI-9012" },
    ];

    const grouped = groupVehiclesByClient(veiculos);

    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped["c1"]).toHaveLength(2);
    expect(grouped["c2"]).toHaveLength(1);
  });

  it("should handle empty array", () => {
    const grouped = groupVehiclesByClient([]);
    expect(Object.keys(grouped)).toHaveLength(0);
  });

  it("should handle single vehicle", () => {
    const veiculos: VeiculoLike[] = [
      { id: "v1", client_id: "c1", plate: "ABC-1234" },
    ];

    const grouped = groupVehiclesByClient(veiculos);
    expect(grouped["c1"]).toHaveLength(1);
  });
});

describe("useClientes - computed values", () => {
  it("should compute totalClientes from clientes array length", () => {
    expect(sampleClientes.length).toBe(4);
  });

  it("should compute totalVeiculos from flattened grouped vehicles", () => {
    const grouped: Record<string, VeiculoLike[]> = {
      c1: [
        { id: "v1", client_id: "c1", plate: "ABC-1234" },
        { id: "v2", client_id: "c1", plate: "DEF-5678" },
      ],
      c2: [{ id: "v3", client_id: "c2", plate: "GHI-9012" }],
    };

    const totalVeiculos = Object.values(grouped).flat().length;
    expect(totalVeiculos).toBe(3);
  });
});
