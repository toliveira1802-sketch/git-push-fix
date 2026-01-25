import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalendarIcon, Plus, RefreshCw, Check, 
  ChevronLeft, ChevronRight, Car, CalendarCheck, Star, MessageSquare, AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SlotDetailModal, SlotDetail } from "@/components/agenda/SlotDetailModal";

interface Mechanic {
  id: string;
  name: string;
}

interface ScheduleSlot {
  id?: string;
  mechanic_id: string;
  hora: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  vehicle_brand?: string;
  vehicle_id?: string;
  cliente?: string;
  servico?: string;
  osNumber?: string;
  serviceOrderId?: string;
  origem: 'patio' | 'agendamento';
  tipo: 'normal' | 'encaixe';
  status: string;
  isNew?: boolean;
}

interface DaySchedule {
  [mechanicId: string]: {
    [hora: string]: ScheduleSlot;
  };
}

interface PatioVehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  clientName: string;
  osNumber: string;
  status: string;
  servico: string;
}

// Horários conforme screenshot
const HORARIOS_PADRAO = ['08h00', '09h00', '10h00', '11h00'];
const ALMOCO = 'ALMOÇO';
const HORARIOS_TARDE = ['13h30', '14h30', '15h30', '16h30'];
const HORARIOS_EXTRA = ['EXTRA 1', 'EXTRA 2', 'EXTRA 3'];

