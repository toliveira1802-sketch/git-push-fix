/**
 * Tests for use-toast — the reducer is a pure function exported directly.
 * Tests cover: ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST actions.
 */
import { describe, it, expect } from "vitest";
import { reducer } from "./use-toast";

const emptyState = { toasts: [] as any[] };

function makeToast(overrides: Record<string, any> = {}) {
  return {
    id: "1",
    title: "Test Toast",
    description: "Test description",
    open: true,
    ...overrides,
  };
}

describe("use-toast reducer", () => {
  describe("ADD_TOAST", () => {
    it("should add a toast to empty state", () => {
      const toast = makeToast({ id: "1" });
      const result = reducer(emptyState as any, {
        type: "ADD_TOAST",
        toast: toast as any,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("1");
      expect(result.toasts[0].title).toBe("Test Toast");
    });

    it("should prepend new toast (newest first)", () => {
      const state = {
        toasts: [makeToast({ id: "1", title: "Old" }) as any],
      };

      const result = reducer(state as any, {
        type: "ADD_TOAST",
        toast: makeToast({ id: "2", title: "New" }) as any,
      });

      expect(result.toasts[0].title).toBe("New");
    });

    it("should enforce TOAST_LIMIT of 1", () => {
      const state = {
        toasts: [makeToast({ id: "1", title: "First" }) as any],
      };

      const result = reducer(state as any, {
        type: "ADD_TOAST",
        toast: makeToast({ id: "2", title: "Second" }) as any,
      });

      // Limit is 1, so only the newest toast remains
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].title).toBe("Second");
    });
  });

  describe("UPDATE_TOAST", () => {
    it("should update an existing toast by id", () => {
      const state = {
        toasts: [makeToast({ id: "1", title: "Original" }) as any],
      };

      const result = reducer(state as any, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });

      expect(result.toasts[0].title).toBe("Updated");
      expect(result.toasts[0].description).toBe("Test description"); // unchanged
    });

    it("should not affect other toasts", () => {
      const state = {
        toasts: [makeToast({ id: "1", title: "Toast 1" }) as any],
      };

      const result = reducer(state as any, {
        type: "UPDATE_TOAST",
        toast: { id: "999", title: "Wrong ID" },
      });

      expect(result.toasts[0].title).toBe("Toast 1");
    });
  });

  describe("DISMISS_TOAST", () => {
    it("should set open to false for a specific toast", () => {
      const state = {
        toasts: [makeToast({ id: "1", open: true }) as any],
      };

      const result = reducer(state as any, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(result.toasts[0].open).toBe(false);
    });

    it("should dismiss all toasts when no toastId provided", () => {
      const state = {
        toasts: [makeToast({ id: "1", open: true }) as any],
      };

      const result = reducer(state as any, {
        type: "DISMISS_TOAST",
        toastId: undefined,
      });

      result.toasts.forEach((t: any) => {
        expect(t.open).toBe(false);
      });
    });

    it("should not affect other toasts when dismissing specific id", () => {
      const state = {
        toasts: [makeToast({ id: "1", open: true }) as any],
      };

      const result = reducer(state as any, {
        type: "DISMISS_TOAST",
        toastId: "999", // different id
      });

      expect(result.toasts[0].open).toBe(true); // unchanged
    });
  });

  describe("REMOVE_TOAST", () => {
    it("should remove a specific toast by id", () => {
      const state = {
        toasts: [makeToast({ id: "1" }) as any],
      };

      const result = reducer(state as any, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(result.toasts).toHaveLength(0);
    });

    it("should remove all toasts when no toastId provided", () => {
      const state = {
        toasts: [makeToast({ id: "1" }) as any],
      };

      const result = reducer(state as any, {
        type: "REMOVE_TOAST",
        toastId: undefined,
      });

      expect(result.toasts).toHaveLength(0);
    });

    it("should not remove toasts with different ids", () => {
      const state = {
        toasts: [makeToast({ id: "1" }) as any],
      };

      const result = reducer(state as any, {
        type: "REMOVE_TOAST",
        toastId: "999",
      });

      expect(result.toasts).toHaveLength(1);
    });
  });
});
