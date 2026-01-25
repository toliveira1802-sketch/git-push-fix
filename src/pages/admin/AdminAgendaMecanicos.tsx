import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, Plus, Save, RefreshCw, X, Check, 
  ChevronLeft, ChevronRight, MessageSquare
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

interface DaySchedule {
  [mechanicId: string]: {
    [hora: string]: ScheduleSlot;
  };
}

const HORARIOS_SEMANA = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'];
const HORARIOS_SABADO = ['08:00', '09:00', '10:00', '11:00'];
const HORARIOS_ENCAIXE = ['E1', 'E2', 'E3'];

export default function AdminAgendaMecanicos() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingCell, setEditingCell] = useState<{ mechanicId: string; hora: string } | null>(null);
  const [inputValue, setInputValue] = useState("");

  const isSaturday = selectedDate.getDay() === 6;
  const horarios = isSaturday ? HORARIOS_SABADO : HORARIOS_SEMANA;

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
        const hora = item.hora_inicio?.slice(0, 5) || '';
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
      setHasChanges(false);
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
    if (!slot) {
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
    const isEncaixe = editingCell.hora.startsWith('E');
    
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

    setHasChanges(true);
    setEditingCell(null);
    setInputValue("");
  };

  const handleRemoveSlot = (mechanicId: string, hora: string) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[mechanicId]) {
        delete newSchedule[mechanicId][hora];
      }
      return newSchedule;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Get all new slots
      const newSlots: any[] = [];

      Object.entries(schedule).forEach(([mechanicId, slots]) => {
        Object.entries(slots).forEach(([hora, slot]) => {
          if (slot.isNew) {
            newSlots.push({
              mechanic_id: mechanicId,
              data: dateStr,
              hora_inicio: hora.startsWith('E') ? '17:00' : hora,
              vehicle_id: slot.vehicle_id,
              tipo: slot.tipo,
              status: slot.status,
            });
          }
        });
      });

      if (newSlots.length > 0) {
        const { error } = await supabase
          .from('agenda_mecanicos')
          .insert(newSlots);

        if (error) throw error;
      }

      toast.success("Agenda salva com sucesso!");
      setHasChanges(false);
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error("Erro ao salvar agenda");
    } finally {
      setSaving(false);
    }
  };

  const getSlotStatusColor = (status: string, tipo: string) => {
    if (tipo === 'encaixe') return 'bg-amber-500/80 hover:bg-amber-500';
    switch (status) {
      case 'agendado': return 'bg-primary/80 hover:bg-primary';
      case 'em_andamento': return 'bg-violet-500/80 hover:bg-violet-500';
      case 'concluido': return 'bg-emerald-500/80 hover:bg-emerald-500';
      case 'cancelado': return 'bg-destructive/50';
      default: return 'bg-primary/80';
    }
  };

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
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agenda dos Mecânicos</h1>
              <p className="text-muted-foreground">
                Gerencie os agendamentos diários
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate("/admin/feedback-mecanicos")}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Feedback Diário</p>
              </TooltipContent>
            </Tooltip>
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
                <Button variant="outline" className="gap-2 min-w-[200px]">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "EEEE, dd/MM", { locale: ptBR })}
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

            <Button
              variant="outline"
              onClick={fetchData}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-violet-500" />
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span>Encaixe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted border border-dashed" />
            <span>Almoço</span>
          </div>
        </div>

        {/* Schedule Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {mechanics.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nenhum mecânico cadastrado.</p>
                <p className="text-sm">Adicione mecânicos para gerenciar a agenda.</p>
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium text-muted-foreground w-32">
                      Mecânico
                    </th>
                    {horarios.map(hora => (
                      <th 
                        key={hora} 
                        className={cn(
                          "p-3 text-center font-medium text-sm",
                          hora === '12:00' ? 'bg-muted/50' : ''
                        )}
                      >
                        {hora}
                      </th>
                    ))}
                    {!isSaturday && (
                      <th className="p-3 text-center font-medium text-sm bg-muted/30">
                        12:15
                      </th>
                    )}
                    {HORARIOS_ENCAIXE.map(e => (
                      <th key={e} className="p-3 text-center font-medium text-sm text-amber-500">
                        {e}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mechanics.map((mechanic) => (
                    <tr key={mechanic.id} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">
                        {mechanic.name.split(' ')[0]}
                      </td>
                      {horarios.map(hora => {
                        const slot = schedule[mechanic.id]?.[hora];
                        const isEditing = editingCell?.mechanicId === mechanic.id && editingCell?.hora === hora;

                        return (
                          <td key={hora} className="p-1">
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
                              <div 
                                className={cn(
                                  "relative group h-12 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer",
                                  getSlotStatusColor(slot.status, slot.tipo)
                                )}
                                title={`${slot.vehicle_plate} - ${slot.vehicle_model}`}
                              >
                                {slot.vehicle_plate?.slice(-4) || '???'}
                                <button
                                  onClick={() => handleRemoveSlot(mechanic.id, hora)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="h-12 rounded bg-muted/30 hover:bg-muted/50 flex items-center justify-center cursor-pointer transition-colors"
                                onClick={() => handleCellClick(mechanic.id, hora)}
                              >
                                <Plus className="w-4 h-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {/* Lunch column */}
                      {!isSaturday && (
                        <td className="p-1">
                          <div className="h-12 rounded bg-muted/50 border border-dashed border-muted-foreground/30" />
                        </td>
                      )}
                      {/* Encaixe columns */}
                      {HORARIOS_ENCAIXE.map(e => {
                        const slot = schedule[mechanic.id]?.[e];
                        const isEditing = editingCell?.mechanicId === mechanic.id && editingCell?.hora === e;

                        return (
                          <td key={e} className="p-1">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  onKeyDown={(ev) => {
                                    if (ev.key === 'Enter') handleInputSubmit();
                                    if (ev.key === 'Escape') setEditingCell(null);
                                  }}
                                  placeholder="Placa"
                                  className="h-8 text-xs w-20"
                                  autoFocus
                                />
                              </div>
                            ) : slot ? (
                              <div 
                                className={cn(
                                  "relative group h-12 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer bg-amber-500/80 hover:bg-amber-500"
                                )}
                              >
                                {slot.vehicle_plate?.slice(-4) || '???'}
                                <button
                                  onClick={() => handleRemoveSlot(mechanic.id, e)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="h-12 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-dashed border-amber-500/30 flex items-center justify-center cursor-pointer transition-colors"
                                onClick={() => handleCellClick(mechanic.id, e)}
                              >
                                <Plus className="w-4 h-4 text-amber-500/50" />
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

        {hasChanges && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <span>Você tem alterações não salvas</span>
            <Button size="sm" variant="secondary" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
