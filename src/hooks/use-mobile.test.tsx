import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;
  let matchMediaListeners: Array<() => void> = [];

  beforeEach(() => {
    matchMediaListeners = [];

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, listener: () => void) => {
          matchMediaListeners.push(listener);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    });
  });

  it("should return false when window width is >= 768", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should return true when window width is < 768", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 375 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should return false at exactly 768px", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 768 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should return true at 767px", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 767 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should update when window resizes", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    Object.defineProperty(window, "innerWidth", { writable: true, value: 375 });
    act(() => {
      matchMediaListeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  it("should register matchMedia listener with correct breakpoint", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });

    renderHook(() => useIsMobile());

    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("should cleanup listener on unmount", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });

    const removeEventListener = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener,
        dispatchEvent: vi.fn(),
      })),
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
