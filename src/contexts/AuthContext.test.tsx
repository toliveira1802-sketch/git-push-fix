import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";

// vi.mock is hoisted, so we must use vi.hoisted to create variables
// that can be referenced inside the mock factory
const {
  mockAuth,
  mockSubscription,
  mockQueryBuilder,
} = vi.hoisted(() => {
  const mockSubscription = { unsubscribe: vi.fn() };

  const mockAuth = {
    onAuthStateChange: vi.fn((cb: any) => {
      return { data: { subscription: mockSubscription } };
    }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  };

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  return { mockAuth, mockSubscription, mockQueryBuilder };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: mockAuth,
    from: vi.fn(() => mockQueryBuilder),
  },
}));

import { AuthProvider, useAuth } from "./AuthContext";

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  };
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    mockAuth.onAuthStateChange.mockImplementation((cb: any) => {
      return { data: { subscription: mockSubscription } };
    });
  });

  describe("useAuth outside provider", () => {
    it("should throw an error when used outside AuthProvider", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");
      spy.mockRestore();
    });
  });

  describe("initial state", () => {
    it("should start with no user/session and resolve loading", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.mustChangePassword).toBe(false);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should register auth state change listener", () => {
      renderHook(() => useAuth(), { wrapper: createWrapper() });
      expect(mockAuth.onAuthStateChange).toHaveBeenCalledTimes(1);
    });

    it("should call getSession on mount", () => {
      renderHook(() => useAuth(), { wrapper: createWrapper() });
      expect(mockAuth.getSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("signIn", () => {
    it("should call supabase signInWithPassword", async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.signIn(
          "test@test.com",
          "password123"
        );
        expect(response.error).toBeNull();
      });

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });

    it("should return error on failed sign in", async () => {
      const mockError = new Error("Invalid credentials");
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {},
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.signIn("bad@test.com", "wrong");
        expect(response.error).toEqual(mockError);
      });
    });
  });

  describe("signUp", () => {
    it("should call supabase signUp with metadata", async () => {
      mockAuth.signUp.mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.signUp(
          "new@test.com",
          "pass123",
          "John Doe",
          "11999999999"
        );
        expect(response.error).toBeNull();
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@test.com",
          password: "pass123",
          options: expect.objectContaining({
            data: {
              full_name: "John Doe",
              phone: "11999999999",
            },
          }),
        })
      );
    });
  });

  describe("signOut", () => {
    it("should clear user and session on sign out", async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.mustChangePassword).toBe(false);
    });
  });

  describe("signInWithGoogle", () => {
    it("should call supabase signInWithOAuth with google provider", async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.signInWithGoogle();
        expect(response.error).toBeNull();
      });

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "google",
        })
      );
    });
  });

  describe("cleanup", () => {
    it("should unsubscribe on unmount", () => {
      const { unmount } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      unmount();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
