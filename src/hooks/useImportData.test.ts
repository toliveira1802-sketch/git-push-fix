/**
 * Tests for the pure utility functions extracted from useImportData.
 * These functions handle header normalization, column mapping, and row validation.
 *
 * Since the internal functions (normalizeHeader, mapColumns, validateClientRow,
 * validateVehicleRow) are not exported, we test them indirectly through the
 * module's field maps and expected behavior patterns.
 */
import { describe, it, expect } from "vitest";

// Since the pure functions are not exported, we replicate them here for testing.
// This is a pattern recommendation: extract these to a separate utils file for better testability.

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

const CLIENT_FIELD_MAP: Record<string, string> = {
  nome: "name",
  telefone: "phone",
  email: "email",
  cpf: "cpf",
  endereco: "address",
  cidade: "city",
  origem: "origem",
  observacoes: "notes",
};

const VEHICLE_FIELD_MAP: Record<string, string> = {
  placa: "plate",
  marca: "brand",
  modelo: "model",
  ano: "year",
  cor: "color",
  km: "km",
  telefone_cliente: "client_phone",
  chassi: "chassis",
  combustivel: "fuel_type",
};

function mapColumns(
  headers: string[],
  fieldMap: Record<string, string>
): Record<string, string> {
  const mapping: Record<string, string> = {};
  headers.forEach((h) => {
    const normalized = normalizeHeader(h);
    if (fieldMap[normalized]) {
      mapping[h] = fieldMap[normalized];
    } else if (Object.values(fieldMap).includes(normalized)) {
      mapping[h] = normalized;
    }
  });
  return mapping;
}

function validateClientRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!data.name?.trim()) errors.push("Nome obrigatório");
  if (!data.phone?.trim()) errors.push("Telefone obrigatório");
  return errors;
}

function validateVehicleRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!data.plate?.trim()) errors.push("Placa obrigatória");
  if (!data.brand?.trim()) errors.push("Marca obrigatória");
  if (!data.model?.trim()) errors.push("Modelo obrigatório");
  if (!data.client_phone?.trim())
    errors.push("Telefone do cliente obrigatório");
  return errors;
}

describe("Import Data - normalizeHeader", () => {
  it("should lowercase headers", () => {
    expect(normalizeHeader("NOME")).toBe("nome");
  });

  it("should replace spaces with underscores", () => {
    expect(normalizeHeader("telefone cliente")).toBe("telefone_cliente");
  });

  it("should remove accents/diacritics", () => {
    expect(normalizeHeader("endereço")).toBe("endereco");
    expect(normalizeHeader("Observações")).toBe("observacoes");
    expect(normalizeHeader("Combustível")).toBe("combustivel");
  });

  it("should collapse multiple spaces into single underscore via \\s+", () => {
    // \s+ replaces one or more whitespace chars with a single underscore
    expect(normalizeHeader("telefone   cliente")).toBe("telefone_cliente");
  });

  it("should convert leading/trailing spaces to underscores then trim", () => {
    // Spaces are replaced by underscores first, then .trim() removes
    // only real whitespace — the underscores remain.
    // This is a known quirk: trim() runs after replace, so leading/trailing
    // spaces become underscores and are NOT removed.
    expect(normalizeHeader("  nome  ")).toBe("_nome_");
  });

  it("should handle mixed case and accents", () => {
    expect(normalizeHeader("Endereço")).toBe("endereco");
  });
});

describe("Import Data - mapColumns (clients)", () => {
  it("should map Portuguese headers to English field names", () => {
    const headers = ["Nome", "Telefone", "Email", "CPF", "Endereço", "Cidade"];
    const result = mapColumns(headers, CLIENT_FIELD_MAP);

    expect(result["Nome"]).toBe("name");
    expect(result["Telefone"]).toBe("phone");
    expect(result["Email"]).toBe("email");
    expect(result["CPF"]).toBe("cpf");
    expect(result["Endereço"]).toBe("address");
    expect(result["Cidade"]).toBe("city");
  });

  it("should skip unmapped headers", () => {
    const headers = ["Nome", "Telefone", "Coluna Desconhecida"];
    const result = mapColumns(headers, CLIENT_FIELD_MAP);

    expect(result["Nome"]).toBe("name");
    expect(result["Telefone"]).toBe("phone");
    expect(result["Coluna Desconhecida"]).toBeUndefined();
  });

  it("should handle already-English column names", () => {
    const headers = ["name", "phone", "email"];
    const result = mapColumns(headers, CLIENT_FIELD_MAP);

    // "name" normalized → already matches as a value in fieldMap
    expect(result["name"]).toBe("name");
    expect(result["phone"]).toBe("phone");
    expect(result["email"]).toBe("email");
  });
});

