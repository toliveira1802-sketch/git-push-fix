import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Save, Plus, Trash2, Phone, Car, User,
  Calendar, DollarSign, FileText, Wrench, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, Edit2,
  ChevronDown, ChevronUp, Camera, Check, Send, MessageSquare,
  History, ExternalLink, Copy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DiagnosticoIA } from "@/components/os/DiagnosticoIA";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";

interface OrdemServicoItem {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  prioridade: 'verde' | 'amarelo' | 'vermelho' | null;
  motivo_recusa?: string;
}

interface HistoricoEvento {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
}

interface OrcamentoVersao {
  id: string;
  versao: number;
  nome: string;
  tipo: 'premium' | 'standard' | 'eco';
  data_criacao: string;
  itens: OrdemServicoItem[];
  total: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado';
  observacoes?: string;
}

const tipoVersaoConfig: Record<string, { label: string; color: string; icon: string }> = {
  premium: { label: 'Premium', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: '⭐' },
  standard: { label: 'Standard', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: '🔧' },
  eco: { label: 'Eco', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: '💰' },
};

const prioridadeConfig: Record<string, { label: string; borderColor: string; bgColor: string }> = {
  verde: { label: "Tranquilo", borderColor: "border-emerald-500", bgColor: "bg-emerald-500/5" },
  amarelo: { label: "Médio", borderColor: "border-amber-500", bgColor: "bg-amber-500/5" },
  vermelho: { label: "Imediato", borderColor: "border-red-500", bgColor: "bg-red-500/5" },
};

