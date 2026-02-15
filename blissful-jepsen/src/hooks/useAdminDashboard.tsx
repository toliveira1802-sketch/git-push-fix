import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  appointmentsToday: number;
  newClientsMonth: number;
  monthlyRevenue: number;
  valueTodayDelivery: number;
  returnsMonth: number;
  cancelledMonth: number;
  vehiclesInYard: number;
  awaitingApproval: number;
}

export interface TodayAppointment {
  id: string;
  time: string;
  client_name: string;
  vehicle: string;
  status: string;
}

export interface NewClient {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface ReadyToDeliver {
  id: string;
  numero_os: string;
  vehicle: string;
  client_name: string;
  valor_final: number;
}

export interface ReturnVehicle {
  id: string;
  plate: string;
  vehicle: string;
  client_name: string;
  data_entrega: string;
}

export interface CancelledAppointment {
  id: string;
  client_name: string;
  phone: string;
  vehicle: string;
  cancelled_at: string;
}

export interface VehicleInYard {
  id: string;
  plate: string;
  vehicle: string;
  client_name: string;
  status: string;
  etapa: string;
}

export interface AwaitingApproval {
  id: string;
  numero_os: string;
  vehicle: string;
  client_name: string;
  valor: number;
  dias_aguardando: number;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    newClientsMonth: 0,
    monthlyRevenue: 0,
    valueTodayDelivery: 0,
    returnsMonth: 0,
    cancelledMonth: 0,
    vehiclesInYard: 0,
    awaitingApproval: 0,
  });
  const [loading, setLoading] = useState(true);
  
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [newClients, setNewClients] = useState<NewClient[]>([]);
  const [readyToDeliver, setReadyToDeliver] = useState<ReadyToDeliver[]>([]);
  const [returnVehicles, setReturnVehicles] = useState<ReturnVehicle[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<CancelledAppointment[]>([]);
  const [vehiclesInYard, setVehiclesInYard] = useState<VehicleInYard[]>([]);
  const [awaitingApproval, setAwaitingApproval] = useState<AwaitingApproval[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      // 1. Agendamentos de hoje
      const { data: appointmentsData } = await supabase
        .from('agendamentos')
        .select(`
          id,
          scheduled_time,
          status,
          clientes!inner(name),
          veiculos(plate, model)
        `)
        .eq('scheduled_date', todayStr)
        .order('scheduled_time');

      const formattedAppointments: TodayAppointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        time: apt.scheduled_time?.slice(0, 5) || '',
        client_name: apt.clientes?.name || 'N/A',
        vehicle: apt.veiculos ? `${apt.veiculos.model} - ${apt.veiculos.plate}` : 'Sem veículo',
        status: apt.status,
      }));
      setTodayAppointments(formattedAppointments);

      // 2. Novos clientes do mês
      const { data: clientsData } = await supabase
        .from('clientes')
        .select('id, name, phone, created_at')
        .gte('created_at', inicioMes.toISOString())
        .order('created_at', { ascending: false });

      const formattedClients: NewClient[] = (clientsData || []).map((c: any) => ({
        id: c.id,
        full_name: c.name,
        phone: c.phone,
        created_at: new Date(c.created_at).toLocaleDateString('pt-BR'),
      }));
      setNewClients(formattedClients);

      // 3. OSs ativas (veículos no pátio) - exceto entregue
      const { data: ossAtivas } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          estimated_completion,
          veiculos!inner(plate, model),
          clientes!inner(name),
          itens_ordem_servico(total_price, status)
        `)
        .neq('status', 'entregue')
        .order('created_at', { ascending: false });

      // Calcular valor aprovado para cada OS
      const calcValorAprovado = (os: any) => {
        const itens = os.itens_ordem_servico || [];
        const aprovados = itens.filter((i: any) => i.status?.toLowerCase() === 'aprovado');
        return aprovados.length > 0
          ? aprovados.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0)
          : (os.total || 0);
      };

      // Veículos no pátio
      const statusLabels: Record<string, string> = {
        diagnostico: 'Diagnóstico',
        orcamento: 'Orçamento',
        aguardando_aprovacao: 'Aguardando APV',
        aguardando_peca: 'Aguardando Peça',
        pronto_iniciar: 'Pronto p/ Iniciar',
        em_execucao: 'Em Execução',
        em_teste: 'Em Teste',
        pronto: 'Pronto',
      };

      const formattedVehiclesInYard: VehicleInYard[] = (ossAtivas || []).map((os: any) => ({
        id: os.id,
        plate: os.veiculos?.plate || '',
        vehicle: os.veiculos?.model || '',
        client_name: os.clientes?.name || '',
        status: statusLabels[os.status] || os.status,
        etapa: statusLabels[os.status] || os.status,
      }));
      setVehiclesInYard(formattedVehiclesInYard);

      // Aguardando aprovação
      const aguardandoAPV = (ossAtivas || []).filter((os: any) => os.status === 'aguardando_aprovacao');
      const formattedAguardando: AwaitingApproval[] = aguardandoAPV.map((os: any) => {
        const diasAguardando = Math.floor((Date.now() - new Date(os.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: os.id,
          numero_os: os.order_number,
          vehicle: os.veiculos?.model || '',
          client_name: os.clientes?.name || '',
          valor: calcValorAprovado(os),
          dias_aguardando: diasAguardando,
        };
      });
      setAwaitingApproval(formattedAguardando);

      // Prontos para retirada (status pronto)
      const prontos = (ossAtivas || []).filter((os: any) => os.status === 'pronto');
      const formattedProntos: ReadyToDeliver[] = prontos.map((os: any) => ({
        id: os.id,
        numero_os: os.order_number,
        vehicle: os.veiculos?.model || '',
        client_name: os.clientes?.name || '',
        valor_final: calcValorAprovado(os),
      }));
      setReadyToDeliver(formattedProntos);

      // Valor para sair hoje = soma dos valores aprovados com previsão de entrega para hoje
      const paraSairHoje = (ossAtivas || []).filter((os: any) => {
        if (!os.estimated_completion) return false;
        const previsao = new Date(os.estimated_completion);
        return previsao.toDateString() === today.toDateString();
      });
      const valorParaSair = paraSairHoje.reduce((sum: number, os: any) => sum + calcValorAprovado(os), 0);

      // 4. Entregues do mês (faturamento)
      const { data: ossEntregues } = await supabase
        .from('ordens_servico')
        .select('id, total, itens_ordem_servico(total_price, status)')
        .eq('status', 'entregue')
        .gte('completed_at', inicioMes.toISOString());

      let faturamentoMes = 0;
      (ossEntregues || []).forEach((os: any) => {
        faturamentoMes += calcValorAprovado(os);
      });

      // 5. Alertas de retorno (45 dias)
      const { data: alertasRetorno } = await supabase
        .from('gestao_alerts')
        .select(`
          id,
          created_at,
          ordens_servico!inner(
            veiculos!inner(plate, model),
            clientes!inner(name)
          )
        `)
        .eq('tipo', 'retorno_45_dias')
        .gte('created_at', inicioMes.toISOString());

      const formattedRetornos: ReturnVehicle[] = (alertasRetorno || []).map((alert: any) => ({
        id: alert.id,
        plate: alert.ordens_servico?.veiculos?.plate || '',
        vehicle: alert.ordens_servico?.veiculos?.model || '',
        client_name: alert.ordens_servico?.clientes?.name || '',
        data_entrega: new Date(alert.created_at).toLocaleDateString('pt-BR'),
      }));
      setReturnVehicles(formattedRetornos);

      // 6. Agendamentos cancelados do mês
      const { data: cancelados } = await supabase
        .from('agendamentos')
        .select(`
          id,
          cancelled_at,
          clientes!inner(name, phone),
          veiculos(model)
        `)
        .eq('status', 'cancelado')
        .gte('cancelled_at', inicioMes.toISOString())
        .order('cancelled_at', { ascending: false });

      const formattedCancelados: CancelledAppointment[] = (cancelados || []).map((apt: any) => ({
        id: apt.id,
        client_name: apt.clientes?.name || '',
        phone: apt.clientes?.phone || '',
        vehicle: apt.veiculos?.model || 'Sem veículo',
        cancelled_at: apt.cancelled_at ? new Date(apt.cancelled_at).toLocaleDateString('pt-BR') : '',
      }));
      setCancelledAppointments(formattedCancelados);

      // Atualizar stats
      setStats({
        appointmentsToday: formattedAppointments.length,
        newClientsMonth: formattedClients.length,
        monthlyRevenue: faturamentoMes,
        valueTodayDelivery: valorParaSair,
        returnsMonth: formattedRetornos.length,
        cancelledMonth: formattedCancelados.length,
        vehiclesInYard: formattedVehiclesInYard.length,
        awaitingApproval: formattedAguardando.length,
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    loading,
    todayAppointments,
    newClients,
    readyToDeliver,
    returnVehicles,
    cancelledAppointments,
    vehiclesInYard,
    awaitingApproval,
    refetch: fetchData,
  };
}
