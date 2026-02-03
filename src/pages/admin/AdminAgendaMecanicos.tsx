import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, RefreshCw, Car, Plus, AlertTriangle, CheckCircle, Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

// Horários conforme imagem
const HORARIOS_MANHA = ['08h00', '09h00', '10h00', '11h00'];
const ALMOCO = 'ALMOÇO';
const HORARIOS_TARDE = ['13h30', '14h30', '15h30', '16h30'];
const HORARIOS_EXTRA = ['EXTRA 1', 'EXTRA 2', 'EXTRA 3'];

export default function AdminAgendaMecanicos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  
  // Estado para célula em edição (pesquisa de placa)
  const [editingCell, setEditingCell] = useState<{ mechanicId: string; hora: string } | null>(null);
  const [searchPlate, setSearchPlate] = useState("");
  
  // Estado para célula selecionada (mostra botões de ação)
  const [selectedCell, setSelectedCell] = useState<{ mechanicId: string; hora: string; slot: ScheduleSlot } | null>(null);
  
  // Veículos no pátio
  const [patioVehicles, setPatioVehicles] = useState<PatioVehicle[]>([]);

  // Filtrar veículos do pátio baseado na pesquisa
  const filteredPatioVehicles = useMemo(() => {
    if (!searchPlate.trim()) return patioVehicles.slice(0, 8);
    const search = searchPlate.toLowerCase();
    return patioVehicles.filter(v => 
      v.plate.toLowerCase().includes(search) ||
      v.model.toLowerCase().includes(search) ||
      v.clientName.toLowerCase().includes(search)
    ).slice(0, 8);
  }, [searchPlate, patioVehicles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch mechanics
      const { data: mechanicsData } = await supabase
        .from('mecanicos')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      setMechanics((mechanicsData as any[]) || []);

      // Fetch OSs ativas (veículos no pátio)
      const { data: ossAtivas } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          order_number,
          mechanic_id,
          problem_description,
          status,
          veiculos(id, plate, model, brand),
          clientes(name)
        `)
        .neq('status', 'entregue')
        .order('created_at', { ascending: true });

      // Salvar lista de veículos no pátio
      const patio: PatioVehicle[] = ((ossAtivas as any[]) || []).map((os: any) => ({
        id: os.id,
        plate: os.veiculos?.plate || '',
        model: os.veiculos?.model || '',
        brand: os.veiculos?.brand || '',
        clientName: os.clientes?.name || '',
        osNumber: os.order_number,
        status: os.status,
        servico: os.problem_description || 'Serviço',
      }));
      setPatioVehicles(patio);

      // Build schedule map baseado nas OSs com mecânico
      const scheduleMap: DaySchedule = {};
      mechanicsData?.forEach(m => {
        scheduleMap[m.id] = {};
      });

      // Distribuir OSs com mecânico atribuído
      ((ossAtivas as any[]) || []).filter((os: any) => os.mechanic_id).forEach((os: any) => {
        if (!os.mechanic_id || !scheduleMap[os.mechanic_id]) return;
        
        const allHoras = [...HORARIOS_MANHA, ...HORARIOS_TARDE, ...HORARIOS_EXTRA];
        for (const hora of allHoras) {
          if (!scheduleMap[os.mechanic_id][hora]) {
            scheduleMap[os.mechanic_id][hora] = {
              mechanic_id: os.mechanic_id,
              hora,
              vehicle_plate: os.veiculos?.plate,
              vehicle_model: os.veiculos?.model,
              vehicle_brand: os.veiculos?.brand,
              cliente: os.clientes?.name,
              servico: os.problem_description || 'Serviço',
              osNumber: os.order_number,
              serviceOrderId: os.id,
              origem: 'patio',
              tipo: hora.startsWith('EXTRA') ? 'encaixe' : 'normal',
              status: os.status,
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
    
    const channel = supabase
      .channel('agenda-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_servico' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  // Clicar em célula vazia - abre pesquisa de placa
  const handleEmptyCellClick = (mechanicId: string, hora: string) => {
    setSelectedCell(null);
    setEditingCell({ mechanicId, hora });
    setSearchPlate("");
  };

  // Clicar em célula com veículo - abre modal com 3 botões
  const handleFilledCellClick = (mechanicId: string, hora: string, slot: ScheduleSlot) => {
    setEditingCell(null);
    setSelectedCell({ mechanicId, hora, slot });
  };

  // Selecionar veículo do pátio
  const selectVehicle = async (vehicle: PatioVehicle) => {
    if (!editingCell) return;
    
    const mechanic = mechanics.find(m => m.id === editingCell.mechanicId);
    
    // Atualizar a OS para vincular ao mecânico
    const { error } = await supabase
      .from('ordens_servico')
      .update({ mechanic_id: editingCell.mechanicId })
      .eq('id', vehicle.id);

    if (error) {
      toast.error("Erro ao vincular mecânico");
      return;
    }

    // Atualizar schedule local
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
          status: vehicle.status,
        },
      },
    }));

    toast.success(`${vehicle.plate} atribuído a ${mechanic?.name}!`);
    setEditingCell(null);
    setSearchPlate("");
  };

  // Botão Vermelho - Problema atual (cria pendência)
  const handleProblema = async () => {
    if (!selectedCell) return;
    const { slot } = selectedCell;
    const mechanic = mechanics.find(m => m.id === slot.mechanic_id);

    const { error } = await supabase
      .from('pendencias')
      .insert({
        tipo: 'problema_atual',
        titulo: `Problema em ${slot.vehicle_plate}`,
        descricao: `Problema identificado no veículo ${slot.vehicle_plate} (${slot.vehicle_brand} ${slot.vehicle_model}). Cliente: ${slot.cliente}. Mecânico responsável: ${mechanic?.name}`,
        service_order_id: slot.serviceOrderId || null,
        vehicle_plate: slot.vehicle_plate,
        mechanic_id: slot.mechanic_id,
        status: 'pendente',
        prioridade: 'alta',
      });

    if (!error) {
      toast.success("Pendência registrada!");
      setSelectedCell(null);
    } else {
      toast.error("Erro ao registrar pendência");
    }
  };

  // Botão Azul - Carro em teste
  const handleEmTeste = async () => {
    if (!selectedCell?.slot.serviceOrderId) return;
    
    const { error } = await supabase
      .from('ordens_servico')
      .update({ status: 'em_teste' })
      .eq('id', selectedCell.slot.serviceOrderId);
    
    if (!error) {
      toast.success(`${selectedCell.slot.vehicle_plate} em Teste!`);
      setSelectedCell(null);
      fetchData();
    }
  };

  // Botão Verde - Carro pronto
  const handlePronto = async () => {
    if (!selectedCell?.slot.serviceOrderId) return;
    
    const { error } = await supabase
      .from('ordens_servico')
      .update({ status: 'pronto' })
      .eq('id', selectedCell.slot.serviceOrderId);
    
    if (!error) {
      toast.success(`${selectedCell.slot.vehicle_plate} marcado como Pronto!`);
      setSelectedCell(null);
      fetchData();
    }
  };

  const allHorarios = [...HORARIOS_MANHA, ALMOCO, ...HORARIOS_TARDE, ...HORARIOS_EXTRA];

  // Próximos serviços por mecânico (até 3 por mecânico)
  const proximosServicosPorMecanico = useMemo(() => {
    const result: { [mechanicId: string]: PatioVehicle[] } = {};
    mechanics.forEach(m => {
      result[m.id] = patioVehicles
        .filter(v => !Object.values(schedule[m.id] || {}).some(slot => slot.serviceOrderId === v.id))
        .slice(0, 3);
    });
    return result;
  }, [mechanics, patioVehicles, schedule]);

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
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Agenda dos Mecânicos
            </h1>
            <p className="text-xs text-muted-foreground">
              Passe o mouse nas células para ver detalhes
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Tabela da Agenda */}
        <Card className="border-2 border-primary">
          <CardContent className="p-0 overflow-x-auto">
            {mechanics.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nenhum mecânico cadastrado.</p>
              </div>
            ) : (
              <table className="w-full min-w-[1200px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium bg-primary text-primary-foreground text-sm w-24 border-r border-primary-foreground/20">
                      Mecânico
                    </th>
                    {allHorarios.map(hora => (
                      <th 
                        key={hora} 
                        className={cn(
                          "p-2 text-center font-medium text-xs border-r",
                          hora === ALMOCO 
                            ? 'bg-gray-300 text-gray-700' 
                            : hora.startsWith('EXTRA') 
                              ? 'bg-orange-500 text-white'
                              : 'bg-primary text-primary-foreground border-primary-foreground/20'
                        )}
                      >
                        {hora}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mechanics.map((mechanic) => (
                    <tr key={mechanic.id} className="border-b">
                      <td className="p-2 font-medium text-sm border-r bg-muted/30">
                        {mechanic.name.split(' ')[0]}
                      </td>
                      {allHorarios.map(hora => {
                        const slot = schedule[mechanic.id]?.[hora];
                        const isEditing = editingCell?.mechanicId === mechanic.id && editingCell?.hora === hora;
                        const isSelected = selectedCell?.mechanicId === mechanic.id && selectedCell?.hora === hora;
                        const isLunch = hora === ALMOCO;
                        const isExtra = hora.startsWith('EXTRA');

                        // Célula de almoço
                        if (isLunch) {
                          return (
                            <td key={hora} className="p-1 border-r">
                              <div className="h-10 bg-amber-100 dark:bg-amber-900/30" />
                            </td>
                          );
                        }

                        return (
                          <td key={hora} className={cn(
                            "p-1 border-r relative",
                            isExtra && "bg-orange-50 dark:bg-orange-900/10"
                          )}>
                            {/* Célula em edição - pesquisa de placa */}
                            {isEditing && (
                              <Dialog open={true} onOpenChange={() => setEditingCell(null)}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Car className="w-5 h-5" />
                                      Selecionar Veículo - {hora}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <Input
                                      placeholder="Pesquisar placa..."
                                      value={searchPlate}
                                      onChange={(e) => setSearchPlate(e.target.value)}
                                      className="text-lg"
                                      autoFocus
                                    />
                                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                                      {filteredPatioVehicles.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                          Nenhum veículo encontrado
                                        </p>
                                      ) : (
                                        filteredPatioVehicles.map(v => (
                                          <div
                                            key={v.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                                            onClick={() => selectVehicle(v)}
                                          >
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                              <Car className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-mono font-bold">{v.plate}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {v.brand} {v.model} • {v.clientName}
                                              </p>
                                            </div>
                                            <Badge variant="outline">{v.osNumber}</Badge>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {/* Célula selecionada - mostra 3 botões */}
                            {isSelected && slot && (
                              <Dialog open={true} onOpenChange={() => setSelectedCell(null)}>
                                <DialogContent className="max-w-sm">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Car className="w-5 h-5" />
                                      {slot.vehicle_plate}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                      <p><strong>Veículo:</strong> {slot.vehicle_brand} {slot.vehicle_model}</p>
                                      <p><strong>Cliente:</strong> {slot.cliente}</p>
                                      <p><strong>Serviço:</strong> {slot.servico}</p>
                                      <p><strong>OS:</strong> {slot.osNumber}</p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 pt-2">
                                      {/* Botão Vermelho - Problema */}
                                      <Button 
                                        variant="destructive" 
                                        className="w-full gap-2"
                                        onClick={handleProblema}
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                        Problema Atual
                                      </Button>
                                      
                                      {/* Botão Azul - Em Teste */}
                                      <Button 
                                        className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
                                        onClick={handleEmTeste}
                                      >
                                        <Wrench className="w-4 h-4" />
                                        Carro em Teste
                                      </Button>
                                      
                                      {/* Botão Verde - Pronto */}
                                      <Button 
                                        className="w-full gap-2 bg-green-500 hover:bg-green-600"
                                        onClick={handlePronto}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Carro Pronto
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {/* Célula com veículo */}
                            {slot ? (
                              <div 
                                onClick={() => handleFilledCellClick(mechanic.id, hora, slot)}
                                className={cn(
                                  "h-10 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all hover:scale-105 hover:shadow-md",
                                  isExtra ? 'bg-orange-500' : 'bg-primary'
                                )}
                                title={`${slot.vehicle_plate} - ${slot.cliente}`}
                              >
                                {slot.vehicle_plate}
                              </div>
                            ) : (
                              /* Célula vazia - mostra + */
                              <div 
                                className="h-10 rounded bg-white dark:bg-muted/20 hover:bg-muted/50 flex items-center justify-center cursor-pointer transition-colors border border-dashed border-muted-foreground/20"
                                onClick={() => handleEmptyCellClick(mechanic.id, hora)}
                              >
                                <Plus className="w-4 h-4 text-muted-foreground/40" />
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

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-6 text-xs px-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>Encaixe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300" />
            <span>Almoço</span>
          </div>
          <span className="text-muted-foreground ml-4">
            ℹ️ Passe o mouse sobre os ícones para ver detalhes e ações
          </span>
        </div>

        {/* Info de horários */}
        <p className="text-center text-xs text-muted-foreground">
          Horários: 8h-16h30 • Almoço: 12h15-13h30 • 3 slots extras para encaixes
          <br />
          <span className="text-amber-600">⚠️ Produtividade monitorada</span> • Registros de tempo salvos automaticamente
        </p>

        {/* Próximos Serviços */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              Próximos Serviços
            </CardTitle>
            <p className="text-xs text-muted-foreground">Próximos 3 serviços de cada mecânico</p>
          </CardHeader>
          <CardContent className="p-0">
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
                  {[0, 1, 2].map(idx => (
                    <tr key={idx} className="border-b">
                      {mechanics.map(m => {
                        const servico = proximosServicosPorMecanico[m.id]?.[idx];
                        return (
                          <td key={m.id} className="p-3 text-center text-xs">
                            {servico ? (
                              <div className="text-muted-foreground">
                                <span className="font-mono font-bold">{servico.plate}</span>
                                <br />
                                <span className="text-[10px]">{servico.servico?.slice(0, 30) || 'FALAR COM CONSULTOR'}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">FALAR COM CONSULTOR</span>
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
