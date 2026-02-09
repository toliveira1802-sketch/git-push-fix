import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "user" | "admin" | "gestao" | "dev";

interface UseUserRoleReturn {
  role: AppRole | null;
  isLoading: boolean;
  isUser: boolean;
  isAdmin: boolean;
  isGestao: boolean;
  isDev: boolean;
  canAccessAdmin: boolean;
  canAccessGestao: boolean;
  refetch: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = async () => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error("Erro ao buscar role:", error);
        setRole("user"); // Default role
      } else {
        setRole(data?.role as AppRole || "user");
      }
    } catch (err) {
      console.error("Erro ao buscar role:", err);
      setRole("user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [user]);

  return {
    role,
    isLoading,
    isUser: role === "user",
    isAdmin: role === "admin",
    isGestao: role === "gestao",
    isDev: role === "dev",
    canAccessAdmin: role === "admin" || role === "dev",
    canAccessGestao: role === "gestao" || role === "dev",
    refetch: fetchRole,
  };
}

// Helper para obter a rota inicial baseada na role
export function getHomeRouteForRole(role: AppRole | null): string {
  switch (role) {
    case "dev":
    case "admin":
    case "gestao":
      // Staff roles go to admin dashboard
      return "/admin";
    case "user":
    default:
      // Client role goes to garage view
      return "/minha-garagem";
  }
}
