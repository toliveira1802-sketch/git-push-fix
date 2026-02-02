import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateClientUserData {
  email: string;
  name: string;
  phone: string;
  cpf?: string;
  address?: string;
  city?: string;
}

interface CreateClientUserResult {
  success: boolean;
  message?: string;
  userId?: string;
  clientId?: string;
  error?: string;
}

export function useCreateClientUser() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createClientUser = async (data: CreateClientUserData): Promise<CreateClientUserResult> => {
    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke<CreateClientUserResult>(
        "create-client-user",
        {
          body: data,
        }
      );

      if (error) {
        console.error("Error calling create-client-user:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message || "Erro ao criar cliente",
        });
        return { success: false, error: error.message };
      }

      if (!result?.success) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result?.error || "Erro ao criar cliente",
        });
        return { success: false, error: result?.error };
      }

      toast({
        title: "Cliente criado!",
        description: "Senha padrão: 123456 - O cliente deverá trocar no primeiro acesso.",
      });

      return result;
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao criar cliente",
      });
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createClientUser,
    isLoading,
  };
}
