import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, Plus, RefreshCw, X, Check, 
  ChevronLeft, ChevronRight, Car, CalendarCheck
} from "lucide-react";
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
  
  // Modal state
  const [selectedSlot, setSelectedSlot] = useState<SlotDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

      // Fetch OSs ativas (veículos no pátio) com mecânico atribuído
      const { data: ossAtivas } = await supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          mechanic_id,
          problem_description,
          status,
          estimated_completion,
          vehicles(plate, model, brand),
          clients(name)
        `)
        .neq('status', 'entregue')
        .not('mechanic_id', 'is', null);

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

      // Distribuir OSs do pátio nos slots disponíveis
      ossAtivas?.forEach(os => {
        if (!os.mechanic_id || !scheduleMap[os.mechanic_id]) return;
        
        // Encontrar primeiro slot disponível para este mecânico
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
        // Distribuir para primeiro mecânico com slot disponível
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

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleCellClick = (mechanicId: string, hora: string) => {
    const slot = schedule[mechanicId]?.[hora];
    
    if (slot) {
      // Abrir modal com detalhes
      const mechanic = mechanics.find(m => m.id === mechanicId);
      setSelectedSlot({
        ...slot,
        mechanicName: mechanic?.name || 'Desconhecido',
      });
      setModalOpen(true);
    } else if (hora !== ALMOCO) {
      // Abrir edição para novo slot
      setEditingCell({ mechanicId, hora });
      setInputValue("");
    }
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

    // Save to database
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
      console.error('Error saving:', error);
      toast.error("Erro ao salvar");
    } else {
      toast.success("Agendamento salvo!");
    }

    setEditingCell(null);
    setInputValue("");
  };

  const handleRemoveSlot = async (slot: SlotDetail) => {
    const mechanicId = slot.mechanic_id;
    const hora = slot.hora;
    
    if (slot.id) {
      await supabase.from('agenda_mecanicos').delete().eq('id', slot.id);
    }
    
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[mechanicId]) {
        delete newSchedule[mechanicId][hora];
      }
      return newSchedule;
    });
    toast.success("Removido!");
  };

  const allHorarios = [...HORARIOS_PADRAO, ALMOCO, ...HORARIOS_TARDE, ...HORARIOS_EXTRA];

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
                Clique nas células para ver detalhes ou adicionar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            >
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

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Schedule Table - COMPACTA */}
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
                        {mechanic.name.split(' ')[0]}
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
                          <td key={hora} className="p-0.5 border-r">
                            {isEditing ? (
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

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Horários: 8h-16h30 • Almoço: 12h15-13h30 • 3 slots extras para encaixes
        </p>
      </div>

      {/* Modal de Detalhes */}
      <SlotDetailModal
        slot={selectedSlot}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRemove={handleRemoveSlot}
      />
    </AdminLayout>
  );
}