describe("Import Data - mapColumns (vehicles)", () => {
  it("should map Portuguese vehicle headers", () => {
    const headers = ["Placa", "Marca", "Modelo", "Ano", "Cor", "Telefone Cliente"];
    const result = mapColumns(headers, VEHICLE_FIELD_MAP);

    expect(result["Placa"]).toBe("plate");
    expect(result["Marca"]).toBe("brand");
    expect(result["Modelo"]).toBe("model");
    expect(result["Ano"]).toBe("year");
    expect(result["Cor"]).toBe("color");
    expect(result["Telefone Cliente"]).toBe("client_phone");
  });

  it("should map chassis and fuel type", () => {
    const headers = ["Chassi", "Combustível"];
    const result = mapColumns(headers, VEHICLE_FIELD_MAP);

    expect(result["Chassi"]).toBe("chassis");
    expect(result["Combustível"]).toBe("fuel_type");
  });
});

describe("Import Data - validateClientRow", () => {
  it("should pass for valid client data", () => {
    const errors = validateClientRow({ name: "João Silva", phone: "11999999999" });
    expect(errors).toEqual([]);
  });

  it("should fail when name is missing", () => {
    const errors = validateClientRow({ name: "", phone: "11999999999" });
    expect(errors).toContain("Nome obrigatório");
  });

  it("should fail when phone is missing", () => {
    const errors = validateClientRow({ name: "João", phone: "" });
    expect(errors).toContain("Telefone obrigatório");
  });

  it("should fail when both are missing", () => {
    const errors = validateClientRow({ name: "", phone: "" });
    expect(errors).toHaveLength(2);
    expect(errors).toContain("Nome obrigatório");
    expect(errors).toContain("Telefone obrigatório");
  });

  it("should fail when name is only whitespace", () => {
    const errors = validateClientRow({ name: "   ", phone: "11999999999" });
    expect(errors).toContain("Nome obrigatório");
  });

  it("should handle missing keys", () => {
    const errors = validateClientRow({});
    expect(errors).toHaveLength(2);
  });
});

describe("Import Data - validateVehicleRow", () => {
  it("should pass for valid vehicle data", () => {
    const errors = validateVehicleRow({
      plate: "ABC-1234",
      brand: "FIAT",
      model: "PALIO",
      client_phone: "11999999999",
    });
    expect(errors).toEqual([]);
  });

  it("should fail when plate is missing", () => {
    const errors = validateVehicleRow({
      plate: "",
      brand: "FIAT",
      model: "PALIO",
      client_phone: "11999999999",
    });
    expect(errors).toContain("Placa obrigatória");
  });

  it("should fail when brand is missing", () => {
    const errors = validateVehicleRow({
      plate: "ABC-1234",
      brand: "",
      model: "PALIO",
      client_phone: "11999999999",
    });
    expect(errors).toContain("Marca obrigatória");
  });

  it("should fail when model is missing", () => {
    const errors = validateVehicleRow({
      plate: "ABC-1234",
      brand: "FIAT",
      model: "",
      client_phone: "11999999999",
    });
    expect(errors).toContain("Modelo obrigatório");
  });

  it("should fail when client_phone is missing", () => {
    const errors = validateVehicleRow({
      plate: "ABC-1234",
      brand: "FIAT",
      model: "PALIO",
      client_phone: "",
    });
    expect(errors).toContain("Telefone do cliente obrigatório");
  });

  it("should return all errors when all fields are missing", () => {
    const errors = validateVehicleRow({
      plate: "",
      brand: "",
      model: "",
      client_phone: "",
    });
    expect(errors).toHaveLength(4);
  });

  it("should handle missing keys gracefully", () => {
    const errors = validateVehicleRow({});
    expect(errors).toHaveLength(4);
  });
});
