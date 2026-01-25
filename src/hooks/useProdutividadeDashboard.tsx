import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInBusinessDays } from "date-fns";

export interface MechanicRanking {
  id: string;
  name: string;
  valorProduzido: number;
  carrosAtendidos: number;
  ticketMedio: number;
  metaMensal: number;
  percentualMeta: number;
  ranking: number;
  emoji: string;
}

export interface ProdutividadeMetrics {
  meta: number;
  realizado: number;
  projecao: number;
  faltam: number;
  percentualMeta: number;
  diasTrabalhados: number;
  diasRestantes: number;
}

export function useProdutividadeDashboard(semana?: number) {
  const [metrics, setMetrics] = useState<ProdutividadeMetrics>({
    meta: 300000,
    realizado: 0,
    projecao: 0,
    faltam: 0,
    percentualMeta: 0,
    diasTrabalhados: 0,
    diasRestantes: 0,
  });
  const [mechanics, setMechanics] = useState<MechanicRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const getWeekRange = (weekNumber: number) => {
    const today = new Date();
    const inicioMes = startOfMonth(today);
    
    // Calculate week start based on week number (1-4)
    const weekStart = new Date(inicioMes);
    weekStart.setDate(inicioMes.getDate() + (weekNumber - 1) * 7);
    
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const fimMes = endOfMonth(today);
    
    // Don't go beyond the month
    return {
      start: weekStart > fimMes ? fimMes : weekStart,
      end: weekEnd > fimMes ? fimMes : weekEnd,
    };
  };

  const calcValorAprovado = (os: any): number => {
    const itens = os.service_order_items || [];
    const aprovados = itens.filter((i: any) => i.status?.toLowerCase() === 'aprovado');
    return aprovados.length > 0
      ? aprovados.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0)
      : (os.total || 0);
  };

  const getEmojiForRanking = (ranking: number): string => {
    const emojis = ['🏆', '🥈', '🥉', '⭐', '🔧', '🛠️'];
    return emojis[ranking - 1] || '🔩';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const inicioMes = startOfMonth(today);
      const fimMes = endOfMonth(today);

      // Buscar meta configurada
      const { data: configData } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'meta_mensal')
        .maybeSingle();

      let meta = 300000;
      let diasUteis = 24;
      let metaPorMecanico = 60000;

      if (configData?.value) {
        const val = configData.value as { valor?: number; dias_uteis?: number; meta_mecanico?: number };
        meta = val.valor || 300000;
        diasUteis = val.dias_uteis || 24;
        metaPorMecanico = val.meta_mecanico || 60000;
      }

      const diasTrabalhados = differenceInBusinessDays(today, inicioMes) + 1;
      const diasRestantes = differenceInBusinessDays(fimMes, today);

      // Buscar mecânicos ativos
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      // Buscar OSs entregues no mês com mecânico
      const { data: ossEntregues } = await supabase
        .from('service_orders')
        .select(`
          id,
          mechanic_id,
          total,
          completed_at,
          service_order_items(total_price, status)
        `)
        .eq('status', 'entregue')
        .gte('completed_at', inicioMes.toISOString())
        .lte('completed_at', fimMes.toISOString());

      // Calcular produção por mecânico
      const mechanicStats: Record<string, { valor: number; carros: number }> = {};
      
      (mechanicsData || []).forEach(m => {
        mechanicStats[m.id] = { valor: 0, carros: 0 };
      });

      // Adicionar categoria "TERCEIRIZADO" para OSs sem mecânico
      mechanicStats['terceirizado'] = { valor: 0, carros: 0 };

      let realizadoTotal = 0;
      (ossEntregues || []).forEach(os => {
        const valor = calcValorAprovado(os);
        realizadoTotal += valor;

        const mechanicId = os.mechanic_id || 'terceirizado';
        if (mechanicStats[mechanicId]) {
          mechanicStats[mechanicId].valor += valor;
          mechanicStats[mechanicId].carros += 1;
        }
      });

      // Montar ranking
      const mechanicRanking: MechanicRanking[] = [];

      (mechanicsData || []).forEach(m => {
        const stats = mechanicStats[m.id];
        const ticketMedio = stats.carros > 0 ? stats.valor / stats.carros : 0;
        const percentual = metaPorMecanico > 0 ? (stats.valor / metaPorMecanico) * 100 : 0;

        mechanicRanking.push({
          id: m.id,
          name: m.name,
          valorProduzido: stats.valor,
          carrosAtendidos: stats.carros,
          ticketMedio,
          metaMensal: metaPorMecanico,
          percentualMeta: percentual,
          ranking: 0,
          emoji: '',
        });
      });

      // Adicionar terceirizado
      const tercStats = mechanicStats['terceirizado'];
      if (tercStats.carros > 0 || true) { // Sempre mostrar
        mechanicRanking.push({
          id: 'terceirizado',
          name: 'TERCEIRIZADO',
          valorProduzido: tercStats.valor,
          carrosAtendidos: tercStats.carros,
          ticketMedio: tercStats.carros > 0 ? tercStats.valor / tercStats.carros : 0,
          metaMensal: metaPorMecanico,
          percentualMeta: metaPorMecanico > 0 ? (tercStats.valor / metaPorMecanico) * 100 : 0,
          ranking: 0,
          emoji: '🏭',
        });
      }

      // Ordenar por valor produzido e atribuir rankings
      mechanicRanking.sort((a, b) => b.valorProduzido - a.valorProduzido);
      mechanicRanking.forEach((m, i) => {
        m.ranking = i + 1;
        if (m.id !== 'terceirizado') {
          m.emoji = getEmojiForRanking(i + 1);
        }
      });

      // Calcular projeção
      const projecao = diasTrabalhados > 0 ? (realizadoTotal / diasTrabalhados) * diasUteis : 0;
      const faltam = meta - realizadoTotal;
      const percentualMeta = meta > 0 ? (realizadoTotal / meta) * 100 : 0;

      setMetrics({
        meta,
        realizado: realizadoTotal,
        projecao,
        faltam: Math.max(0, faltam),
        percentualMeta,
        diasTrabalhados,
        diasRestantes,
      });

      setMechanics(mechanicRanking);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Erro ao buscar dados de produtividade:', error);
    } finally {
      setLoading(false);
    }
  }, [semana]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    mechanics,
    loading,
    lastUpdate,
    refetch: fetchData,
  };
}
