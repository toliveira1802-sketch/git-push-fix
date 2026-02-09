import { vi } from "vitest";

// Reusable mock factory for Supabase client
export function createSupabaseMock() {
  const authStateCallbacks: Array<(event: string, session: any) => void> = [];

  const mockSubscription = {
    unsubscribe: vi.fn(),
  };

  const mockAuth = {
    onAuthStateChange: vi.fn((callback: (event: string, session: any) => void) => {
      authStateCallbacks.push(callback);
      return { data: { subscription: mockSubscription } };
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  const mockSupabase = {
    auth: mockAuth,
    from: vi.fn(() => mockQueryBuilder),
  };

  return {
    supabase: mockSupabase,
    auth: mockAuth,
    queryBuilder: mockQueryBuilder,
    subscription: mockSubscription,
    authStateCallbacks,
    // Helper to simulate auth state change
    triggerAuthStateChange: (event: string, session: any) => {
      authStateCallbacks.forEach((cb) => cb(event, session));
    },
  };
}

// Default mock session factory
export function createMockSession(overrides = {}) {
  return {
    user: createMockUser(),
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: "mock-user-id",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: { full_name: "Test User" },
    aud: "authenticated",
    created_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}
