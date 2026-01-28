import { useEffect, useState } from "react";

export type OSStatus =
  | "aberta"
  | "diagnostico"
  | "aguardando_aprovacao"
  | "em_execucao"
  | "testes"
  | "pronta"
  | "finalizada";

export interface ActiveOS {
  id: string;
  vehiclePlate: string;
  status: OSStatus;
  description: string;
  createdAt: string;
}

export function useActiveOS() {
  const [activeOS, setActiveOS] = useState<ActiveOS | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK TEMPORÁRIO — depois pluga no Supabase
    const mockOS: ActiveOS = {
      id: "os-123",
      vehiclePlate: "ABC-1234",
      status: "diagnostico",
      description: "Diagnóstico geral do motor",
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setActiveOS(mockOS); // se não tiver OS, setActiveOS(null)
      setLoading(false);
    }, 500);
  }, []);

  return { activeOS, loading };
}
