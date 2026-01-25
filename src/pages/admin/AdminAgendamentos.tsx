import { useState } from "react";
import { 
  Calendar, Clock, Car, User, Phone, Wrench, 
  Plus, Filter, Search, CalendarDays, RefreshCw,
  X, MessageSquare, ExternalLink, Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  veiculo: string;
  placa: string;
  servicos: string[];
  data: string;
  horario: string;
  origem: 'cliente' | 'kommo' | 'manual';
  status: 'confirmado' | 'aguardando' | 'reagendado' | 'cancelado' | 'concluido';
  observacoes?: string;
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

// Mock data
const mockAgendamentos: Agendamento[] = [
  {
    id: 'ag-1',
    cliente_nome: 'João Silva',
    cliente_telefone: '11999887766',
    veiculo: 'Volkswagen Golf GTI 2020',
    placa: 'ABC-1234',
    servicos: ['Troca de Óleo', 'Revisão de Freios'],
    data: '2024-01-25',
    horario: '09:00',
    origem: 'cliente',
    status: 'confirmado',
  },
  {
    id: 'ag-2',
    cliente_nome: 'Maria Santos',
    cliente_telefone: '11988776655',
    veiculo: 'Honda Civic 2022',
    placa: 'XYZ-5678',
    servicos: ['Diagnóstico Elétrico'],
    data: '2024-01-25',
    horario: '10:30',
    origem: 'kommo',
    status: 'aguardando',
    observacoes: 'Lead do Kommo - primeiro contato',
  },
  {
    id: 'ag-3',
    cliente_nome: 'Carlos Oliveira',
    cliente_telefone: '11977665544',
    veiculo: 'Toyota Corolla 2021',
    placa: 'DEF-9012',
    servicos: ['Alinhamento e Balanceamento'],
    data: '2024-01-26',
    horario: '14:00',
    origem: 'manual',
    status: 'confirmado',
  },
  {
    id: 'ag-4',
    cliente_nome: 'Ana Costa',
    cliente_telefone: '11966554433',
    veiculo: 'Fiat Argo 2023',
    placa: 'GHI-3456',
    servicos: ['Revisão Completa'],
    data: '2024-01-24',
    horario: '08:00',
    origem: 'cliente',
    status: 'concluido',
  },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

export default function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrigem, setFilterOrigem] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Dialogs
  const [showNovoDialog, setShowNovoDialog] = useState(false);
  const [showReagendarDialog, setShowReagendarDialog] = useState(false);
  const [showCancelarDialog, setShowCancelarDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  
  // Novo agendamento form
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

  const handleNovoAgendamento = () => {
    if (!novoAgendamento.cliente_nome || !novoAgendamento.data || !novoAgendamento.horario) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    
    const novo: Agendamento = {
      id: `ag-${Date.now()}`,
      cliente_nome: novoAgendamento.cliente_nome,
      cliente_telefone: novoAgendamento.cliente_telefone,
      veiculo: novoAgendamento.veiculo,
      placa: novoAgendamento.placa,
      servicos: novoAgendamento.servicos.split(',').map(s => s.trim()).filter(Boolean),
      data: format(novoAgendamento.data, 'yyyy-MM-dd'),
      horario: novoAgendamento.horario,
      origem: 'manual',
      status: 'confirmado',
      observacoes: novoAgendamento.observacoes,
    };
    
    setAgendamentos([novo, ...agendamentos]);
    setShowNovoDialog(false);
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
    toast.success("Agendamento criado!");
  };

  const handleReagendar = () => {
    if (!selectedAgendamento || !novaData || !novoHorario) {
      toast.error("Selecione data e horário");
      return;
    }
    
    setAgendamentos(agendamentos.map(ag => 
      ag.id === selectedAgendamento.id 
        ? { ...ag, data: format(novaData, 'yyyy-MM-dd'), horario: novoHorario, status: 'reagendado' as const }
        : ag
    ));
    
    setShowReagendarDialog(false);
    setSelectedAgendamento(null);
    setNovaData(undefined);
    setNovoHorario('');
    toast.success("Agendamento reagendado!");
  };

  const handleCancelar = () => {
    if (!selectedAgendamento) return;
    
    setAgendamentos(agendamentos.map(ag => 
      ag.id === selectedAgendamento.id 
        ? { ...ag, status: 'cancelado' as const, observacoes: `${ag.observacoes || ''}\nCancelado: ${motivoCancelamento}`.trim() }
        : ag
    ));
    
    setShowCancelarDialog(false);
    setSelectedAgendamento(null);
    setMotivoCancelamento('');
    toast.success("Agendamento cancelado");
  };

  const handleConfirmar = (agendamento: Agendamento) => {
    setAgendamentos(agendamentos.map(ag => 
      ag.id === agendamento.id ? { ...ag, status: 'confirmado' as const } : ag
    ));
    toast.success("Agendamento confirmado!");
  };

  const handleWhatsApp = (agendamento: Agendamento) => {
    const phone = agendamento.cliente_telefone.replace(/\D/g, '');
    const mensagem = `Olá ${agendamento.cliente_nome}! 🚗\n\nConfirmando seu agendamento:\n📅 ${format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}\n⏰ ${agendamento.horario}\n🚘 ${agendamento.veiculo}\n\nDoctor Auto Prime`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground text-sm">Gerencie os agendamentos da oficina</p>
          </div>
          <Button onClick={() => setShowNovoDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
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
                  <ExternalLink className="w-5 h-5 text-purple-600" />
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
          {agendamentosFiltrados.length === 0 ? (
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
              const isPast = new Date(agendamento.data) < new Date(hoje);
              
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
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {agendamento.veiculo}
                          </span>
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {agendamento.placa}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {agendamento.servicos.map((servico, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Wrench className="w-3 h-3 mr-1" />
                              {servico}
                            </Badge>
                          ))}
                        </div>
                        
                        {agendamento.observacoes && (
                          <p className="text-xs text-muted-foreground italic">
                            {agendamento.observacoes}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {agendamento.status === 'aguardando' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => handleConfirmar(agendamento)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWhatsApp(agendamento)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        
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
      <Dialog open={showNovoDialog} onOpenChange={setShowNovoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Agendamento Manual
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                <Label>Telefone</Label>
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
              <div className="col-span-2">
                <Label>Serviços (separados por vírgula)</Label>
                <Input 
                  value={novoAgendamento.servicos}
                  onChange={(e) => setNovoAgendamento({...novoAgendamento, servicos: e.target.value})}
                  placeholder="Troca de Óleo, Revisão de Freios"
                />
              </div>
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
