import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock wouter before importing
const mockSetLocation = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/current", mockSetLocation],
}));

import { useNavigate } from "./useNavigate";

describe("useNavigate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.history, "go").mockImplementation(() => {});
  });

  it("should return a function", () => {
    const { result } = renderHook(() => useNavigate());
    expect(typeof result.current).toBe("function");
  });

  it("should call setLocation for string paths", () => {
    const { result } = renderHook(() => useNavigate());

    act(() => {
      result.current("/admin");
    });

    expect(mockSetLocation).toHaveBeenCalledWith("/admin", undefined);
  });

  it("should call setLocation with replace option", () => {
    const { result } = renderHook(() => useNavigate());

    act(() => {
      result.current("/login", { replace: true });
    });

    expect(mockSetLocation).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("should call window.history.go for numeric navigation", () => {
    const { result } = renderHook(() => useNavigate());

    act(() => {
      result.current(-1);
    });

    expect(window.history.go).toHaveBeenCalledWith(-1);
    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it("should handle forward navigation (positive number)", () => {
    const { result } = renderHook(() => useNavigate());

    act(() => {
      result.current(1);
    });

    expect(window.history.go).toHaveBeenCalledWith(1);
  });

  it("should handle go(0) — refresh", () => {
    const { result } = renderHook(() => useNavigate());

    act(() => {
      result.current(0);
    });

    expect(window.history.go).toHaveBeenCalledWith(0);
  });

  it("should navigate to various route paths", () => {
    const { result } = renderHook(() => useNavigate());

    const routes = ["/", "/admin", "/gestao", "/os/123", "/cliente/perfil"];

    routes.forEach((route) => {
      mockSetLocation.mockClear();
      act(() => {
        result.current(route);
      });
      expect(mockSetLocation).toHaveBeenCalledWith(route, undefined);
    });
  });
});
