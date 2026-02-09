import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePersistFn } from "./usePersistFn";

describe("usePersistFn", () => {
  it("should return a function", () => {
    const { result } = renderHook(() => usePersistFn(() => "hello"));
    expect(typeof result.current).toBe("function");
  });

  it("should call the original function with arguments", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const { result } = renderHook(() => usePersistFn(fn));

    const returnValue = result.current(2, 3);

    expect(fn).toHaveBeenCalledWith(2, 3);
    expect(returnValue).toBe(5);
  });

  it("should maintain a stable function reference across re-renders", () => {
    const { result, rerender } = renderHook(
      ({ fn }: { fn: () => string }) => usePersistFn(fn),
      { initialProps: { fn: (() => "first") as () => string } }
    );

    const firstRef = result.current;

    rerender({ fn: (() => "second") as () => string });

    const secondRef = result.current;

    // The returned function reference should remain the same
    expect(firstRef).toBe(secondRef);
  });

  it("should always call the latest version of the function", () => {
    let counter = 0;
    const { result, rerender } = renderHook(
      ({ fn }) => usePersistFn(fn),
      { initialProps: { fn: () => ++counter } }
    );

    // First call
    result.current();
    expect(counter).toBe(1);

    // After rerender with a new fn that doubles
    let doubled = 0;
    rerender({ fn: () => { doubled = counter * 2; return doubled; } });

    // Should use the latest fn
    result.current();
    expect(doubled).toBe(2);
  });

  it("should handle functions with no return value", () => {
    const sideEffect = vi.fn();
    const { result } = renderHook(() => usePersistFn(sideEffect));

    result.current();
    expect(sideEffect).toHaveBeenCalledTimes(1);
  });

  it("should forward this context correctly", () => {
    const fn = vi.fn(function (this: { value: number }) {
      return this?.value;
    });
    const { result } = renderHook(() => usePersistFn(fn));

    const context = { value: 42 };
    const returnValue = result.current.call(context);

    expect(returnValue).toBe(42);
  });

  it("should handle multiple arguments", () => {
    const fn = vi.fn((...args: string[]) => args.join(", "));
    const { result } = renderHook(() => usePersistFn(fn));

    const returnValue = result.current("a", "b", "c");
    expect(returnValue).toBe("a, b, c");
    expect(fn).toHaveBeenCalledWith("a", "b", "c");
  });
});
