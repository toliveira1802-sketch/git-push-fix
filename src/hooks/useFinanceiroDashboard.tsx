import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, differenceInBusinessDays, startOfDay, endOfDay } from "date-fns";

export interface VehicleFinanceInfo {
  id: string;
  plate: string;
  model: string;
  clientName: string;
  valorAprovado: number;
  status: string;
  estimatedCompletion?: string;
  daysInYard: number;
}

export interface FinanceMetrics {
  metaMensal: number;
  realizado: number;
  aprovadoPatio: number;
  mediaDiaria: number;
  faturado: number;
  ticketMedio: number;
  saidaHoje: number;
  atrasado: number;
  preso: number;
  entregues: number;
  diasTrabalhados: number;
  diasRestantes: number;
  projecao: number;
  percentualMeta: number;
  // Listas de veículos
  vehiclesPreso: VehicleFinanceInfo[];
  vehiclesAtrasado: VehicleFinanceInfo[];
  vehiclesSaidaHoje: VehicleFinanceInfo[];
}

export interface MetaConfig {
  metaMensal: number;
  diasUteis: number;
}

export function useFinanceiroDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    metaMensal: 300000,
    realizado: 0,
    aprovadoPatio: 0,
    mediaDiaria: 0,
    faturado: 0,
    ticketMedio: 0,
    saidaHoje: 0,
    atrasado: 0,
    preso: 0,
    entregues: 0,
    diasTrabalhados: 0,
    diasRestantes: 0,
    projecao: 0,
    percentualMeta: 0,
    vehiclesPreso: [],
    vehiclesAtrasado: [],
    vehiclesSaidaHoje: [],
  });
  const [metaConfig, setMetaConfig] = useState<MetaConfig>({
    metaMensal: 300000,
    diasUteis: 24,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const calcValorAprovado = (os: any): number => {
    const itens = os.service_order_items || [];
    const aprovados = itens.filter((i: any) => i.status?.toLowerCase() === 'aprovado');
    return aprovados.length > 0
      ? aprovados.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0)
      : (os.total || 0);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const inicioMes = startOfMonth(today);
      const fimMes = endOfMonth(today);
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      // Calcular dias
      const diasTrabalhados = differenceInBusinessDays(today, inicioMes) + 1;
      const diasRestantes = differenceInBusinessDays(fimMes, today);

      // Buscar meta configurada
      const { data: configData } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'meta_mensal')
        .maybeSingle();

      let meta = 300000;
      let diasUteis = 24;

      if (configData?.value) {
        const val = configData.value as { valor?: number; dias_uteis?: number };
        meta = val.valor || 300000;
        diasUteis = val.dias_uteis || 24;
      }

      // 1. OSs entregues no mês (faturado/realizado)
      const { data: ossEntregues } = await supabase
        .from('service_orders')
        .select('id, total, completed_at, service_order_items(total_price, status)')
        .eq('status', 'entregue')
        .gte('completed_at', inicioMes.toISOString())
        .lte('completed_at', fimMes.toISOString());

      let faturado = 0;
      (ossEntregues || []).forEach(os => {
        faturado += calcValorAprovado(os);
      });
      const entregues = ossEntregues?.length || 0;
      const ticketMedio = entregues > 0 ? faturado / entregues : 0;

      // 2. OSs ativas no pátio (exceto entregue)
      const { data: ossAtivas } = await supabase
        .from('service_orders')
        .select(`
          id,
          status,
          total,
          estimated_completion,
          created_at,
          service_order_items(total_price, status),
          vehicles(plate, model, brand),
          clients(name)
        `)
        .neq('status', 'entregue');

      // Aprovado no pátio = soma de todos aprovados ativos
      let aprovadoPatio = 0;
      let preso = 0;
      let atrasado = 0;
      let saidaHoje = 0;
      
      const vehiclesPreso: VehicleFinanceInfo[] = [];
      const vehiclesAtrasado: VehicleFinanceInfo[] = [];
      const vehiclesSaidaHoje: VehicleFinanceInfo[] = [];

      (ossAtivas || []).forEach(os => {
        const valorAprovado = calcValorAprovado(os);
        aprovadoPatio += valorAprovado;
        const daysInYard = differenceInBusinessDays(today, new Date(os.created_at));

        const vehicleInfo: VehicleFinanceInfo = {
          id: os.id,
          plate: (os.vehicles as any)?.plate || 'N/A',
          model: (os.vehicles as any)?.model || '',
          clientName: (os.clients as any)?.name || '',
          valorAprovado,
          status: os.status,
          estimatedCompletion: os.estimated_completion || undefined,
          daysInYard,
        };

        // Preso = valor aprovado de veículos no pátio
        preso += valorAprovado;
        vehiclesPreso.push(vehicleInfo);

        // Atrasado = previsão de entrega vencida
        if (os.estimated_completion) {
          const previsao = new Date(os.estimated_completion);
          if (previsao < todayStart) {
            atrasado += valorAprovado;
            vehiclesAtrasado.push(vehicleInfo);
          }
          // Saída hoje = previsão de entrega para hoje
          if (previsao >= todayStart && previsao <= todayEnd) {
            saidaHoje += valorAprovado;
            vehiclesSaidaHoje.push(vehicleInfo);
          }
        }
      });

      // Calcular métricas
      const mediaDiaria = diasTrabalhados > 0 ? faturado / diasTrabalhados : 0;
      const mediaDiariaParaMeta = diasRestantes > 0 ? (meta - faturado) / diasRestantes : 0;
      const projecao = diasUteis > 0 ? (faturado / diasTrabalhados) * diasUteis : 0;
      const percentualMeta = meta > 0 ? (faturado / meta) * 100 : 0;

      setMetaConfig({ metaMensal: meta, diasUteis });
      setMetrics({
        metaMensal: meta,
        realizado: faturado,
        aprovadoPatio,
        mediaDiaria: mediaDiariaParaMeta,
        faturado,
        ticketMedio,
        saidaHoje,
        atrasado,
        preso,
        entregues,
        diasTrabalhados,
        diasRestantes,
        projecao,
        percentualMeta,
        vehiclesPreso: vehiclesPreso.sort((a, b) => b.valorAprovado - a.valorAprovado),
        vehiclesAtrasado: vehiclesAtrasado.sort((a, b) => b.daysInYard - a.daysInYard),
        vehiclesSaidaHoje,
      });
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMetaConfig = async (newMeta: number, newDiasUteis: number) => {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('system_config')
        .select('id, value')
        .eq('key', 'meta_mensal')
        .maybeSingle();

      const newValue = {
        valor: newMeta,
        dias_uteis: newDiasUteis,
        meta_mecanico: (existing?.value as any)?.meta_mecanico || 60000,
      };

      if (existing) {
        await supabase
          .from('system_config')
          .update({ value: newValue, updated_at: new Date().toISOString() })
          .eq('key', 'meta_mensal');
      } else {
        await supabase
          .from('system_config')
          .insert({ key: 'meta_mensal', value: newValue });
      }
      
      setMetaConfig({ metaMensal: newMeta, diasUteis: newDiasUteis });
      await fetchData();
      return true;
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    metaConfig,
    loading,
    lastUpdate,
    refetch: fetchData,
    saveMetaConfig,
  };
}
