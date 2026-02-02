import { useParams, useLocation } from "wouter";
import { useState } from "react";
import {
  ArrowLeft, Car, Phone, AlertTriangle,
  Clock, Loader2, CheckCircle, XCircle, User, Cake, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrdemServicoItem {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  motivo_recusa: string | null;
  prioridade: 'verde' | 'amarelo' | 'vermelho' | null;
  data_retorno_estimada: string | null;
}

interface OrdemServico {
  id: string;
  numero_os: string;
  plate: string;
  vehicle: string;
  client_name: string | null;
  client_phone: string | null;
  status: string;
  data_entrada: string | null;
  descricao_problema: string | null;
  diagnostico: string | null;
}

interface ClientProfile {
  full_name: string;
  phone: string;
  birthday: string | null;
}

const prioridadeConfig: Record<string, { label: string; description: string; borderColor: string; bgColor: string; icon: React.ElementType }> = {
  vermelho: {
    label: "Urgente",
    description: "Troca imediata necessária - risco de segurança",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertTriangle
  },
  amarelo: {
    label: "Atenção",
    description: "Recomendamos fazer em breve",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Clock
  },
  verde: {
    label: "Preventivo",
    description: "Pode aguardar, mas fique atento",
    borderColor: "border-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle
  },
};

// Mock data para desenvolvimento
const mockOS: OrdemServico = {
  id: "1",
  numero_os: "OS-2026-0042",
  plate: "ABC-1D34",
  vehicle: "Honda Civic EXL 2.0",
  client_name: "João Silva Santos",
  client_phone: "(11) 98765-4321",
  status: "em_orcamento",
  data_entrada: "2026-01-28",
  descricao_problema: "Cliente relata ruído no motor ao acelerar",
  diagnostico: "Após análise, identificado problema no sistema de injeção e necessidade de limpeza dos bicos injetores. Sensor MAP apresentando leituras incorretas."
};

const mockItens: OrdemServicoItem[] = [
  { 
    id: "1", 
    descricao: "Troca de pastilhas de freio dianteiras", 
    tipo: "peca", 
    quantidade: 1, 
    valor_unitario: 450.00, 
    valor_total: 450.00, 
    status: "pendente", 
    motivo_recusa: null, 
    prioridade: "vermelho",
    data_retorno_estimada: null
  },
  { 
    id: "2", 
    descricao: "Troca de discos de freio dianteiros", 
    tipo: "peca", 
    quantidade: 2, 
    valor_unitario: 380.00, 
    valor_total: 760.00, 
    status: "pendente", 
    motivo_recusa: null, 
    prioridade: "vermelho",
    data_retorno_estimada: null
  },
  { 
    id: "3", 
    descricao: "Troca do sensor MAP", 
    tipo: "peca", 
    quantidade: 1, 
    valor_unitario: 480.00, 
    valor_total: 480.00, 
    status: "aprovado", 
    motivo_recusa: null, 
    prioridade: "amarelo",
    data_retorno_estimada: null
  },
  { 
    id: "4", 
    descricao: "Limpeza de bicos injetores", 
    tipo: "mao_de_obra", 
    quantidade: 1, 
    valor_unitario: 350.00, 
    valor_total: 350.00, 
    status: "aprovado", 
    motivo_recusa: null, 
    prioridade: "amarelo",
    data_retorno_estimada: null
  },
  { 
    id: "5", 
    descricao: "Troca de velas NGK", 
    tipo: "peca", 
    quantidade: 4, 
    valor_unitario: 70.00, 
    valor_total: 280.00, 
    status: "pendente", 
    motivo_recusa: null, 
    prioridade: "verde",
    data_retorno_estimada: null
  },
  { 
    id: "6", 
    descricao: "Troca óleo motor sintético 5W30", 
    tipo: "peca", 
    quantidade: 1, 
    valor_unitario: 340.00, 
    valor_total: 340.00, 
    status: "recusado", 
    motivo_recusa: "Recusado pelo cliente", 
    prioridade: "verde",
    data_retorno_estimada: null
  },
];

const mockClientProfile: ClientProfile = {
  full_name: "João Silva Santos",
  phone: "(11) 98765-4321",
  birthday: "1985-03-15"
};

export default function OrcamentoCliente() {
  const params = useParams<{ osId: string }>();
  const osId = params.osId;
  const [, setLocation] = useLocation();
  const [itens, setItens] = useState<OrdemServicoItem[]>(mockItens);
  const [isLoading, setIsLoading] = useState(false);

  // Usando dados mock por enquanto
  const os = mockOS;
  const clientProfile = mockClientProfile;

  const aprovarItem = async (itemId: string) => {
    setIsLoading(true);
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    setItens(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: "aprovado", motivo_recusa: null } : item
    ));
    toast.success("Item aprovado! ✅");
    setIsLoading(false);
  };

  const recusarItem = async (itemId: string) => {
    setIsLoading(true);
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    setItens(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: "recusado", motivo_recusa: "Recusado pelo cliente" } : item
    ));
    toast.success("Item recusado");
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatBirthday = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return null;
    }
  };

  // Calculate totals
  const totalOrcado = itens.reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const totalPecas = itens
    .filter(item => item.tipo === "peca")
    .reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const totalServicos = itens
    .filter(item => item.tipo === "mao_de_obra")
    .reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const totalAprovado = itens
    .filter(item => item.status === "aprovado")
    .reduce((acc, item) => acc + (item.valor_total || 0), 0);
  const itensPendentes = itens.filter(item => item.status === "pendente");

  // Group items by priority
  const itensUrgentes = itens.filter(i => i.prioridade === 'vermelho');
  const itensAtencao = itens.filter(i => i.prioridade === 'amarelo');
  const itensPreventivos = itens.filter(i => i.prioridade === 'verde' || !i.prioridade);

  const renderItemCard = (item: OrdemServicoItem) => {
    const prioridade = prioridadeConfig[item.prioridade || 'verde'];
    const PrioridadeIcon = prioridade.icon;
    const isPendente = item.status === "pendente";
    const isAprovado = item.status === "aprovado";
    const isRecusado = item.status === "recusado";

    return (
      <Card
        key={item.id}
        className={cn(
          "border-2 transition-all",
          prioridade.borderColor,
          prioridade.bgColor,
          isRecusado && "opacity-50"
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header com criticidade */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <PrioridadeIcon className={cn(
                  "w-4 h-4",
                  item.prioridade === 'vermelho' && "text-red-600",
                  item.prioridade === 'amarelo' && "text-yellow-600",
                  item.prioridade === 'verde' && "text-green-600"
                )} />
                <Badge variant="outline" className={cn(
                  "text-xs",
                  item.prioridade === 'vermelho' && "border-red-500 text-red-600",
                  item.prioridade === 'amarelo' && "border-yellow-500 text-yellow-600",
                  item.prioridade === 'verde' && "border-green-500 text-green-600"
                )}>
                  {prioridade.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {item.tipo === 'peca' ? 'Peça' : 'Mão de Obra'}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">{item.descricao}</h3>
              <p className="text-xs text-muted-foreground mt-1">{prioridade.description}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{formatCurrency(item.valor_total)}</p>
              {item.quantidade > 1 && (
                <p className="text-xs text-muted-foreground">{item.quantidade}x {formatCurrency(item.valor_unitario)}</p>
              )}
            </div>
          </div>

          {/* Status */}
          {isAprovado && (
            <div className="flex items-center gap-2 p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Aprovado</span>
            </div>
          )}

          {isRecusado && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Recusado</span>
              </div>
              {item.motivo_recusa && (
                <p className="text-xs text-muted-foreground pl-2">"{item.motivo_recusa}"</p>
              )}
            </div>
          )}

          {isPendente && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Aguardando sua decisão</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-500/10"
                  onClick={() => aprovarItem(item.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Aprovar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-500/10"
                  onClick={() => recusarItem(item.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Recusar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const clientName = clientProfile?.full_name || os.client_name;
  const clientPhone = clientProfile?.phone || os.client_phone;
  const clientBirthday = formatBirthday(clientProfile?.birthday);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/cliente")}
            className="rounded-full text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-white">Orçamento</h1>
            <p className="text-xs text-slate-400">{os.numero_os}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Client Info */}
        <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
          <CardContent className="p-4 space-y-4">
            {/* Cliente */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                <User className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Cliente</p>
                <h2 className="font-semibold text-lg text-white">{clientName || "Não informado"}</h2>
              </div>
            </div>

            {/* Telefone e Aniversário */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Telefone</p>
                  {clientPhone ? (
                    <a
                      href={`https://wa.me/55${clientPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-500 hover:underline"
                    >
                      {clientPhone}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">Não informado</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Aniversário</p>
                  <p className="text-sm font-medium text-white">
                    {clientBirthday || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-600/20 flex items-center justify-center">
                <Car className="w-7 h-7 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-white">{os.vehicle}</h2>
                <p className="text-sm text-slate-400 font-mono">{os.plate}</p>
              </div>
              {os.data_entrada && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Entrada</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(os.data_entrada)}
                  </p>
                </div>
              )}
            </div>
            {os.diagnostico && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Diagnóstico:</strong> {os.diagnostico}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legenda de Criticidade */}
        <Card className="bg-slate-800/30 border-dashed border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Entenda as cores:</h3>
            <div className="grid grid-cols-3 gap-2 text-xs text-white">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Urgente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Atenção</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Preventivo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itens Urgentes */}
        {itensUrgentes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-500">Itens Urgentes</h3>
              <Badge variant="destructive" className="ml-auto">{itensUrgentes.length}</Badge>
            </div>
            {itensUrgentes.map(renderItemCard)}
          </div>
        )}

        {/* Itens Atenção */}
        {itensAtencao.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-500">Requer Atenção</h3>
              <Badge className="ml-auto bg-yellow-500">{itensAtencao.length}</Badge>
            </div>
            {itensAtencao.map(renderItemCard)}
          </div>
        )}

        {/* Itens Preventivos */}
        {itensPreventivos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-500">Preventivos / Opcionais</h3>
              <Badge className="ml-auto bg-green-500">{itensPreventivos.length}</Badge>
            </div>
            {itensPreventivos.map(renderItemCard)}
          </div>
        )}
      </main>

      {/* Fixed Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur border-t border-slate-800 p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Detalhamento por tipo */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <span className="text-slate-400">Peças:</span>
              <span className="font-semibold text-white">{formatCurrency(totalPecas)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <span className="text-slate-400">Serviços:</span>
              <span className="font-semibold text-white">{formatCurrency(totalServicos)}</span>
            </div>
          </div>

          {/* Total Geral */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-700">
            <div>
              <p className="text-sm text-slate-400">Total do Orçamento</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalOrcado)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Aprovado</p>
              <p className="text-xl font-semibold text-green-500">{formatCurrency(totalAprovado)}</p>
            </div>
          </div>

          {itensPendentes.length > 0 && (
            <p className="text-xs text-center text-slate-400">
              {itensPendentes.length} {itensPendentes.length === 1 ? 'item aguardando' : 'itens aguardando'} aprovação
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