interface OrdemServico {
  id: string;
  numero_os: string;
  plate: string;
  vehicle: string;
  client_name: string | null;
  client_phone: string | null;
  status: string;
  data_entrada: string | null;
  valor_orcado: number | null;
  valor_aprovado: number | null;
  descricao_problema: string | null;
  diagnostico: string | null;
  observacoes: string | null;
  km_atual: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  diagnostico: { label: "Diagnóstico", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Wrench },
  orcamento: { label: "Orçamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: FileText },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  parcial: { label: "Parcial", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: AlertTriangle },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  em_execucao: { label: "Em Execução", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Wrench },
  concluido: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  entregue: { label: "Entregue", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
};

const itemStatusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

// Mock data for the OS
const mockOS: OrdemServico = {
  id: 'os-1',
  numero_os: 'OS-2024-001',
  plate: 'ABC-1234',
  vehicle: 'Volkswagen Golf GTI 2020',
  client_name: 'João Silva',
  client_phone: '11999887766',
  status: 'orcamento',
  data_entrada: '2024-01-20T10:00:00Z',
  valor_orcado: 2500,
  valor_aprovado: 0,
  descricao_problema: 'Veículo apresentando barulho ao frear e vibração no volante.',
  diagnostico: 'Pastilhas de freio desgastadas, discos empenados.',
  observacoes: 'Cliente solicitou orçamento completo.',
  km_atual: '45.000',
};

const mockItens: OrdemServicoItem[] = [
  {
    id: 'item-1',
    descricao: 'Pastilhas de freio dianteiras',
    tipo: 'peca',
    quantidade: 1,
    valor_unitario: 350,
    valor_total: 350,
    status: 'pendente',
    prioridade: 'vermelho',
  },
  {
    id: 'item-2',
    descricao: 'Discos de freio dianteiros',
    tipo: 'peca',
    quantidade: 2,
    valor_unitario: 280,
    valor_total: 560,
    status: 'pendente',
    prioridade: 'vermelho',
  },
  {
    id: 'item-3',
    descricao: 'Mão de obra - Troca de freios',
    tipo: 'mao_de_obra',
    quantidade: 1,
    valor_unitario: 200,
    valor_total: 200,
    status: 'pendente',
    prioridade: 'amarelo',
  },
  {
    id: 'item-4',
    descricao: 'Fluido de freio DOT4',
    tipo: 'peca',
    quantidade: 1,
    valor_unitario: 80,
    valor_total: 80,
    status: 'aprovado',
    prioridade: 'verde',
  },
];

const mockHistorico: HistoricoEvento[] = [
  { id: 'h1', data: '2024-01-20T10:00:00Z', tipo: 'criacao', descricao: 'OS criada' },
  { id: 'h2', data: '2024-01-20T11:30:00Z', tipo: 'diagnostico', descricao: 'Diagnóstico realizado' },
  { id: 'h3', data: '2024-01-20T14:00:00Z', tipo: 'orcamento', descricao: 'Orçamento V1 enviado ao cliente' },
  { id: 'h4', data: '2024-01-21T09:00:00Z', tipo: 'orcamento', descricao: 'Orçamento V2 criado com novos itens' },
];

// Mock versões do orçamento - 3 níveis padrão
const mockVersoes: OrcamentoVersao[] = [
  {
    id: 'v1',
    versao: 1,
    nome: 'Peças Primeira Linha',
    tipo: 'premium',
    data_criacao: '2024-01-20T14:00:00Z',
    itens: [
      { id: 'v1-item-1', descricao: 'Pastilhas de freio Brembo', tipo: 'peca', quantidade: 1, valor_unitario: 580, valor_total: 580, status: 'pendente', prioridade: 'vermelho' },
      { id: 'v1-item-2', descricao: 'Discos de freio Fremax Premium', tipo: 'peca', quantidade: 2, valor_unitario: 420, valor_total: 840, status: 'pendente', prioridade: 'vermelho' },
      { id: 'v1-item-3', descricao: 'Mão de obra especializada', tipo: 'mao_de_obra', quantidade: 1, valor_unitario: 350, valor_total: 350, status: 'pendente', prioridade: 'amarelo' },
      { id: 'v1-item-4', descricao: 'Fluido de freio DOT4 Racing', tipo: 'peca', quantidade: 1, valor_unitario: 120, valor_total: 120, status: 'pendente', prioridade: 'verde' },
    ],
    total: 1890,
    status: 'rascunho',
    observacoes: '⭐ Peças originais e de primeira linha. Maior durabilidade e performance.'
  },
  {
    id: 'v2',
    versao: 2,
    nome: 'Padrão',
    tipo: 'standard',
    data_criacao: '2024-01-20T14:30:00Z',
    itens: [
      { id: 'v2-item-1', descricao: 'Pastilhas de freio Cobreq', tipo: 'peca', quantidade: 1, valor_unitario: 350, valor_total: 350, status: 'pendente', prioridade: 'vermelho' },
      { id: 'v2-item-2', descricao: 'Discos de freio Fremax', tipo: 'peca', quantidade: 2, valor_unitario: 280, valor_total: 560, status: 'pendente', prioridade: 'vermelho' },
      { id: 'v2-item-3', descricao: 'Mão de obra - Troca de freios', tipo: 'mao_de_obra', quantidade: 1, valor_unitario: 200, valor_total: 200, status: 'pendente', prioridade: 'amarelo' },
      { id: 'v2-item-4', descricao: 'Fluido de freio DOT4', tipo: 'peca', quantidade: 1, valor_unitario: 80, valor_total: 80, status: 'pendente', prioridade: 'verde' },
    ],
    total: 1190,
    status: 'enviado',
    observacoes: '🔧 Melhor custo-benefício. Peças de qualidade com garantia.'
  },
  {
    id: 'v3',
    versao: 3,
    nome: 'Até Onde Nossa Qualidade Permite',
    tipo: 'eco',
    data_criacao: '2024-01-20T15:00:00Z',
    itens: [
      { id: 'v3-item-1', descricao: 'Pastilhas de freio Fras-le', tipo: 'peca', quantidade: 1, valor_unitario: 180, valor_total: 180, status: 'pendente', prioridade: 'vermelho' },
      { id: 'v3-item-2', descricao: 'Usinagem dos discos (se possível)', tipo: 'mao_de_obra', quantidade: 2, valor_unitario: 80, valor_total: 160, status: 'pendente', prioridade: 'vermelho' },
      { id: 'v3-item-3', descricao: 'Mão de obra - Troca de freios', tipo: 'mao_de_obra', quantidade: 1, valor_unitario: 150, valor_total: 150, status: 'pendente', prioridade: 'amarelo' },
      { id: 'v3-item-4', descricao: 'Fluido de freio DOT3', tipo: 'peca', quantidade: 1, valor_unitario: 45, valor_total: 45, status: 'pendente', prioridade: 'verde' },
    ],
    total: 535,
    status: 'rascunho',
    observacoes: '💰 Opção econômica mantendo segurança. Peças básicas com garantia reduzida.'
  },
];

const checklistItems = [
  { key: 'nivelOleo', label: 'Nível do Óleo' },
  { key: 'nivelAgua', label: 'Nível da Água' },
  { key: 'freios', label: 'Freios' },
  { key: 'pneus', label: 'Pneus' },
  { key: 'luzes', label: 'Luzes' },
  { key: 'bateria', label: 'Bateria' },
  { key: 'correia', label: 'Correia' },
  { key: 'suspensao', label: 'Suspensão' },
];

export default function AdminOSDetalhes() {
  const { osId } = useParams<{ osId: string }>();
  const [searchParams] = useSearchParams();
  const isNewOS = searchParams.get("new") === "true";
  const navigate = useNavigate();

  const [os, setOS] = useState<OrdemServico>(mockOS);
  const [versoes, setVersoes] = useState<OrcamentoVersao[]>(mockVersoes);
  const [versaoAtual, setVersaoAtual] = useState<number>(2); // Versão atual selecionada
  const [historico, setHistorico] = useState<HistoricoEvento[]>(mockHistorico);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<Partial<OrdemServico>>({});
  const [activeTab, setActiveTab] = useState("orcamento");
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareVersao, setCompareVersao] = useState<number | null>(null);

  // Get current version items
  const versaoSelecionada = versoes.find(v => v.versao === versaoAtual);
  const [itens, setItens] = useState<OrdemServicoItem[]>(versaoSelecionada?.itens || mockItens);

  // Collapsible sections
  const [checklistOpen, setChecklistOpen] = useState(isNewOS);
  const [fotosOpen, setFotosOpen] = useState(isNewOS);

  // Checklist state
  const [checklistEntrada, setChecklistEntrada] = useState<Record<string, boolean>>({});

  // Add item dialog
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showRecusaDialog, setShowRecusaDialog] = useState(false);
  const [recusaItemId, setRecusaItemId] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [newItem, setNewItem] = useState({
    descricao: "",
    tipo: "peca",
    quantidade: 1,
    valor_unitario: 0,
    prioridade: "amarelo" as 'verde' | 'amarelo' | 'vermelho',
  });

