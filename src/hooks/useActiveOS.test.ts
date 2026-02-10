import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useActiveOS } from "./useActiveOS";

describe("useActiveOS", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with loading true and no activeOS", () => {
    const { result } = renderHook(() => useActiveOS());
    expect(result.current.loading).toBe(true);
    expect(result.current.activeOS).toBeNull();
  });

  it("should resolve mock data after timeout", async () => {
    const { result } = renderHook(() => useActiveOS());

    // Before timeout
    expect(result.current.loading).toBe(true);
    expect(result.current.activeOS).toBeNull();

    // Advance past the 500ms setTimeout inside act()
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.activeOS).not.toBeNull();
    expect(result.current.activeOS?.id).toBe("os-123");
    expect(result.current.activeOS?.vehiclePlate).toBe("ABC-1234");
    expect(result.current.activeOS?.status).toBe("diagnostico");
    expect(result.current.activeOS?.description).toBe(
      "Diagnóstico geral do motor"
    );
    expect(result.current.activeOS?.createdAt).toBeDefined();
  });

  it("should have valid OSStatus type", async () => {
    const { result } = renderHook(() => useActiveOS());

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const validStatuses = [
      "aberta",
      "diagnostico",
      "aguardando_aprovacao",
      "em_execucao",
      "testes",
      "pronta",
      "finalizada",
    ];
    expect(validStatuses).toContain(result.current.activeOS?.status);
  });
});
