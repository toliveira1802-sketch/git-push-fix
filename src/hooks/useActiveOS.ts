import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OSStatus =
  | "diagnostico"
  | "orcamento"
  | "aguardando_aprovacao"
  | "aprovado"
  | "parcial"
  | "em_execucao"
  | "concluido"
  | "entregue";

export interface ActiveOS {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  status: OSStatus;
  description: string;
  createdAt: string;
  service_order_id: string;
}

export function useActiveOS(clientId?: string) {
  const [activeOS, setActiveOS] = useState<ActiveOS | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setActiveOS(null);
      setLoading(false);
      return;
    }

    const fetchActiveOS = async () => {
      try {
        const { data, error } = await supabase
          .from("ordens_servico")
          .select(`
            id, order_number, status, created_at, problem_description,
            veiculos (plate, model, brand)
          `)
          .eq("client_id", clientId)
          .neq("status", "entregue")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setActiveOS({
            id: data.id,
            vehiclePlate: data.veiculos?.plate || '-',
            vehicleModel: data.veiculos ? `${data.veiculos.brand} ${data.veiculos.model}` : '-',
            status: data.status as OSStatus,
            description: data.problem_description || 'Sem descrição',
            createdAt: data.created_at,
            service_order_id: data.id,
          });
        } else {
          setActiveOS(null);
        }
      } catch (error) {
        console.error("Erro ao buscar OS ativa:", error);
        setActiveOS(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOS();
  }, [clientId]);

  return { activeOS, loading };
}