  useEffect(() => {
    if (os) {
      setEditedOS(os);
    }
  }, [os]);

  const handleSave = () => {
    setOS({ ...os, ...editedOS });
    setIsEditing(false);
    toast.success("OS atualizada com sucesso!");
  };

  const handleStatusChange = (newStatus: string) => {
    setOS({ ...os, status: newStatus });
    toast.success("Status atualizado!");
  };

  const handleAddItem = () => {
    const valor_total = newItem.valor_unitario * newItem.quantidade;
    const item: OrdemServicoItem = {
      id: 'item-' + Date.now(),
      ...newItem,
      valor_total,
      status: 'pendente',
    };
    setItens([...itens, item]);
    setShowAddItemDialog(false);
    setNewItem({
      descricao: "",
      tipo: "peca",
      quantidade: 1,
      valor_unitario: 0,
      prioridade: "amarelo",
    });
    toast.success("Item adicionado!");
  };

  const handleDeleteItem = (itemId: string) => {
    setItens(itens.filter(i => i.id !== itemId));
    toast.success("Item removido!");
  };

  const handleItemStatusChange = (itemId: string, status: string) => {
    if (status === 'recusado') {
      setRecusaItemId(itemId);
      setShowRecusaDialog(true);
    } else {
      setItens(itens.map(i => i.id === itemId ? { ...i, status, motivo_recusa: undefined } : i));
      toast.success("Item aprovado!");
    }
  };

