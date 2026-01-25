import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VeiculoKanban {
  id: string; // service_order id
  orderNumber: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number | null;
  cor: string | null;
  cliente: string;
  clienteTelefone: string;
  servico: string;
  categoria: string;
  entrada: string;
  entradaData: Date;
  previsaoEntrega: string | null;
  total: number;
  valorAprovado: number;
  emTerceiros: boolean;
  mecanico: string | null;
  mecanicoId: string | null;
  recurso: string | null;
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
  { id: 'pronto-iniciar', titulo: 'Pronto p/ Iniciar', color: 'bg-lime-500/10 border-lime-500/30', dbStatus: 'pronto_iniciar' },
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
  'pronto_iniciar': 'pronto-iniciar',
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
  'pronto-iniciar': 'pronto_iniciar',
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
      // Buscar OSs ativas (exceto entregues) com veículos, clientes, mecânicos e itens
      const { data: oss, error } = await supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          completed_at,
          estimated_completion,
          problem_description,
          priority,
          mechanic_id,
          em_terceiros,
          recurso,
          vehicles!inner(plate, model, brand, year, color),
          clients!inner(name, phone),
          mechanics(name),
          service_order_items(total_price, status)
        `)
        .neq('status', 'entregue')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar total faturado do mês (entregues do mês atual) - query separada
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      
      const { data: entreguesMes } = await supabase
        .from('service_orders')
        .select('total, service_order_items(total_price, status)')
        .eq('status', 'entregue')
        .gte('completed_at', inicioMes.toISOString());
      
      // Calcular total faturado (soma dos valores aprovados)
      let totalMes = 0;
      entreguesMes?.forEach(os => {
        const itensAprovados = (os.service_order_items || [])
          .filter((item: { status: string | null; total_price: number }) => 
            item.status?.toLowerCase() === 'aprovado'
          );
        const valorAprovado = itensAprovados.length > 0
          ? itensAprovados.reduce((sum: number, item: { total_price: number }) => sum + (item.total_price || 0), 0)
          : (os.total || 0);
        totalMes += valorAprovado;
      });

      // Organizar por etapas
      const novasEtapas: EtapaWorkflow[] = etapasConfig.map(e => ({
        id: e.id,
        titulo: e.titulo,
        color: e.color,
        veiculos: []
      }));

      // Função para determinar categoria baseada na descrição
      const getCategoria = (desc: string | null): string => {
        if (!desc) return 'Geral';
        const lower = desc.toLowerCase();
        if (lower.includes('revisão') || lower.includes('revisao')) return 'Revisão';
        if (lower.includes('óleo') || lower.includes('oleo')) return 'Troca de Óleo';
        if (lower.includes('freio')) return 'Freios';
        if (lower.includes('suspensão') || lower.includes('suspensao')) return 'Suspensão';
        if (lower.includes('motor')) return 'Motor';
        if (lower.includes('elétric') || lower.includes('eletric')) return 'Elétrica';
        if (lower.includes('ar condicionado') || lower.includes('ac')) return 'Ar Condicionado';
        return 'Manutenção';
      };

      oss?.forEach(os => {
        const etapaId = statusToEtapa[os.status] || 'orcamento';
        const etapaIndex = novasEtapas.findIndex(e => e.id === etapaId);
        
        if (etapaIndex >= 0) {
          const createdAt = new Date(os.created_at);
          
          // Calcular valor aprovado (soma dos itens com status 'aprovado')
          // Se não houver itens (ex: cards do Trello), usa o total da OS
          const itensAprovados = (os.service_order_items || [])
            .filter((item: { status: string | null; total_price: number }) => 
              item.status?.toLowerCase() === 'aprovado'
            );
          
          const valorAprovado = itensAprovados.length > 0
            ? itensAprovados.reduce((sum: number, item: { total_price: number }) => sum + (item.total_price || 0), 0)
            : (os.total || 0); // Fallback para total da OS (Trello)

          const veiculo: VeiculoKanban = {
            id: os.id,
            orderNumber: os.order_number,
            placa: os.vehicles?.plate || '',
            modelo: os.vehicles?.model || '',
            marca: os.vehicles?.brand || '',
            ano: os.vehicles?.year || null,
            cor: os.vehicles?.color || null,
            cliente: os.clients?.name || '',
            clienteTelefone: os.clients?.phone || '',
            servico: os.problem_description || os.order_number,
            categoria: getCategoria(os.problem_description),
            entrada: createdAt.toLocaleString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit',
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            entradaData: createdAt,
            previsaoEntrega: os.estimated_completion 
              ? new Date(os.estimated_completion).toLocaleDateString('pt-BR')
              : null,
            total: os.total || 0,
            valorAprovado: valorAprovado,
            emTerceiros: os.em_terceiros || false,
            mecanico: os.mechanics?.name || null,
            mecanicoId: os.mechanic_id || null,
            recurso: os.recurso || null,
          };
          
          novasEtapas[etapaIndex].veiculos.push(veiculo);
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
