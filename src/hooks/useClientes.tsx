import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Cliente = Tables<"clientes">;
export type ClienteInsert = TablesInsert<"clientes">;
export type ClienteUpdate = TablesUpdate<"clientes">;

export type Veiculo = Tables<"veiculos">;

interface UseClientesOptions {
  searchTerm?: string;
  status?: string;
}

export function useClientes(options: UseClientesOptions = {}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculosPorCliente, setVeiculosPorCliente] = useState<Record<string, Veiculo[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClientes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.status && options.status !== "all") {
        query = query.eq("status", options.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredData = data || [];

      // Filtro de busca local
      if (options.searchTerm) {
        const term = options.searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (c) =>
            c.name?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.phone?.includes(term) ||
            c.cpf?.includes(term)
        );
      }

      setClientes(filteredData);

      // Buscar veículos para cada cliente
      if (filteredData.length > 0) {
        const clienteIds = filteredData.map((c) => c.id);
        const { data: veiculos } = await supabase
          .from("veiculos")
          .select("*")
          .in("client_id", clienteIds);

        if (veiculos) {
          const grouped: Record<string, Veiculo[]> = {};
          veiculos.forEach((v) => {
            if (!grouped[v.client_id]) {
              grouped[v.client_id] = [];
            }
            grouped[v.client_id].push(v);
          });
          setVeiculosPorCliente(grouped);
        }
      }
    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createCliente = async (cliente: ClienteInsert): Promise<Cliente | null> => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert(cliente)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cliente cadastrado!",
        description: `${data.name} foi adicionado com sucesso.`,
      });

      await fetchClientes();
      return data;
    } catch (err: any) {
      console.error("Erro ao criar cliente:", err);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: err.message,
      });
      return null;
    }
  };

  const updateCliente = async (id: string, updates: ClienteUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("clientes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado!",
        description: "Dados salvos com sucesso.",
      });

      await fetchClientes();
      return true;
    } catch (err: any) {
      console.error("Erro ao atualizar cliente:", err);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: err.message,
      });
      return false;
    }
  };

  const deleteCliente = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente removido!",
        description: "O cliente foi excluído do sistema.",
      });

      await fetchClientes();
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar cliente:", err);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: err.message,
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [options.searchTerm, options.status]);

  return {
    clientes,
    veiculosPorCliente,
    isLoading,
    error,
    refetch: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    totalClientes: clientes.length,
    totalVeiculos: Object.values(veiculosPorCliente).flat().length,
  };
}
