import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { 
  Calendar, Clock, Car, User, Phone, Wrench, 
  Plus, Search, CalendarDays, RefreshCw,
  X, Check, ClipboardCheck, UserPlus, Database
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_id?: string;
  veiculo: string;
  veiculo_id?: string;
  placa: string;
  servicos: string[];
  data: string;
  horario: string;
  origem: 'cliente' | 'kommo' | 'manual';
  status: 'confirmado' | 'aguardando' | 'reagendado' | 'cancelado' | 'concluido';
  observacoes?: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
}

interface Veiculo {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: string;
  user_id: string;
}

const origemConfig: Record<string, { label: string; color: string; icon: string }> = {
  cliente: { label: 'App Cliente', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: '📱' },
  kommo: { label: 'Kommo CRM', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: '🔗' },
  manual: { label: 'Manual', color: 'bg-muted text-muted-foreground border-border', icon: '✏️' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmado: { label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  aguardando: { label: 'Aguardando', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  reagendado: { label: 'Reagendado', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  concluido: { label: 'Concluído', color: 'bg-muted text-muted-foreground border-border' },
};

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

export default function AdminAgendamentos() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrigem, setFilterOrigem] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [showNovoDialog, setShowNovoDialog] = useState(false);
  const [showReagendarDialog, setShowReagendarDialog] = useState(false);
  const [showCancelarDialog, setShowCancelarDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  
  // Novo agendamento form
  const [clienteMode, setClienteMode] = useState<'novo' | 'existente'>('existente');
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<string>('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  
  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    veiculo: '',
    placa: '',
    servicos: '',
    data: undefined as Date | undefined,
    horario: '',
    observacoes: '',
  });
  
  // Reagendar form
  const [novaData, setNovaData] = useState<Date | undefined>(undefined);
  const [novoHorario, setNovoHorario] = useState('');
  
  // Cancelar
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments + vehicles
      const { data: agData } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      // Fetch clients
      const { data: clientesData } = await supabase
        .from('clients')
        .select('id, nome, telefone, email')
        .eq('status', 'ativo')
        .order('nome');

      if (clientesData) setClientes(clientesData);

      // Fetch vehicles
      const { data: veiculosData } = await supabase
        .from('vehicles')
        .select('id, plate, brand, model, year, user_id')
        .eq('is_active', true);

      if (veiculosData) setVeiculos(veiculosData);

      if (agData) {
        const formatted = agData.map(ag => {
          // Encontrar veículo pelo vehicle_id
          const veiculo = veiculosData?.find(v => v.id === ag.vehicle_id);
          // Encontrar cliente pelo user_id do appointment
          const cliente = clientesData?.find(c => c.id === ag.user_id);

          return {
            id: ag.id,
            cliente_nome: cliente?.nome || 'Cliente não encontrado',
            cliente_telefone: cliente?.telefone || '',
            cliente_id: ag.user_id,
            veiculo: veiculo ? `${veiculo.brand} ${veiculo.model} ${veiculo.year || ''}` : '',
            veiculo_id: ag.vehicle_id,
            placa: veiculo?.plate || '',
            servicos: ag.notes ? [ag.notes] : [],
            data: ag.appointment_date,
            horario: ag.appointment_time,
            origem: 'manual' as 'cliente' | 'kommo' | 'manual',
            status: ag.status as 'confirmado' | 'aguardando' | 'reagendado' | 'cancelado' | 'concluido',
            observacoes: ag.notes,
          };
        });
        setAgendamentos(formatted);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar veículos pelo cliente selecionado
  const veiculosDoCliente = veiculos.filter(v => v.user_id === selectedClienteId);

  // Filtros
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const matchSearch = ag.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ag.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ag.veiculo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchOrigem = filterOrigem === 'todos' || ag.origem === filterOrigem;
    const matchStatus = filterStatus === 'todos' || ag.status === filterStatus;
    const matchDate = !selectedDate || ag.data === format(selectedDate, 'yyyy-MM-dd');
    
    return matchSearch && matchOrigem && matchStatus && matchDate;
  });

  // Contadores
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const agendamentosHoje = agendamentos.filter(a => a.data === hoje && a.status !== 'cancelado').length;
  const aguardandoConfirmacao = agendamentos.filter(a => a.status === 'aguardando').length;
  const doKommo = agendamentos.filter(a => a.origem === 'kommo' && a.status !== 'cancelado').length;

  const resetNovoAgendamento = () => {
    setNovoAgendamento({
      cliente_nome: '',
      cliente_telefone: '',
      veiculo: '',
      placa: '',
      servicos: '',
      data: undefined,
      horario: '',
      observacoes: '',
    });
    setClienteMode('existente');
    setSelectedClienteId('');
    setSelectedVeiculoId('');
    setClienteSearch('');
  };

  const handleNovoAgendamento = async () => {
    // Validação
    if (clienteMode === 'existente') {
      if (!selectedClienteId) {
        toast.error("Selecione um cliente existente");
        return;
      }
    } else {
      if (!novoAgendamento.cliente_nome || !novoAgendamento.cliente_telefone) {
        toast.error("Preencha nome e telefone do cliente");
        return;
      }
    }

    if (!novoAgendamento.data || !novoAgendamento.horario) {
      toast.error("Preencha data e horário");
      return;
    }

    try {
      let clientId = selectedClienteId;
      let vehicleId = selectedVeiculoId || null;

      // Se for novo cliente, criar primeiro
      if (clienteMode === 'novo') {
        const { data: novoCliente, error: clienteError } = await supabase
          .from('clients')
          .insert({
            nome: novoAgendamento.cliente_nome,
            telefone: novoAgendamento.cliente_telefone,
            origem_cadastro: 'admin',
          })
          .select()
          .single();

        if (clienteError) throw clienteError;
        clientId = novoCliente.id;

        // Se informou veículo, criar também
        if (novoAgendamento.placa) {
          const { data: novoVeiculo, error: veiculoError } = await supabase
            .from('vehicles')
            .insert({
              user_id: clientId,
              plate: novoAgendamento.placa.toUpperCase(),
              brand: novoAgendamento.veiculo.split(' ')[0] || 'N/I',
              model: novoAgendamento.veiculo.split(' ').slice(1).join(' ') || 'N/I',
            })
            .select()
            .single();

          if (!veiculoError && novoVeiculo) {
            vehicleId = novoVeiculo.id;
          }
        }
      }

      // Criar agendamento
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: clientId,
          vehicle_id: vehicleId,
          appointment_date: format(novoAgendamento.data, 'yyyy-MM-dd'),
          appointment_time: novoAgendamento.horario,
          status: 'pendente',
          notes: novoAgendamento.servicos || novoAgendamento.observacoes || 'Serviço Geral',
        });

      if (error) throw error;

      toast.success("Agendamento criado com sucesso!");
      setShowNovoDialog(false);
      resetNovoAgendamento();
      fetchData();

    } catch (error: any) {
      console.error('Error creating agendamento:', error);
      toast.error(error.message || "Erro ao criar agendamento");
    }
  };

  const handleConfirmar = async (agendamento: Agendamento) => {
    try {
      // Atualizar status do agendamento
      const { error: agError } = await supabase
        .from('appointments')
        .update({
          status: 'confirmado',
        })
        .eq('id', agendamento.id);

      if (agError) throw agError;

      // Gerar número da OS
      const orderNumber = `OS-${Date.now().toString().slice(-8)}`;

      // Criar OS no status de diagnóstico
      const { error: osError } = await supabase
        .from('ordens_servico')
        .insert({
          order_number: orderNumber,
          client_id: agendamento.cliente_id,
          vehicle_id: agendamento.veiculo_id,
          status: 'diagnostico',
          problem_description: agendamento.observacoes || agendamento.servicos.join(', '),
        });

      if (osError) throw osError;

      toast.success("Agendamento confirmado! OS criada e enviada para diagnóstico.");
      fetchData();

    } catch (error: any) {
      console.error('Error confirming:', error);
      toast.error(error.message || "Erro ao confirmar agendamento");
    }
  };

  const handleReagendar = async () => {
    if (!selectedAgendamento || !novaData || !novoHorario) {
      toast.error("Selecione data e horário");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: format(novaData, 'yyyy-MM-dd'),
          appointment_time: novoHorario,
          status: 'reagendado',
        })
        .eq('id', selectedAgendamento.id);

      if (error) throw error;

      setShowReagendarDialog(false);
      setSelectedAgendamento(null);
      setNovaData(undefined);
      setNovoHorario('');
      toast.success("Agendamento reagendado!");
      fetchData();

    } catch (error: any) {
      toast.error(error.message || "Erro ao reagendar");
    }
  };

  const handleCancelar = async () => {
    if (!selectedAgendamento) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelado',
          notes: motivoCancelamento ? `CANCELADO: ${motivoCancelamento}` : undefined,
        })
        .eq('id', selectedAgendamento.id);

      if (error) throw error;

      setShowCancelarDialog(false);
      setSelectedAgendamento(null);
      setMotivoCancelamento('');
      toast.success("Agendamento cancelado");
      fetchData();

    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar");
    }
  };

  // Clientes filtrados pela busca
  const clientesFiltrados = clientes.filter(c =>
    (c.nome || '').toLowerCase().includes(clienteSearch.toLowerCase()) ||
    (c.telefone || '').includes(clienteSearch)
  ).slice(0, 10);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground text-sm">Gerencie os agendamentos da oficina</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/checklist')}>
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Checklist
            </Button>
            <Button onClick={() => setShowNovoDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agendamentosHoje}</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{aguardandoConfirmacao}</p>
                  <p className="text-xs text-muted-foreground">Aguardando</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{doKommo}</p>
                  <p className="text-xs text-muted-foreground">Do Kommo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agendamentos.filter(a => a.status === 'confirmado').length}</p>
                  <p className="text-xs text-muted-foreground">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar cliente, placa ou veículo..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterOrigem} onValueChange={setFilterOrigem}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas origens</SelectItem>
              <SelectItem value="cliente">📱 App Cliente</SelectItem>
              <SelectItem value="kommo">🔗 Kommo</SelectItem>
              <SelectItem value="manual">✏️ Manual</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="reagendado">Reagendado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(!selectedDate && "text-muted-foreground")}>
                <Calendar className="w-4 h-4 mr-2" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Filtrar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="pointer-events-auto"
              />
              {selectedDate && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedDate(undefined)}>
                    Limpar filtro
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Agendamentos List */}
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : agendamentosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            agendamentosFiltrados.map((agendamento) => {
              const origem = origemConfig[agendamento.origem];
              const status = statusConfig[agendamento.status];
              const isToday = agendamento.data === hoje;
              
              return (
                <Card 
                  key={agendamento.id} 
                  className={cn(
                    "transition-all",
                    agendamento.status === 'cancelado' && "opacity-60",
                    isToday && agendamento.status !== 'cancelado' && "border-primary/50 bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{agendamento.cliente_nome}</span>
                          <Badge variant="outline" className={cn("text-xs", origem.color)}>
                            {origem.icon} {origem.label}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", status.color)}>
                            {status.label}
                          </Badge>
                          {isToday && agendamento.status !== 'cancelado' && (
                            <Badge className="bg-primary text-primary-foreground text-xs">HOJE</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {agendamento.horario}
                          </span>
                          {agendamento.placa && (
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {agendamento.placa}
                            </span>
                          )}
                          {agendamento.veiculo && (
                            <span className="text-xs">{agendamento.veiculo}</span>
                          )}
                        </div>
                        
                        {agendamento.servicos.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {agendamento.servicos.map((servico, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <Wrench className="w-3 h-3 mr-1" />
                                {servico}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {agendamento.status === 'aguardando' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirmar(agendamento)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        
                        {agendamento.status !== 'cancelado' && agendamento.status !== 'concluido' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAgendamento(agendamento);
                                setNovaData(new Date(agendamento.data));
                                setNovoHorario(agendamento.horario);
                                setShowReagendarDialog(true);
                              }}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Reagendar
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-500/30 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedAgendamento(agendamento);
                                setShowCancelarDialog(true);
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog: Novo Agendamento */}
      <Dialog open={showNovoDialog} onOpenChange={(open) => {
        setShowNovoDialog(open);
        if (!open) resetNovoAgendamento();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Agendamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Toggle Cliente Novo/Existente */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={clienteMode === 'existente' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setClienteMode('existente')}
              >
                <Database className="w-4 h-4 mr-2" />
                Cliente Existente
              </Button>
              <Button
                type="button"
                variant={clienteMode === 'novo' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setClienteMode('novo')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>

            {clienteMode === 'existente' ? (
              <>
                {/* Buscar Cliente */}
                <div className="space-y-2">
                  <Label>Buscar Cliente *</Label>
                  <Popover open={showClienteDropdown} onOpenChange={setShowClienteDropdown}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start font-normal"
                        onClick={() => setShowClienteDropdown(true)}
                      >
                        {selectedClienteId ? (
                          clientes.find(c => c.id === selectedClienteId)?.nome
                        ) : (
                          <span className="text-muted-foreground">Buscar por nome ou telefone...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar cliente..." 
                          value={clienteSearch}
                          onValueChange={setClienteSearch}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                          <CommandGroup>
                            {clientesFiltrados.map((cliente) => (
                              <CommandItem
                                key={cliente.id}
                                value={cliente.id}
                                onSelect={() => {
                                  setSelectedClienteId(cliente.id);
                                  setSelectedVeiculoId('');
                                  setShowClienteDropdown(false);
                                }}
                              >
                                <User className="w-4 h-4 mr-2" />
                                <div className="flex-1">
                                  <p className="font-medium">{cliente.nome}</p>
                                  <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Veículos do Cliente */}
                {selectedClienteId && (
                  <div className="space-y-2">
                    <Label>Veículo</Label>
                    <Select value={selectedVeiculoId} onValueChange={setSelectedVeiculoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculosDoCliente.length === 0 ? (
                          <SelectItem value="none" disabled>Nenhum veículo cadastrado</SelectItem>
                        ) : (
                          veiculosDoCliente.map(v => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.plate} - {v.brand} {v.model}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Novo Cliente Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nome do Cliente *</Label>
                    <Input 
                      value={novoAgendamento.cliente_nome}
                      onChange={(e) => setNovoAgendamento({...novoAgendamento, cliente_nome: e.target.value})}
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input 
                      value={novoAgendamento.cliente_telefone}
                      onChange={(e) => setNovoAgendamento({...novoAgendamento, cliente_telefone: e.target.value})}
                      placeholder="11999887766"
                    />
                  </div>
                  <div>
                    <Label>Placa</Label>
                    <Input 
                      value={novoAgendamento.placa}
                      onChange={(e) => setNovoAgendamento({...novoAgendamento, placa: e.target.value.toUpperCase()})}
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Veículo</Label>
                    <Input 
                      value={novoAgendamento.veiculo}
                      onChange={(e) => setNovoAgendamento({...novoAgendamento, veiculo: e.target.value})}
                      placeholder="Volkswagen Golf GTI 2020"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campos comuns */}
            <div>
              <Label>Serviços</Label>
              <Input 
                value={novoAgendamento.servicos}
                onChange={(e) => setNovoAgendamento({...novoAgendamento, servicos: e.target.value})}
                placeholder="Troca de Óleo, Revisão de Freios"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start", !novoAgendamento.data && "text-muted-foreground")}>
                      <Calendar className="w-4 h-4 mr-2" />
                      {novoAgendamento.data ? format(novoAgendamento.data, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={novoAgendamento.data}
                      onSelect={(date) => setNovoAgendamento({...novoAgendamento, data: date})}
                      locale={ptBR}
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Horário *</Label>
                <Select value={novoAgendamento.horario} onValueChange={(v) => setNovoAgendamento({...novoAgendamento, horario: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Observações</Label>
              <Textarea 
                value={novoAgendamento.observacoes}
                onChange={(e) => setNovoAgendamento({...novoAgendamento, observacoes: e.target.value})}
                placeholder="Observações sobre o agendamento..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoDialog(false)}>Cancelar</Button>
            <Button onClick={handleNovoAgendamento}>Criar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reagendar */}
      <Dialog open={showReagendarDialog} onOpenChange={setShowReagendarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Reagendar
            </DialogTitle>
          </DialogHeader>
          {selectedAgendamento && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedAgendamento.cliente_nome}</p>
                <p className="text-sm text-muted-foreground">{selectedAgendamento.veiculo}</p>
                <p className="text-sm text-muted-foreground">
                  Atual: {format(new Date(selectedAgendamento.data), "dd/MM/yyyy")} às {selectedAgendamento.horario}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nova Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start", !novaData && "text-muted-foreground")}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {novaData ? format(novaData, "dd/MM/yyyy") : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={novaData}
                        onSelect={setNovaData}
                        locale={ptBR}
                        disabled={(date) => date < new Date()}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Novo Horário</Label>
                  <Select value={novoHorario} onValueChange={setNovoHorario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReagendarDialog(false)}>Cancelar</Button>
            <Button onClick={handleReagendar}>Confirmar Reagendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cancelar */}
      <Dialog open={showCancelarDialog} onOpenChange={setShowCancelarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Cancelar Agendamento
            </DialogTitle>
          </DialogHeader>
          {selectedAgendamento && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedAgendamento.cliente_nome}</p>
                <p className="text-sm text-muted-foreground">{selectedAgendamento.veiculo}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedAgendamento.data), "dd/MM/yyyy")} às {selectedAgendamento.horario}
                </p>
              </div>
              
              <div>
                <Label>Motivo do cancelamento</Label>
                <Textarea 
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Cliente não pode comparecer..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelarDialog(false)}>Voltar</Button>
            <Button variant="destructive" onClick={handleCancelar}>Confirmar Cancelamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
