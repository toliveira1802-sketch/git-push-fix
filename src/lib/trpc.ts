// tRPC stub - placeholder for build compatibility
// This project uses direct Supabase integration, not tRPC

export const trpc = {
  useUtils: () => ({
    auth: {
      me: {
        setData: () => {},
        invalidate: () => Promise.resolve(),
      },
    },
  }),
  auth: {
    me: {
      useQuery: () => ({
        data: null,
        isLoading: false,
        error: null,
        refetch: () => Promise.resolve({ data: null }),
      }),
    },
    logout: {
      useMutation: () => ({
        mutateAsync: () => Promise.resolve(),
        isPending: false,
        error: null,
      }),
    },
  },
  colaboradores: {
    login: {
      useMutation: () => ({
        mutateAsync: () => Promise.resolve({ success: true }),
        isPending: false,
        error: null,
      }),
    },
    changePassword: {
      useMutation: () => ({
        mutateAsync: () => Promise.resolve({ success: true }),
        isPending: false,
        error: null,
      }),
    },
  },
};