  const handleConfirmRecusa = () => {
    if (recusaItemId) {
      setItens(itens.map(i => i.id === recusaItemId ? { ...i, status: 'recusado', motivo_recusa: motivoRecusa } : i));
      toast.success("Item recusado!");
    }
    setShowRecusaDialog(false);
    setRecusaItemId(null);
    setMotivoRecusa('');
  };

  // ========== VERSÕES DO ORÇAMENTO ==========
  const handleNovaVersao = (tipo: 'premium' | 'standard' | 'eco' = 'standard') => {
    const novaVersao = versoes.length + 1;
    const nomesPorTipo = {
      premium: 'Peças Primeira Linha',
      standard: 'Padrão',
      eco: 'Até Onde Nossa Qualidade Permite'
    };
    const novaVersaoObj: OrcamentoVersao = {
      id: `v${novaVersao}`,
      versao: novaVersao,
      nome: nomesPorTipo[tipo],
      tipo,
      data_criacao: new Date().toISOString(),
      itens: itens.map(item => ({ ...item, id: `v${novaVersao}-${item.id}` })),
      total: totalOrcado,
      status: 'rascunho',
    };
    setVersoes([...versoes, novaVersaoObj]);
    setVersaoAtual(novaVersao);
    setHistorico([...historico, {
      id: `h${Date.now()}`,
      data: new Date().toISOString(),
      tipo: 'orcamento',
      descricao: `Orçamento V${novaVersao} (${nomesPorTipo[tipo]}) criado`
    }]);
    toast.success(`Versão ${novaVersao} criada!`);
  };

  const handleSelecionarVersao = (versao: number) => {
    const versaoSelecionada = versoes.find(v => v.versao === versao);
    if (versaoSelecionada) {
      setVersaoAtual(versao);
      setItens(versaoSelecionada.itens);
    }
  };

