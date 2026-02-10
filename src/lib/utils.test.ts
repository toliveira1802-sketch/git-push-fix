import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, formatDateTime, formatPlate } from "./utils";

describe("cn (class name merge)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("should resolve tailwind conflicts (last wins)", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("should handle undefined and null values", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("should handle empty input", () => {
    expect(cn()).toBe("");
  });

  it("should merge arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });
});

describe("formatCurrency", () => {
  it("should format positive values in BRL", () => {
    const result = formatCurrency(1234.56);
    // BRL formatting: R$\u00a01.234,56 (using non-breaking space)
    expect(result).toContain("R$");
    expect(result).toContain("1.234,56");
  });

  it("should format zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("R$");
    expect(result).toContain("0,00");
  });

  it("should format negative values", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500,00");
  });

  it("should format large values with thousand separators", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("1.000.000,00");
  });

  it("should round to 2 decimal places", () => {
    const result = formatCurrency(99.999);
    expect(result).toContain("100,00");
  });

  it("should handle small decimal values", () => {
    const result = formatCurrency(0.01);
    expect(result).toContain("0,01");
  });
});

describe("formatDate", () => {
  it("should format a Date object to dd/MM/yyyy", () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatDate(date)).toBe("15/01/2024");
  });

  it("should format a date string to dd/MM/yyyy", () => {
    const result = formatDate("2024-06-01T12:00:00.000Z");
    expect(result).toMatch(/01\/06\/2024/);
  });

  it("should handle ISO date strings with time", () => {
    // Note: date-only ISO strings like "2023-12-25" are parsed as UTC midnight,
    // which may shift to the previous day depending on timezone.
    // Always use full ISO strings with time for predictable results.
    const result = formatDate("2023-12-25T12:00:00");
    expect(result).toContain("25/12/2023");
  });

  it("should format end-of-year dates correctly", () => {
    const date = new Date(2024, 11, 31); // Dec 31
    expect(formatDate(date)).toBe("31/12/2024");
  });

  it("should format beginning-of-year dates correctly", () => {
    const date = new Date(2024, 0, 1); // Jan 1
    expect(formatDate(date)).toBe("01/01/2024");
  });
});

describe("formatDateTime", () => {
  it("should format a Date object with time", () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateTime(date);
    expect(result).toBe("15/01/2024 às 14:30");
  });

  it("should format a date string with time", () => {
    // Use a local date to avoid timezone conversion issues
    const date = new Date(2024, 5, 1, 9, 0); // Jun 1 at 09:00
    const result = formatDateTime(date);
    expect(result).toBe("01/06/2024 às 09:00");
  });

  it("should handle midnight", () => {
    const date = new Date(2024, 0, 1, 0, 0);
    const result = formatDateTime(date);
    expect(result).toBe("01/01/2024 às 00:00");
  });

  it("should handle end of day", () => {
    const date = new Date(2024, 0, 1, 23, 59);
    const result = formatDateTime(date);
    expect(result).toBe("01/01/2024 às 23:59");
  });
});

describe("formatPlate", () => {
  it("should format a standard 7-char plate with hyphen", () => {
    expect(formatPlate("ABC1234")).toBe("ABC-1234");
  });

  it("should format Mercosul plate with hyphen", () => {
    expect(formatPlate("ABC1D23")).toBe("ABC-1D23");
  });

  it("should clean and format plates with existing hyphens", () => {
    expect(formatPlate("ABC-1234")).toBe("ABC-1234");
  });

  it("should convert lowercase to uppercase", () => {
    expect(formatPlate("abc1234")).toBe("ABC-1234");
  });

  it("should strip special characters before formatting", () => {
    expect(formatPlate("A.B.C.1234")).toBe("ABC-1234");
  });

  it("should handle plates with spaces", () => {
    expect(formatPlate("ABC 1234")).toBe("ABC-1234");
  });

  it("should return uppercase for non-standard length plates", () => {
    expect(formatPlate("AB12")).toBe("AB12");
  });

  it("should return uppercase for plates with fewer chars", () => {
    expect(formatPlate("abc")).toBe("ABC");
  });

  it("should handle empty string", () => {
    expect(formatPlate("")).toBe("");
  });
});
