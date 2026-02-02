import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Car, Clock, Wrench, CheckCircle, AlertTriangle, 
  RefreshCw, Users, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore, parse, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MechanicSchedule {
  id: string;
  name: string;
  slots: ScheduleSlot[];
}

interface ScheduleSlot {
  hora: string;
  vehicle?: {
    plate: string;
    model: string;
    tipo: string;
  };
  status: 'livre' | 'ocupado' | 'em_andamento' | 'concluido';
}

interface WorkflowCount {
  nome: string;
  count: number;
  cor: string;
}

export default function AdminPainelTV() {
  const [mechanics, setMechanics] = useState<MechanicSchedule[]>([]);
  const [workflowCounts, setWorkflowCounts] = useState<WorkflowCount[]>([]);
  const [capacidade, setCapacidade] = useState({ atual: 0, maxima: 20 });
  const [entregas, setEntregas] = useState<{ plate: string; model: string; hora: string }[]>([]);
  const [proximosEntrar, setProximosEntrar] = useState<{ plate: string; model: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isMorning, setIsMorning] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Check if morning or afternoon
      const now = new Date();
      const noon = parse('12:00', 'HH:mm', now);
      setIsMorning(isBefore(now, noon));

      // Fetch mechanics
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true);

      // Generate schedule slots based on time of day
      const morningSlots = ['08:00', '09:00', '10:00', '11:00'];
      const afternoonSlots = ['13:30', '14:30', '15:30', '16:30'];
      const slots = isBefore(now, noon) ? morningSlots : afternoonSlots;

      // Fetch agenda
      const today = format(now, 'yyyy-MM-dd');
      const { data: agendaData } = await supabase
        .from('agenda_mecanicos')
        .select(`
          mechanic_id,
          hora_inicio,
          status,
          vehicles (plate, model)
        `)
        .eq('data', today);

      // Map mechanics with schedules
      const mechanicsWithSchedule: MechanicSchedule[] = (mechanicsData || []).map(m => ({
        id: m.id,
        name: m.name,
        slots: slots.map(hora => {
          const agendaItem = agendaData?.find(
            a => a.mechanic_id === m.id && a.hora_inicio?.startsWith(hora.slice(0, 2))
          );
          return {
            hora,
            vehicle: agendaItem?.vehicles ? {
              plate: (agendaItem.vehicles as any).plate,
              model: (agendaItem.vehicles as any).model,
              tipo: 'Revisão',
            } : undefined,
            status: agendaItem ? (agendaItem.status as any) : 'livre',
          };
        }),
      }));

      setMechanics(mechanicsWithSchedule);

      // Fetch workflow counts
      const { data: etapas } = await supabase
        .from('workflow_etapas')
        .select('*')
        .eq('is_active', true)
        .order('ordem');

      const { data: appointments } = await supabase
        .from('appointments')
        .select('status')
        .not('status', 'eq', 'cancelado')
        .not('status', 'eq', 'concluido');

      const statusToEtapa: Record<string, number> = {
        'diagnostico': 1,
        'pendente': 2,
        'confirmado': 3,
        'aguardando_pecas': 4,
        'pronto_iniciar': 5,
        'em_execucao': 6,
        'pronto_retirada': 7,
      };

      const counts: Record<number, number> = {};
      appointments?.forEach(apt => {
        const ordem = statusToEtapa[apt.status] || 2;
        counts[ordem] = (counts[ordem] || 0) + 1;
      });

      const workflowData: WorkflowCount[] = (etapas || []).map(e => ({
        nome: e.nome,
        count: counts[e.ordem] || 0,
        cor: e.cor,
      }));

      setWorkflowCounts(workflowData);
      setCapacidade({
        atual: appointments?.length || 0,
        maxima: 20,
      });

      // Fetch entregas do dia (pronto_retirada)
      const { data: entregasData } = await supabase
        .from('appointments')
        .select(`
          estimated_completion,
          vehicles (plate, model)
        `)
        .eq('status', 'pronto_retirada')
        .limit(5);

      setEntregas((entregasData || []).map((e: any) => ({
        plate: e.vehicles?.plate || 'N/A',
        model: e.vehicles?.model || '',
        hora: e.estimated_completion 
          ? format(new Date(e.estimated_completion), 'HH:mm')
          : '--:--',
      })));

      // Fetch próximos a entrar (pronto_iniciar)
      const { data: proximosData } = await supabase
        .from('appointments')
        .select(`
          vehicles (plate, model)
        `)
        .eq('status', 'pronto_iniciar')
        .limit(5);

      setProximosEntrar((proximosData || []).map((p: any) => ({
        plate: p.vehicles?.plate || 'N/A',
        model: p.vehicles?.model || '',
      })));

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching panel data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const capacidadePercentage = (capacidade.atual / capacidade.maxima) * 100;
  const getCapacidadeColor = () => {
    if (capacidadePercentage <= 75) return 'bg-success';
    if (capacidadePercentage <= 100) return 'bg-warning';
    return 'bg-destructive';
  };

  const maxWorkflowCount = Math.max(...workflowCounts.map(w => w.count), 1);

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'livre': return 'bg-muted';
      case 'ocupado': return 'bg-primary';
      case 'em_andamento': return 'bg-warning';
      case 'concluido': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg dark flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 opacity-50" />
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg dark p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Doctor Auto Prime" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel de Gestão</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          <span>Atualizado: {format(lastRefresh, 'HH:mm:ss')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-100px)]">
        {/* Top Left - Kanban Mecânicos */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Agenda {isMorning ? 'Manhã' : 'Tarde'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-2">
              {/* Header row with times */}
              <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground">
                <div></div>
                {(isMorning ? ['08h', '09h', '10h', '11h'] : ['13h30', '14h30', '15h30', '16h30']).map(h => (
                  <div key={h} className="text-center font-medium">{h}</div>
                ))}
              </div>
              {/* Mechanic rows */}
              {mechanics.slice(0, 5).map((mechanic) => (
                <div key={mechanic.id} className="grid grid-cols-5 gap-1">
                  <div className="text-xs font-medium truncate pr-2">
                    {mechanic.name.split(' ')[0]}
                  </div>
                  {mechanic.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`h-10 rounded ${getSlotStatusColor(slot.status)} flex items-center justify-center relative group`}
                      title={slot.vehicle ? `${slot.vehicle.plate} - ${slot.vehicle.model}` : 'Livre'}
                    >
                      {slot.vehicle ? (
                        <span className="text-[10px] font-bold text-white">
                          {slot.vehicle.plate.slice(-3)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Right - Lotação Gauge */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Car className="w-4 h-4" />
              Lotação do Pátio
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[calc(100%-60px)]">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 50" className="w-full">
                {/* Background arc */}
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke={capacidadePercentage <= 75 ? 'hsl(var(--success))' : capacidadePercentage <= 100 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${capacidadePercentage * 1.42} 142`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span className="text-4xl font-bold">{capacidade.atual}</span>
                <span className="text-xs text-muted-foreground">de {capacidade.maxima}</span>
              </div>
            </div>
            <Badge 
              className={`mt-4 ${getCapacidadeColor()} text-white`}
            >
              {capacidadePercentage <= 75 ? 'CAPACIDADE OK' : capacidadePercentage <= 100 ? 'ATENÇÃO' : 'OFICINA CHEIA'}
            </Badge>
          </CardContent>
        </Card>

        {/* Bottom Left - Workflow Kanban */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Fluxo de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 h-full">
              {workflowCounts.map((etapa, idx) => {
                const isBottleneck = etapa.count === maxWorkflowCount && etapa.count > 0;
                return (
                  <div 
                    key={idx}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      isBottleneck ? 'ring-2 ring-destructive bg-destructive/10' : 'bg-muted/30'
                    }`}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{ color: etapa.cor }}
                    >
                      {etapa.count}
                    </div>
                    <div className="text-[10px] text-center text-muted-foreground leading-tight">
                      {etapa.nome}
                    </div>
                    {isBottleneck && (
                      <AlertTriangle className="w-4 h-4 text-destructive mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Right - Próximos e Entregas */}
        <div className="grid grid-rows-2 gap-4">
          {/* Próximos a Entrar */}
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-xs flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Próximos a Entrar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {proximosEntrar.length > 0 ? (
                <div className="space-y-1">
                  {proximosEntrar.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                      <span className="font-bold">{v.plate}</span>
                      <span className="text-muted-foreground truncate ml-2">{v.model}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-4 opacity-50">
                  <img src="/logo.png" alt="" className="w-12 h-12 opacity-30" />
                  <span className="text-xs text-muted-foreground mt-2">Nenhum pendente</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entregas do Dia */}
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-xs flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Entregas do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {entregas.length > 0 ? (
                <div className="space-y-1">
                  {entregas.map((e, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-success/10 rounded text-xs">
                      <span className="font-bold">{e.plate}</span>
                      <span className="text-muted-foreground">{e.hora}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-4 opacity-50">
                  <img src="/logo.png" alt="" className="w-12 h-12 opacity-30" />
                  <span className="text-xs text-muted-foreground mt-2">Nenhuma entrega</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