  const getVersaoStatusConfig = (status: string) => {
    switch (status) {
      case 'aprovado':
        return { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case 'recusado':
        return { label: 'Recusado', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
      case 'enviado':
        return { label: 'Enviado', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      default:
        return { label: 'Rascunho', color: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const handleEnviarOrcamento = () => {
    const phone = os.client_phone?.replace(/\D/g, '');
    if (!phone) {
      toast.error("Telefone do cliente não informado");
      return;
    }
    
    // Atualiza status da versão para enviado
    setVersoes(versoes.map(v => 
      v.versao === versaoAtual ? { ...v, status: 'enviado' } : v
    ));
    
    const linkOrcamento = `${window.location.origin}/orcamento/${os.id}?v=${versaoAtual}`;
    const mensagem = `Olá ${os.client_name}! 🚗\n\nSeu orçamento da OS ${os.numero_os} (V${versaoAtual}) está pronto.\n\nVeículo: ${os.vehicle}\nPlaca: ${os.plate}\n\nValor Total: ${formatCurrency(totalOrcado)}\n\nAcesse o link para aprovar ou recusar os itens:\n${linkOrcamento}\n\nDoctor Auto Prime`;
    
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(mensagem)}`, '_blank');
    toast.success("Abrindo WhatsApp...");
  };

  const handleCopyLink = () => {
    const linkOrcamento = `${window.location.origin}/orcamento/${os.id}?v=${versaoAtual}`;
    navigator.clipboard.writeText(linkOrcamento);
    toast.success("Link copiado!");
  };

  const totalOrcado = itens.reduce((acc, item) => acc + item.valor_total, 0);
  const totalAprovado = itens.filter(i => i.status === 'aprovado').reduce((acc, item) => acc + item.valor_total, 0);
  const totalRecusado = itens.filter(i => i.status === 'recusado').reduce((acc, item) => acc + item.valor_total, 0);

  const itensAprovados = itens.filter(i => i.status === 'aprovado');
  const itensPendentes = itens.filter(i => i.status === 'pendente');
  const itensRecusados = itens.filter(i => i.status === 'recusado');

  const currentStatus = statusConfig[os.status] || statusConfig.orcamento;
  const StatusIcon = currentStatus.icon;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/ordens-servico")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold font-mono text-foreground">{os.numero_os}</h1>
                <Badge variant="outline" className={cn("gap-1", currentStatus.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {os.client_name} • {os.plate} • Entrada: {os.data_entrada ? new Date(os.data_entrada).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleEnviarOrcamento}>
              <Send className="w-4 h-4 mr-2" />
              Enviar WhatsApp
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Orçado</p>
              <p className="text-2xl font-bold">{formatCurrency(totalOrcado)}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-sm text-emerald-600">Aprovado</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAprovado)}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">Recusado</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalRecusado)}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <p className="text-sm text-amber-600">Pendente</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalOrcado - totalAprovado - totalRecusado)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orcamento" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Orçamento</span>
              <Badge variant="secondary" className="ml-1">{itens.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Orçamento */}
          <TabsContent value="orcamento" className="space-y-4">
            {/* Versões do Orçamento */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Versões do Orçamento
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleNovaVersao('premium')} className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10">
                      ⭐ Premium
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleNovaVersao('standard')} className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10">
                      🔧 Standard
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleNovaVersao('eco')} className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                      💰 Eco
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {versoes.map((versao) => {
                    const statusVersao = getVersaoStatusConfig(versao.status);
                    const tipoVersao = tipoVersaoConfig[versao.tipo];
                    const isActive = versao.versao === versaoAtual;
                    return (
                      <button
                        key={versao.id}
                        onClick={() => handleSelecionarVersao(versao.versao)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-lg border min-w-[160px] transition-all",
                          isActive 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full flex-wrap">
                          <span className={cn("font-bold", isActive && "text-primary")}>
                            V{versao.versao}
                          </span>
                          <Badge variant="outline" className={cn("text-xs", tipoVersao?.color)}>
                            {tipoVersao?.icon} {tipoVersao?.label}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 text-left">
                          {versao.nome}
                        </span>
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-sm font-medium">
                            {formatCurrency(versao.total)}
                          </span>
                          <Badge variant="outline" className={cn("text-[10px]", statusVersao.color)}>
                            {statusVersao.label}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {versaoSelecionada?.observacoes && (
                  <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                    {versaoSelecionada.observacoes}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-accent shrink-0"
                onClick={() => {}}
              >
                Todos ({itens.length})
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/30 shrink-0"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Aprovados ({itensAprovados.length})
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0"
              >
                <Clock className="w-3 h-3 mr-1" />
                Pendentes ({itensPendentes.length})
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-red-500/10 text-red-600 border-red-500/30 shrink-0"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Recusados ({itensRecusados.length})
              </Badge>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {itens.map((item) => {
                const prioridade = item.prioridade ? prioridadeConfig[item.prioridade] : null;
                const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "border-l-4",
                      prioridade?.borderColor || "border-l-border",
                      item.status === 'recusado' && "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={cn(
                              "font-medium",
                              item.status === 'recusado' && "line-through"
                            )}>
                              {item.descricao}
                            </span>
                            <Badge variant="outline" className={itemStatus.color}>
                              {itemStatus.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.tipo === 'mao_de_obra' ? 'Mão de Obra' : 'Peça'}
                            </Badge>
                            {prioridade && (
                              <Badge variant="outline" className={cn(prioridade.borderColor, "border text-xs")}>
                                {prioridade.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantidade} × {formatCurrency(item.valor_unitario)}
                          </p>
                          {item.motivo_recusa && (
                            <p className="text-sm text-red-600 mt-1">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              Motivo: {item.motivo_recusa}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-bold text-lg",
                            item.status === 'aprovado' && "text-emerald-600",
                            item.status === 'recusado' && "text-red-600 line-through"
                          )}>
                            {formatCurrency(item.valor_total)}
                          </p>
                          <div className="flex gap-1 mt-2 justify-end">
                            {item.status !== 'aprovado' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 p-0"
                                onClick={() => handleItemStatusChange(item.id, 'aprovado')}
                                title="Aprovar"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {item.status !== 'recusado' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                onClick={() => handleItemStatusChange(item.id, 'recusado')}
                                title="Recusar"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                              onClick={() => handleDeleteItem(item.id)}
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddItemDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Detalhes */}
          <TabsContent value="detalhes" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Client & Vehicle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Nome</Label>
                      {isEditing ? (
                        <Input
                          value={editedOS.client_name || ""}
                          onChange={(e) => setEditedOS({ ...editedOS, client_name: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{os.client_name || "-"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Telefone</Label>
                      {isEditing ? (
                        <Input
                          value={editedOS.client_phone || ""}
                          onChange={(e) => setEditedOS({ ...editedOS, client_phone: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{os.client_phone || "-"}</p>
                          {os.client_phone && (
                            <a
                              href={`https://wa.me/55${os.client_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="w-5 h-5" />
                    Veículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Veículo</Label>
                      <p className="font-medium">{os.vehicle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-muted-foreground text-xs">Placa</Label>
                        <p className="font-mono font-bold text-primary">{os.plate}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">KM Atual</Label>
                        {isEditing ? (
                          <Input
                            value={editedOS.km_atual || ""}
                            onChange={(e) => setEditedOS({ ...editedOS, km_atual: e.target.value })}
                          />
                        ) : (
                          <p className="font-medium">{os.km_atual || "-"} km</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Problem & Diagnostic */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Problema e Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Descrição do Problema</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.descricao_problema || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, descricao_problema: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1">{os.descricao_problema || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Diagnóstico</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.diagnostico || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, diagnostico: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1">{os.diagnostico || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Observações</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.observacoes || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, observacoes: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1">{os.observacoes || "-"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dr. Auto - Sugestão de Diagnóstico por IA */}
            <DiagnosticoIA
              descricaoProblema={os.descricao_problema || ""}
              veiculo={os.vehicle}
              kmAtual={os.km_atual}
              onSugestaoClick={(sugestao) => {
                // Adicionar sugestão ao diagnóstico
                const novosDados = {
                  ...editedOS,
                  diagnostico: editedOS.diagnostico 
                    ? `${editedOS.diagnostico}\n• ${sugestao}` 
                    : `• ${sugestao}`
                };
                setEditedOS(novosDados);
                setOS({ ...os, ...novosDados });
                toast.success(`"${sugestao}" adicionado ao diagnóstico`);
              }}
            />

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da OS</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={os.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Checklist */}
          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Checklist de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {checklistItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={item.key}
                        checked={checklistEntrada[item.key] || false}
                        onCheckedChange={(checked) => {
                          setChecklistEntrada({ ...checklistEntrada, [item.key]: !!checked });
                        }}
                      />
                      <Label htmlFor={item.key} className="text-sm cursor-pointer flex-1">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Fotos do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">Nenhuma foto adicionada</p>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Fotos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historico.map((evento, index) => (
                    <div key={evento.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {index < historico.length - 1 && (
                          <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{evento.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(evento.data).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição</Label>
              <Input
                value={newItem.descricao}
                onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                placeholder="Ex: Pastilhas de freio"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={newItem.tipo}
                  onValueChange={(v) => setNewItem({ ...newItem, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peca">Peça</SelectItem>
                    <SelectItem value="mao_de_obra">Mão de Obra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={newItem.prioridade}
                  onValueChange={(v) => setNewItem({ ...newItem, prioridade: v as 'verde' | 'amarelo' | 'vermelho' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verde">🟢 Tranquilo</SelectItem>
                    <SelectItem value="amarelo">🟡 Médio</SelectItem>
                    <SelectItem value="vermelho">🔴 Imediato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div>
                <Label>Valor Unitário</Label>
                <Input
                  type="number"
                  value={newItem.valor_unitario}
                  onChange={(e) => setNewItem({ ...newItem, valor_unitario: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">{formatCurrency(newItem.valor_unitario * newItem.quantidade)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem} disabled={!newItem.descricao || newItem.valor_unitario <= 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recusa Dialog */}
      <Dialog open={showRecusaDialog} onOpenChange={setShowRecusaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Recusar Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Informe o motivo da recusa (opcional):
            </p>
            <Textarea
              value={motivoRecusa}
              onChange={(e) => setMotivoRecusa(e.target.value)}
              placeholder="Ex: Cliente não quis fazer o serviço agora..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecusaDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmRecusa}>
              Confirmar Recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}