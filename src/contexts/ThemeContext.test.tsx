import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";

function createWrapper(props?: { defaultTheme?: "light" | "dark"; switchable?: boolean }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider {...props}>{children}</ThemeProvider>;
  };
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  describe("useTheme outside provider", () => {
    it("should throw an error when used outside ThemeProvider", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within ThemeProvider");
      spy.mockRestore();
    });
  });

  describe("default behavior (not switchable)", () => {
    it("should default to light theme", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(),
      });
      expect(result.current.theme).toBe("light");
    });

    it("should accept a defaultTheme prop", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "dark" }),
      });
      expect(result.current.theme).toBe("dark");
    });

    it("should not have toggleTheme when not switchable", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: false }),
      });
      expect(result.current.toggleTheme).toBeUndefined();
    });

    it("should report switchable as false", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(),
      });
      expect(result.current.switchable).toBe(false);
    });

    it("should apply dark class to documentElement when theme is dark", () => {
      renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "dark" }),
      });
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should not apply dark class when theme is light", () => {
      renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "light" }),
      });
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("switchable behavior", () => {
    it("should provide toggleTheme when switchable", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true }),
      });
      expect(result.current.toggleTheme).toBeDefined();
      expect(typeof result.current.toggleTheme).toBe("function");
    });

    it("should toggle from light to dark", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true, defaultTheme: "light" }),
      });

      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.toggleTheme!();
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should toggle from dark to light", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true, defaultTheme: "dark" }),
      });

      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.toggleTheme!();
      });

      expect(result.current.theme).toBe("light");
    });

    it("should toggle back and forth", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true, defaultTheme: "light" }),
      });

      act(() => result.current.toggleTheme!());
      expect(result.current.theme).toBe("dark");

      act(() => result.current.toggleTheme!());
      expect(result.current.theme).toBe("light");

      act(() => result.current.toggleTheme!());
      expect(result.current.theme).toBe("dark");
    });

    it("should persist theme to localStorage when switchable", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true, defaultTheme: "light" }),
      });

      act(() => {
        result.current.toggleTheme!();
      });

      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("should read persisted theme from localStorage", () => {
      localStorage.setItem("theme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true, defaultTheme: "light" }),
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should update dark class on documentElement when toggling", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: true, defaultTheme: "light" }),
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);

      act(() => result.current.toggleTheme!());
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => result.current.toggleTheme!());
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("non-switchable localStorage behavior", () => {
    it("should NOT persist theme when not switchable", () => {
      renderHook(() => useTheme(), {
        wrapper: createWrapper({ switchable: false, defaultTheme: "dark" }),
      });

      // When not switchable, the theme should NOT be written to localStorage
      expect(localStorage.getItem("theme")).toBeNull();
    });
  });
});
