import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, Plus, RefreshCw, X, Check, 
  ChevronLeft, ChevronRight, Car
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  vehicle_id?: string;
  tipo: 'normal' | 'encaixe';
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  isNew?: boolean;
}

interface NextService {
  mechanic_id: string;
  order_number: string;
  vehicle_plate: string;
  vehicle_model: string;
  problem: string;
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
  const [nextServices, setNextServices] = useState<NextService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ mechanicId: string; hora: string } | null>(null);
  const [inputValue, setInputValue] = useState("");

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

      // Build schedule map
      const scheduleMap: DaySchedule = {};
      mechanicsData?.forEach(m => {
        scheduleMap[m.id] = {};
      });

      agendaData?.forEach((item: any) => {
        const hora = item.hora_inicio?.slice(0, 5)?.replace(':', 'h') + '0' || '';
        if (scheduleMap[item.mechanic_id]) {
          scheduleMap[item.mechanic_id][hora] = {
            id: item.id,
            mechanic_id: item.mechanic_id,
            hora,
            vehicle_id: item.vehicle_id,
            tipo: item.tipo,
            status: item.status,
          };
        }
      });

      setSchedule(scheduleMap);

      // Fetch próximos serviços (OSs ativas por mecânico)
      const { data: ossAtivas } = await supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          mechanic_id,
          problem_description,
          vehicles(plate, model)
        `)
        .neq('status', 'entregue')
        .not('mechanic_id', 'is', null)
        .order('created_at', { ascending: true })
        .limit(20);

      // Agrupar por mecânico (máx 3 por mecânico)
      const servicesByMechanic: Record<string, NextService[]> = {};
      (ossAtivas || []).forEach(os => {
        if (!os.mechanic_id) return;
        if (!servicesByMechanic[os.mechanic_id]) {
          servicesByMechanic[os.mechanic_id] = [];
        }
        if (servicesByMechanic[os.mechanic_id].length < 3) {
          servicesByMechanic[os.mechanic_id].push({
            mechanic_id: os.mechanic_id,
            order_number: os.order_number,
            vehicle_plate: os.vehicles?.plate || '',
            vehicle_model: os.vehicles?.model || '',
            problem: os.problem_description || 'FALAR COM CONSULTOR',
          });
        }
      });

      // Criar lista flat
      const allServices: NextService[] = [];
      mechanicsData?.forEach(m => {
        const services = servicesByMechanic[m.id] || [];
        // Preencher até 3
        for (let i = 0; i < 3; i++) {
          allServices.push(services[i] || {
            mechanic_id: m.id,
            order_number: '',
            vehicle_plate: '',
            vehicle_model: '',
            problem: 'FALAR COM CONSULTOR',
          });
        }
      });

      setNextServices(allServices);

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
    if (!slot && hora !== ALMOCO) {
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
          vehicle_model: '',
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

  const handleRemoveSlot = async (mechanicId: string, hora: string) => {
    const slot = schedule[mechanicId]?.[hora];
    if (slot?.id) {
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
                Passe o mouse nas células para ver detalhes
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
              <PopoverContent className="w-auto p-0" align="center">
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
                    <th className="p-3 text-left font-medium border-r border-primary-foreground/20 w-28">
                      Mecânico
                    </th>
                    {allHorarios.map(hora => (
                      <th 
                        key={hora} 
                        className={cn(
                          "p-2 text-center font-medium text-xs border-r border-primary-foreground/20",
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
                      <td className="p-3 font-medium border-r text-sm">
                        {mechanic.name.split(' ')[0]}
                      </td>
                      {allHorarios.map(hora => {
                        const slot = schedule[mechanic.id]?.[hora];
                        const isEditing = editingCell?.mechanicId === mechanic.id && editingCell?.hora === hora;
                        const isLunch = hora === ALMOCO;
                        const isExtra = hora.startsWith('EXTRA');

                        if (isLunch) {
                          return (
                            <td key={hora} className="p-1 border-r">
                              <div className="h-10 bg-sky-100 border border-sky-200" />
                            </td>
                          );
                        }

                        return (
                          <td key={hora} className="p-1 border-r">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleInputSubmit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  placeholder="Placa"
                                  className="h-8 text-xs w-20"
                                  autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleInputSubmit}>
                                  <Check className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : slot ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={cn(
                                      "relative group h-10 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer",
                                      isExtra ? 'bg-amber-500' : 'bg-primary'
                                    )}
                                  >
                                    <Car className="w-3 h-3 mr-1" />
                                    {slot.vehicle_plate?.slice(-4) || '???'}
                                    <button
                                      onClick={() => handleRemoveSlot(mechanic.id, hora)}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-2 h-2" />
                                    </button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{slot.vehicle_plate}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <div 
                                className="h-10 rounded bg-muted/30 hover:bg-muted/50 flex items-center justify-center cursor-pointer transition-colors border border-dashed border-muted-foreground/20"
                                onClick={() => handleCellClick(mechanic.id, hora)}
                              >
                                <Plus className="w-4 h-4 text-muted-foreground/30" />
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
        <div className="flex flex-wrap gap-6 text-sm px-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Car className="w-3 h-3 text-white" />
            </div>
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center">
              <Car className="w-3 h-3 text-white" />
            </div>
            <span>Encaixe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-sky-100 border border-sky-200" />
            <span>Almoço</span>
          </div>
          <span className="text-muted-foreground italic">⚠️ Passe o mouse sobre os ícones para ver detalhes e ações</span>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Horários: 8h-16h30 • Almoço: 12h15-13h30 • 3 slots extras para encaixes
        </p>
        <p className="text-center text-xs text-destructive">
          ⚡ Produtividade monitorada - Registros de tempo salvos automaticamente
        </p>

        {/* Próximos Serviços */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Próximos Serviços</h2>
              <span className="text-sm text-muted-foreground">Próximos 3 serviços de cada mecânico</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    {mechanics.map(m => (
                      <th key={m.id} className="p-2 text-center text-sm font-medium">
                        {m.name.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2].map(index => (
                    <tr key={index} className="border-b">
                      {mechanics.map(m => {
                        const service = nextServices.find(
                          (s, i) => s.mechanic_id === m.id && 
                          nextServices.filter((ss, ii) => ss.mechanic_id === m.id && ii < i).length === index
                        );
                        return (
                          <td key={m.id} className="p-2 text-center text-xs">
                            {service?.order_number ? (
                              <div>
                                <p className="font-medium">{service.vehicle_plate}</p>
                                <p className="text-muted-foreground truncate max-w-[150px]">
                                  {service.problem || service.vehicle_model}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">FALAR COM CONSULTOR</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
