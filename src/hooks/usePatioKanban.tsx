import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VeiculoKanban {
  id: string; // service_order id
  placa: string;
  modelo: string;
  marca: string;
  cliente: string;
  servico: string;
  entrada: string;
  total: number;
  emTerceiros: boolean;
}

export interface EtapaWorkflow {
  id: string;
  titulo: string;
  color: string;
  veiculos: VeiculoKanban[];
}

const etapasConfig = [
  { id: 'diagnostico', titulo: 'Diagnóstico', color: 'bg-purple-500/10 border-purple-500/30', dbStatus: 'diagnostico' },
  { id: 'orcamento', titulo: 'Orçamento', color: 'bg-blue-500/10 border-blue-500/30', dbStatus: 'orcamento' },
  { id: 'aguardando-apv', titulo: 'Aguardando Aprovação', color: 'bg-amber-500/10 border-amber-500/30', dbStatus: 'aguardando_aprovacao' },
  { id: 'aguardando-peca', titulo: 'Aguardando Peça', color: 'bg-orange-500/10 border-orange-500/30', dbStatus: 'aguardando_peca' },
  { id: 'execucao', titulo: 'Em Execução', color: 'bg-cyan-500/10 border-cyan-500/30', dbStatus: 'em_execucao' },
  { id: 'teste', titulo: 'Em Teste', color: 'bg-indigo-500/10 border-indigo-500/30', dbStatus: 'em_teste' },
  { id: 'pronto', titulo: 'Pronto', color: 'bg-emerald-500/10 border-emerald-500/30', dbStatus: 'pronto' },
  { id: 'entregue', titulo: 'Entregue', color: 'bg-muted border-muted-foreground/20', dbStatus: 'entregue' },
];

// Mapeamento de status do banco para etapa do kanban
const statusToEtapa: Record<string, string> = {
  'diagnostico': 'diagnostico',
  'orcamento': 'orcamento',
  'aguardando_aprovacao': 'aguardando-apv',
  'aguardando_peca': 'aguardando-peca',
  'em_execucao': 'execucao',
  'em_teste': 'teste',
  'pronto': 'pronto',
  'entregue': 'entregue',
};

// Mapeamento inverso: etapa do kanban para status do banco
const etapaToStatus: Record<string, string> = {
  'diagnostico': 'diagnostico',
  'orcamento': 'orcamento',
  'aguardando-apv': 'aguardando_aprovacao',
  'aguardando-peca': 'aguardando_peca',
  'execucao': 'em_execucao',
  'teste': 'em_teste',
  'pronto': 'pronto',
  'entregue': 'entregue',
};

export function usePatioKanban() {
  const [etapas, setEtapas] = useState<EtapaWorkflow[]>(
    etapasConfig.map(e => ({ id: e.id, titulo: e.titulo, color: e.color, veiculos: [] }))
  );
  const [loading, setLoading] = useState(true);
  const [totalEntreguesMes, setTotalEntreguesMes] = useState(0);

  // Buscar OSs do banco
  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar todas as OSs com veículos e clientes
      const { data: oss, error } = await supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          completed_at,
          problem_description,
          vehicles!inner(plate, model, brand),
          clients!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Organizar por etapas
      const novasEtapas: EtapaWorkflow[] = etapasConfig.map(e => ({
        id: e.id,
        titulo: e.titulo,
        color: e.color,
        veiculos: []
      }));

      // Calcular total entregues do mês
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      let totalMes = 0;

      oss?.forEach(os => {
        const etapaId = statusToEtapa[os.status] || 'orcamento';
        const etapaIndex = novasEtapas.findIndex(e => e.id === etapaId);
        
        if (etapaIndex >= 0) {
          const veiculo: VeiculoKanban = {
            id: os.id,
            placa: os.vehicles?.plate || '',
            modelo: os.vehicles?.model || '',
            marca: os.vehicles?.brand || '',
            cliente: os.clients?.name || '',
            servico: os.problem_description || os.order_number,
            entrada: new Date(os.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            total: os.total || 0,
            emTerceiros: false, // TODO: adicionar campo no banco
          };
          
          novasEtapas[etapaIndex].veiculos.push(veiculo);

          // Somar total de entregues do mês
          if (os.status === 'entregue' && os.completed_at) {
            const completedDate = new Date(os.completed_at);
            if (completedDate >= inicioMes) {
              totalMes += os.total || 0;
            }
          }
        }
      });

      setEtapas(novasEtapas);
      setTotalEntreguesMes(totalMes);
    } catch (error) {
      console.error('Erro ao buscar dados do pátio:', error);
      toast.error('Erro ao carregar dados do pátio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mover veículo entre etapas
  const moverVeiculo = async (veiculoId: string, deEtapaId: string, paraEtapaId: string) => {
    if (deEtapaId === paraEtapaId) return;

    // Atualizar UI otimisticamente
    setEtapas(prev => {
      const novasEtapas = prev.map(e => ({ ...e, veiculos: [...e.veiculos] }));
      const deEtapa = novasEtapas.find(e => e.id === deEtapaId);
      const paraEtapa = novasEtapas.find(e => e.id === paraEtapaId);
      
      if (!deEtapa || !paraEtapa) return prev;

      const veiculoIndex = deEtapa.veiculos.findIndex(v => v.id === veiculoId);
      if (veiculoIndex === -1) return prev;

      const [veiculo] = deEtapa.veiculos.splice(veiculoIndex, 1);
      paraEtapa.veiculos.push(veiculo);

      return novasEtapas;
    });

    // Persistir no banco
    try {
      const novoStatus = etapaToStatus[paraEtapaId];
      const updateData: { status: string; completed_at?: string } = { status: novoStatus };
      
      // Se moveu para "entregue", marcar completed_at
      if (paraEtapaId === 'entregue') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', veiculoId);

      if (error) throw error;

      toast.success(`Veículo movido para ${etapasConfig.find(e => e.id === paraEtapaId)?.titulo}`);

      // Recalcular total do mês se foi para entregue
      if (paraEtapaId === 'entregue') {
        const veiculo = etapas.flatMap(e => e.veiculos).find(v => v.id === veiculoId);
        if (veiculo) {
          setTotalEntreguesMes(prev => prev + veiculo.total);
        }
      }
    } catch (error) {
      console.error('Erro ao mover veículo:', error);
      toast.error('Erro ao atualizar status');
      // Reverter UI em caso de erro
      fetchData();
    }
  };

  return {
    etapas,
    setEtapas,
    loading,
    totalEntreguesMes,
    moverVeiculo,
    refetch: fetchData,
  };
}