export default function AdminAgendaMecanicos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ mechanicId: string; hora: string } | null>(null);
  const [inputValue, setInputValue] = useState("");
  
  // Veículos no pátio
  const [patioVehicles, setPatioVehicles] = useState<PatioVehicle[]>([]);
  
  // Modal state
  const [selectedSlot, setSelectedSlot] = useState<SlotDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSlot, setFeedbackSlot] = useState<SlotDetail | null>(null);
  const [feedbackScores, setFeedbackScores] = useState({ quality: 5, punctuality: 5, performance: 5 });
  const [feedbackNotes, setFeedbackNotes] = useState("");

  // Filtrar veículos do pátio baseado no input
  const filteredPatioVehicles = useMemo(() => {
    if (!inputValue.trim()) return [];
    const search = inputValue.toLowerCase();
    return patioVehicles.filter(v => 
      v.plate.toLowerCase().includes(search) ||
      v.model.toLowerCase().includes(search) ||
      v.clientName.toLowerCase().includes(search)
    ).slice(0, 5);
  }, [inputValue, patioVehicles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch mechanics
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      setMechanics(mechanicsData || []);

      // Fetch schedule for selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data: agendaData } = await supabase
        .from('agenda_mecanicos')
        .select('id, mechanic_id, hora_inicio, tipo, status, vehicle_id')
        .eq('data', dateStr);

      // Fetch OSs ativas (veículos no pátio)
      const { data: ossAtivas } = await supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          mechanic_id,
          problem_description,
          status,
          estimated_completion,
          vehicles(id, plate, model, brand),
          clients(name)
        `)
        .neq('status', 'entregue')
        .order('created_at', { ascending: true });

      // Salvar lista de veículos no pátio
      const patio: PatioVehicle[] = (ossAtivas || []).map(os => ({
        id: os.id,
        plate: os.vehicles?.plate || '',
        model: os.vehicles?.model || '',
        brand: os.vehicles?.brand || '',
        clientName: os.clients?.name || '',
        osNumber: os.order_number,
        status: os.status,
        servico: os.problem_description || 'Serviço',
      }));
      setPatioVehicles(patio);

      // Fetch agendamentos confirmados para a data
      const { data: agendamentosConfirmados } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          service_type,
          description,
          status,
          clients(name),
          vehicles(plate, model, brand)
        `)
        .eq('scheduled_date', dateStr)
        .eq('status', 'confirmado');

      // Build schedule map
      const scheduleMap: DaySchedule = {};
      mechanicsData?.forEach(m => {
        scheduleMap[m.id] = {};
      });

      // Adicionar agenda_mecanicos
      agendaData?.forEach((item: any) => {
        const hora = item.hora_inicio?.slice(0, 5)?.replace(':', 'h') + '0' || '';
        if (scheduleMap[item.mechanic_id]) {
          scheduleMap[item.mechanic_id][hora] = {
            id: item.id,
            mechanic_id: item.mechanic_id,
            hora,
            vehicle_id: item.vehicle_id,
            origem: 'patio',
            tipo: item.tipo,
            status: item.status,
          };
        }
      });

      // Distribuir OSs do pátio com mecânico nos slots disponíveis
      ossAtivas?.filter(os => os.mechanic_id).forEach(os => {
        if (!os.mechanic_id || !scheduleMap[os.mechanic_id]) return;
        
        const allHoras = [...HORARIOS_PADRAO, ...HORARIOS_TARDE];
        for (const hora of allHoras) {
          if (!scheduleMap[os.mechanic_id][hora]) {
            scheduleMap[os.mechanic_id][hora] = {
              mechanic_id: os.mechanic_id,
              hora,
              vehicle_plate: os.vehicles?.plate,
              vehicle_model: os.vehicles?.model,
              vehicle_brand: os.vehicles?.brand,
              cliente: os.clients?.name,
              servico: os.problem_description || 'Serviço',
              osNumber: os.order_number,
              serviceOrderId: os.id,
              origem: 'patio',
              tipo: 'normal',
              status: os.status,
            };
            break;
          }
        }
      });

      // Adicionar agendamentos confirmados nos slots disponíveis
      agendamentosConfirmados?.forEach(ag => {
        for (const m of mechanicsData || []) {
          const hora = ag.scheduled_time?.slice(0, 5)?.replace(':', 'h') + '0' || '08h00';
          const allHoras = [...HORARIOS_PADRAO, ...HORARIOS_TARDE];
          const horaMatch = allHoras.find(h => h.startsWith(hora.slice(0, 3))) || allHoras[0];
          
          if (!scheduleMap[m.id][horaMatch]) {
            scheduleMap[m.id][horaMatch] = {
              mechanic_id: m.id,
              hora: horaMatch,
              vehicle_plate: ag.vehicles?.plate,
              vehicle_model: ag.vehicles?.model,
              vehicle_brand: ag.vehicles?.brand,
              cliente: ag.clients?.name,
              servico: ag.service_type,
              origem: 'agendamento',
              tipo: 'normal',
              status: 'confirmado',
            };
            break;
          }
        }
      });

      setSchedule(scheduleMap);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error("Erro ao carregar agenda");
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('agenda-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_mecanicos' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const handleCellClick = (mechanicId: string, hora: string) => {
    const slot = schedule[mechanicId]?.[hora];
    
    if (slot) {
      const mechanic = mechanics.find(m => m.id === mechanicId);
      setSelectedSlot({
        ...slot,
        mechanicName: mechanic?.name || 'Desconhecido',
      });
      setModalOpen(true);
    } else if (hora !== ALMOCO) {
      setEditingCell({ mechanicId, hora });
      setInputValue("");
    }
  };

  const selectVehicleFromPatio = (vehicle: PatioVehicle) => {
    if (!editingCell) return;
    
    setSchedule(prev => ({
      ...prev,
      [editingCell.mechanicId]: {
        ...prev[editingCell.mechanicId],
        [editingCell.hora]: {
          mechanic_id: editingCell.mechanicId,
          hora: editingCell.hora,
          vehicle_plate: vehicle.plate,
          vehicle_model: vehicle.model,
          vehicle_brand: vehicle.brand,
          cliente: vehicle.clientName,
          servico: vehicle.servico,
          osNumber: vehicle.osNumber,
          serviceOrderId: vehicle.id,
          origem: 'patio',
          tipo: editingCell.hora.startsWith('EXTRA') ? 'encaixe' : 'normal',
          status: 'agendado',
          isNew: true,
        },
      },
    }));

    // Atualizar a OS para vincular ao mecânico
    const mechanic = mechanics.find(m => m.id === editingCell.mechanicId);
    supabase
      .from('service_orders')
      .update({ mechanic_id: editingCell.mechanicId })
      .eq('id', vehicle.id)
      .then(({ error }) => {
        if (error) {
          toast.error("Erro ao vincular mecânico");
        } else {
          toast.success(`${vehicle.plate} atribuído a ${mechanic?.name}!`);
        }
      });

    setEditingCell(null);
    setInputValue("");
  };

  const handleInputSubmit = async () => {
    if (!editingCell || !inputValue.trim()) {
      setEditingCell(null);
      return;
    }

    const plate = inputValue.trim().toUpperCase();
    const isEncaixe = editingCell.hora.startsWith('EXTRA');
    
    setSchedule(prev => ({
      ...prev,
      [editingCell.mechanicId]: {
        ...prev[editingCell.mechanicId],
        [editingCell.hora]: {
          mechanic_id: editingCell.mechanicId,
          hora: editingCell.hora,
          vehicle_plate: plate,
          origem: 'patio',
          tipo: isEncaixe ? 'encaixe' : 'normal',
          status: 'agendado',
          isNew: true,
        },
      },
    }));

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const horaDb = editingCell.hora.replace('h', ':').replace('EXTRA ', '17:0');
    
    const { error } = await supabase
      .from('agenda_mecanicos')
      .insert({
        mechanic_id: editingCell.mechanicId,
        data: dateStr,
        hora_inicio: horaDb.slice(0, 5),
        tipo: isEncaixe ? 'encaixe' : 'normal',
        status: 'agendado',
      });

    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Agendamento salvo!");
    }

    setEditingCell(null);
    setInputValue("");
  };

  const handleRemoveSlot = async (slot: SlotDetail) => {
    if (slot.id) {
      await supabase.from('agenda_mecanicos').delete().eq('id', slot.id);
    }
    
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[slot.mechanic_id]) {
        delete newSchedule[slot.mechanic_id][slot.hora];
      }
      return newSchedule;
    });
    toast.success("Removido!");
  };

  const handlePronto = async (slot: SlotDetail) => {
    if (slot.serviceOrderId) {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: 'pronto' })
        .eq('id', slot.serviceOrderId);
      
      if (!error) {
        toast.success(`${slot.vehicle_plate} marcado como Pronto!`);
        fetchData();
      }
    }
  };

  const handleEmTeste = async (slot: SlotDetail) => {
    if (slot.serviceOrderId) {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: 'em_teste' })
        .eq('id', slot.serviceOrderId);
      
      if (!error) {
        toast.success(`${slot.vehicle_plate} em Teste!`);
        fetchData();
      }
    }
  };

  const handleBOPeca = async (slot: SlotDetail) => {
    const { error } = await supabase
      .from('pendencias')
      .insert({
        tipo: 'bo_peca',
        titulo: `B.O em Peça - ${slot.vehicle_plate}`,
        descricao: `Problema com peça no veículo ${slot.vehicle_plate}. Mecânico: ${slot.mechanicName}`,
        service_order_id: slot.serviceOrderId || null,
        vehicle_plate: slot.vehicle_plate,
        mechanic_id: slot.mechanic_id,
        status: 'pendente',
        prioridade: 'alta',
      });

    if (!error) {
      toast.success("B.O em Peça registrado em Pendências!");
    }
  };

  const handleFeedback = (slot: SlotDetail) => {
    setFeedbackSlot(slot);
    setFeedbackScores({ quality: 5, punctuality: 5, performance: 5 });
    setFeedbackNotes("");
    setFeedbackOpen(true);
  };

  const saveFeedback = async () => {
    if (!feedbackSlot) return;

    const { error } = await supabase
      .from('mechanic_daily_feedback')
      .insert({
        mechanic_id: feedbackSlot.mechanic_id,
        feedback_date: format(selectedDate, 'yyyy-MM-dd'),
        quality_score: feedbackScores.quality,
        punctuality_score: feedbackScores.punctuality,
        performance_score: feedbackScores.performance,
        notes: feedbackNotes || null,
      });

    if (!error) {
      toast.success("Feedback salvo!");
      setFeedbackOpen(false);
    }
  };

  const saveSnapshot = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const snapshot = {
      mechanics: mechanics.map(m => ({
        id: m.id,
        name: m.name,
        slots: Object.entries(schedule[m.id] || {}).map(([hora, slot]) => ({ hora, ...slot })),
      })),
      savedAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('agenda_snapshots')
      .insert({ data_agenda: dateStr, snapshot });

    if (!error) {
      toast.success("Retrato da agenda salvo!");
    }
  };

  const allHorarios = [...HORARIOS_PADRAO, ALMOCO, ...HORARIOS_TARDE, ...HORARIOS_EXTRA];

  const fixMechanicName = (name: string) => name.replace(/Tadeiu/gi, 'Tadeu');

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agenda dos Mecânicos</h1>
              <p className="text-sm text-muted-foreground">
                Clique nas células para ver detalhes • Digite placa para buscar no pátio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => subDays(prev, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[150px]">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => addDays(prev, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>

            <Button variant="default" asChild className="gap-2">
              <Link to="/admin/feedback-mecanicos">
                <MessageSquare className="w-4 h-4" />
                Feedback Diário
              </Link>
            </Button>
          </div>
        </div>

        {/* Schedule Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {mechanics.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nenhum mecânico cadastrado.</p>
              </div>
            ) : (
              <table className="w-full min-w-[1200px] border-collapse">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-2 text-left font-medium border-r border-primary-foreground/20 w-24 text-xs">
                      Mecânico
                    </th>
                    {allHorarios.map(hora => (
                      <th 
                        key={hora} 
                        className={cn(
                          "p-1.5 text-center font-medium text-[10px] border-r border-primary-foreground/20",
                          hora === ALMOCO && 'bg-sky-200 text-sky-800',
                          hora.startsWith('EXTRA') && 'bg-amber-500 text-white'
                        )}
                      >
                        {hora}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mechanics.map((mechanic) => (
                    <tr key={mechanic.id} className="border-b hover:bg-muted/20">
                      <td className="p-2 font-medium border-r text-xs">
                        {fixMechanicName(mechanic.name.split(' ')[0])}
                      </td>
                      {allHorarios.map(hora => {
                        const slot = schedule[mechanic.id]?.[hora];
                        const isEditing = editingCell?.mechanicId === mechanic.id && editingCell?.hora === hora;
                        const isLunch = hora === ALMOCO;
                        const isExtra = hora.startsWith('EXTRA');
                        const isAgendamento = slot?.origem === 'agendamento';

                        if (isLunch) {
                          return (
                            <td key={hora} className="p-0.5 border-r">
                              <div className="h-8 bg-sky-100 dark:bg-sky-900/30" />
                            </td>
                          );
                        }

                        return (
                          <td key={hora} className="p-0.5 border-r relative">
                            {isEditing ? (
                              <div className="relative">
                                <div className="flex items-center gap-0.5">
                                  <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleInputSubmit();
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    placeholder="Placa"
                                    className="h-7 text-[10px] w-16 px-1"
                                    autoFocus
                                  />
                                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleInputSubmit}>
                                    <Check className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                                {/* Autocomplete dropdown */}
                                {filteredPatioVehicles.length > 0 && (
                                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-popover border rounded-md shadow-lg">
                                    {filteredPatioVehicles.map(v => (
                                      <div
                                        key={v.id}
                                        className="px-2 py-1.5 hover:bg-muted cursor-pointer text-xs"
                                        onClick={() => selectVehicleFromPatio(v)}
                                      >
                                        <p className="font-mono font-bold">{v.plate}</p>
                                        <p className="text-muted-foreground truncate">{v.brand} {v.model} - {v.clientName}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : slot ? (
                              <div 
                                onClick={() => handleCellClick(mechanic.id, hora)}
                                className={cn(
                                  "h-8 rounded flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-all hover:scale-105 hover:shadow-md",
                                  isAgendamento ? 'bg-teal-500' : isExtra ? 'bg-amber-500' : 'bg-primary'
                                )}
                                title={`${slot.vehicle_plate} - ${slot.cliente || 'Clique para detalhes'}`}
                              >
                                {isAgendamento ? (
                                  <CalendarCheck className="w-2.5 h-2.5 mr-0.5" />
                                ) : (
                                  <Car className="w-2.5 h-2.5 mr-0.5" />
                                )}
                                {slot.vehicle_plate?.slice(-4) || '???'}
                              </div>
                            ) : (
                              <div 
                                className="h-8 rounded bg-muted/30 hover:bg-muted/50 flex items-center justify-center cursor-pointer transition-colors border border-dashed border-muted-foreground/20"
                                onClick={() => handleCellClick(mechanic.id, hora)}
                              >
                                <Plus className="w-3 h-3 text-muted-foreground/30" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
              <Car className="w-2.5 h-2.5 text-white" />
            </div>
            <span>Veículo no Pátio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-teal-500 flex items-center justify-center">
              <CalendarCheck className="w-2.5 h-2.5 text-white" />
            </div>
            <span>Agendamento Confirmado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center">
              <Car className="w-2.5 h-2.5 text-white" />
            </div>
            <span>Encaixe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-sky-100 dark:bg-sky-900/30" />
            <span>Almoço</span>
          </div>
        </div>

        {/* Veículos no Pátio - Lista FIFO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Aguardando Alocação ({patioVehicles.filter(v => !Object.values(schedule).some(s => Object.values(s).some(slot => slot.serviceOrderId === v.id))).length})
              <span className="text-xs text-muted-foreground font-normal ml-2">
                Ordem FIFO • Clique para atribuir
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {patioVehicles
                  .filter(v => !Object.values(schedule).some(s => Object.values(s).some(slot => slot.serviceOrderId === v.id)))
                  .map((v, index) => {
                    // Definir criticidade: primeiros 3 são críticos
                    const isCritical = index < 3;
                    const isUrgent = index < 5 && !isCritical;
                    
                    return (
                      <div
                        key={v.id}
                        className={cn(
                          "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-all",
                          isCritical && "bg-red-500/5 border-l-4 border-l-red-500",
                          isUrgent && "bg-amber-500/5 border-l-4 border-l-amber-500"
                        )}
                        onClick={() => {
                          if (mechanics.length > 0) {
                            const m = mechanics[0];
                            const allHoras = [...HORARIOS_PADRAO, ...HORARIOS_TARDE];
                            const horaVazia = allHoras.find(h => !schedule[m.id]?.[h]);
                            if (horaVazia) {
                              setEditingCell({ mechanicId: m.id, hora: horaVazia });
                              setInputValue(v.plate);
                            }
                          }
                        }}
                      >
                        {/* Posição FIFO */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          isCritical ? "bg-red-500 text-white" : isUrgent ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>

                        {/* Indicador crítico */}
                        {isCritical && (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}

                        {/* Info do veículo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-sm">{v.plate}</p>
                            <Badge variant="outline" className="text-[9px]">
                              {v.osNumber}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {v.brand} {v.model} • {v.clientName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {v.servico}
                          </p>
                        </div>

                        {/* Status */}
                        <Badge 
                          variant={isCritical ? "destructive" : isUrgent ? "secondary" : "outline"} 
                          className="shrink-0 text-[10px]"
                        >
                          {v.status}
                        </Badge>
                      </div>
                    );
                  })}
                {patioVehicles.filter(v => !Object.values(schedule).some(s => Object.values(s).some(slot => slot.serviceOrderId === v.id))).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Todos os veículos estão alocados
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Horários: 8h-16h30 • Almoço: 12h15-13h30 • 3 slots extras • Atualizações em tempo real
        </p>
      </div>

      {/* Modal de Detalhes */}
      <SlotDetailModal
        slot={selectedSlot}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRemove={handleRemoveSlot}
        onPronto={handlePronto}
        onEmTeste={handleEmTeste}
        onBOPeca={handleBOPeca}
        onFeedback={handleFeedback}
      />

      {/* Modal de Feedback */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Feedback para {feedbackSlot?.mechanicName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Qualidade (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={feedbackScores.quality}
                onChange={(e) => setFeedbackScores(p => ({ ...p, quality: parseInt(e.target.value) || 5 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Pontualidade (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={feedbackScores.punctuality}
                onChange={(e) => setFeedbackScores(p => ({ ...p, punctuality: parseInt(e.target.value) || 5 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Performance (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={feedbackScores.performance}
                onChange={(e) => setFeedbackScores(p => ({ ...p, performance: parseInt(e.target.value) || 5 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Comentários sobre o trabalho..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancelar</Button>
            <Button onClick={saveFeedback}>Salvar Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
