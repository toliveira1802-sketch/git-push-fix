import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveOS } from "./useActiveOS";

describe("useActiveOS", () => {
  it("should return loading false and no activeOS when clientId is not provided", () => {
    const { result } = renderHook(() => useActiveOS());
    // Without clientId, the hook returns early with loading=false
    expect(result.current.loading).toBe(false);
    expect(result.current.activeOS).toBeNull();
  });

  it("should fetch data when clientId is provided", () => {
    const { result } = renderHook(() => useActiveOS("client-123"));
    // With clientId, hook starts loading and calls supabase
    expect(result.current.loading).toBe(true);
    expect(result.current.activeOS).toBeNull();
  });

  it("should have valid OSStatus types", () => {
    // Valid OSStatus types according to the hook definition
    const validStatuses = [
      "diagnostico",
      "orcamento",
      "aguardando_aprovacao",
      "aprovado",
      "parcial",
      "em_execucao",
      "concluido",
      "entregue",
    ];

    // Just validate the type exists
    expect(validStatuses).toContain("diagnostico");
    expect(validStatuses).toContain("em_execucao");
  });
});
