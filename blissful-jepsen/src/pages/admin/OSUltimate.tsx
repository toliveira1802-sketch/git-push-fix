/*
 * Página de Orçamento - Visão Completa (Oficina + Cliente)
 * Estrutura completa conforme especificação
 */

import { useState } from "react";
import {
  Car,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileText,
  Wrench,
  DollarSign,
  Shield,
  Sparkles,
  ArrowLeft,
  Link as LinkIcon,
  Settings,
  Camera,
  Bell,
  Star,
  Send,
  Printer,
  Download,
  Eye,
  Gauge,
  Droplets,
  Disc,
  Thermometer,
  Battery,
  Wind,
  Lightbulb,
  CircleDot,
  ExternalLink,
  Plus,
  Zap,
  TrendingUp,
  AlertTriangle,
  Crown,
  Gem,
  Award,
  Medal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// TIPOS
// ============================================

type NivelCliente = "bronze" | "prata" | "ouro" | "diamante";
type EtapaProcesso = "recepcao" | "diagnostico" | "orcamento" | "aprovacao" | "execucao" | "qualidade" | "entrega";
type TierOrcamento = "premium" | "standard" | "eco";
type StatusItem = "aprovado" | "pendente" | "recusado";
type PrioridadeItem = "urgente" | "atencao" | "preventivo";
type TipoChecklist = "obrigatorio" | "seguranca" | "conforto" | "documentacao";

interface ChecklistItem {
  id: string;
  nome: string;
  tipo: TipoChecklist;
  verificado: boolean;
  observacao?: string;
}

interface ItemOrcamento {
  id: string;
  nome: string;
  tipo: "peca" | "mao_de_obra";
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  status: StatusItem;
  prioridade: PrioridadeItem;
  tier: TierOrcamento;
  motivoRecusa?: string;
  dataLembrete?: string;
}

interface Feedback {
  avaliacaoCliente: number; // 1-5 estrelas
  relatoConsultor: string;
  motivoNaoFechamento?: string;
}

interface DadosOrcamento {
  osNumber: string;
  etapaProcesso: EtapaProcesso;
  datas: {
    entrada: string;
    orcamento?: string;
    aprovacao?: string;
    execucao?: string;
    entrega?: string;
  };
  cliente: {
    nome: string;
    telefone: string;
    email?: string;
    nivel: NivelCliente;
  };
  veiculo: {
    modelo: string;
    placa: string;
    kmAtual: number | null;
    ano?: number;
    cor?: string;
  };
  descricaoProblema: string;
  checklist: ChecklistItem[];
  fotosVideosLink?: string;
  diagnosticoIA?: string;
  itens: ItemOrcamento[];
  tierAtual: TierOrcamento; // Define se estamos em Premium, Standard ou Eco
  observacoes: string;
  feedback?: Feedback;
}

// ============================================
// DADOS DE EXEMPLO
// ============================================

const dadosExemplo: DadosOrcamento = {
  osNumber: "OS-20260119-223346",
  etapaProcesso: "orcamento",
  datas: {
    entrada: "19/01/2026 22:33",
    orcamento: "20/01/2026 10:15",
  },
  cliente: {
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    nivel: "prata",
  },
  veiculo: {
    modelo: "Honda Civic 2022",
    placa: "ABC-1234",
    kmAtual: 45000,
    ano: 2022,
    cor: "Preto",
  },
  descricaoProblema: "Barulho ao frear e luz do ABS acesa. Cliente relata que o problema começou há 2 semanas.",
  checklist: [
    { id: "1", nome: "Nível de Óleo", tipo: "obrigatorio", verificado: true },
    { id: "2", nome: "Nível de Água", tipo: "obrigatorio", verificado: true },
    { id: "3", nome: "Freios", tipo: "obrigatorio", verificado: false, observacao: "Desgaste acentuado" },
    { id: "4", nome: "KM Atual Registrado", tipo: "obrigatorio", verificado: true },
    { id: "5", nome: "Pneus", tipo: "seguranca", verificado: true },
    { id: "6", nome: "Luzes", tipo: "seguranca", verificado: true },
    { id: "7", nome: "Bateria", tipo: "seguranca", verificado: false, observacao: "Verificar carga" },
    { id: "8", nome: "Suspensão", tipo: "seguranca", verificado: true },
    { id: "9", nome: "Ar Condicionado", tipo: "conforto", verificado: true },
    { id: "10", nome: "Vidros", tipo: "conforto", verificado: true },
    { id: "11", nome: "Limpadores", tipo: "conforto", verificado: true },
    { id: "12", nome: "Correia", tipo: "seguranca", verificado: true },
  ],
  fotosVideosLink: "https://drive.google.com/drive/folders/exemplo",
  diagnosticoIA: "Baseado no checklist e descrição, identificamos: 1) Sistema de freios com desgaste crítico - requer troca imediata de pastilhas e possível troca de discos. 2) Luz ABS acesa indica possível problema no sensor ABS. Recomendamos diagnóstico eletrônico completo.",
  itens: [
    {
      id: "1",
      nome: "Pastilha de Freio Dianteira Original",
      tipo: "peca",
      quantidade: 1,
      valorUnitario: 380,
      valorTotal: 380,
      status: "pendente",
      prioridade: "urgente",
      tier: "premium",
    },
    {
      id: "2",
      nome: "Pastilha de Freio Dianteira Paralela",
      tipo: "peca",
      quantidade: 1,
      valorUnitario: 180,
      valorTotal: 180,
      status: "pendente",
      prioridade: "urgente",
      tier: "eco",
    },
    {
      id: "3",
      nome: "Disco de Freio Dianteiro",
      tipo: "peca",
      quantidade: 2,
      valorUnitario: 350,
      valorTotal: 700,
      status: "pendente",
      prioridade: "urgente",
      tier: "standard",
    },
    {
      id: "4",
      nome: "Serviço de Troca de Freios",
      tipo: "mao_de_obra",
      quantidade: 1,
      valorUnitario: 200,
      valorTotal: 200,
      status: "pendente",
      prioridade: "urgente",
      tier: "standard",
    },
    {
      id: "5",
      nome: "Sensor ABS",
      tipo: "peca",
      quantidade: 1,
      valorUnitario: 450,
      valorTotal: 450,
      status: "pendente",
      prioridade: "atencao",
      tier: "standard",
    },
    {
      id: "6",
      nome: "Diagnóstico Eletrônico",
      tipo: "mao_de_obra",
      quantidade: 1,
      valorUnitario: 150,
      valorTotal: 150,
      status: "aprovado",
      prioridade: "preventivo",
      tier: "standard",
    },
    {
      id: "7",
      nome: "Fluido de Freio DOT4",
      tipo: "peca",
      quantidade: 1,
      valorUnitario: 80,
      valorTotal: 80,
      status: "recusado",
      prioridade: "preventivo",
      tier: "standard",
      motivoRecusa: "Cliente já tem em casa",
      dataLembrete: "2026-02-19",
    },
  ],
  tierAtual: "standard",
  observacoes: "",
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function OSUltimate() {
  const [dados, setDados] = useState<DadosOrcamento>(dadosExemplo);
  const [expandedSections, setExpandedSections] = useState({
    cliente: true,
    datas: true,
    checklist: true,
    fotos: false,
    diagnostico: true,
    itens: true,
    valores: true,
    feedback: false,
  });
  const [modalRecusa, setModalRecusa] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [dataLembrete, setDataLembrete] = useState("");
  const [checklistTab, setChecklistTab] = useState<TipoChecklist>("obrigatorio");
  const [tierFiltro, setTierFiltro] = useState<TierOrcamento | "todos">("todos");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const aprovarItem = (id: string) => {
    setDados((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.id === id ? { ...item, status: "aprovado" as const } : item
      ),
    }));
  };

  const recusarItem = (id: string) => {
    setDados((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.id === id
          ? { ...item, status: "recusado" as const, motivoRecusa, dataLembrete }
          : item
      ),
    }));
    setModalRecusa(null);
    setMotivoRecusa("");
    setDataLembrete("");
  };

  const aprovarTodosPendentes = () => {
    setDados((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.status === "pendente" ? { ...item, status: "aprovado" as const } : item
      ),
    }));
  };

  // Filtrar itens por tier
  const itensFiltrados = tierFiltro === "todos" 
    ? dados.itens 
    : dados.itens.filter(i => i.tier === tierFiltro);

  // Cálculos
  const calcularTotais = (itens: ItemOrcamento[]) => ({
    orcado: itens.reduce((acc, item) => acc + item.valorTotal, 0),
    aprovado: itens
      .filter((i) => i.status === "aprovado")
      .reduce((acc, item) => acc + item.valorTotal, 0),
    pendente: itens
      .filter((i) => i.status === "pendente")
      .reduce((acc, item) => acc + item.valorTotal, 0),
    recusado: itens
      .filter((i) => i.status === "recusado")
      .reduce((acc, item) => acc + item.valorTotal, 0),
  });

  const totais = calcularTotais(itensFiltrados);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // ============================================
  // HELPERS DE RENDERIZAÇÃO
  // ============================================

  const getNivelIcon = (nivel: NivelCliente) => {
    switch (nivel) {
      case "diamante": return <Gem className="w-4 h-4" />;
      case "ouro": return <Crown className="w-4 h-4" />;
      case "prata": return <Award className="w-4 h-4" />;
      default: return <Medal className="w-4 h-4" />;
    }
  };

  const getNivelColor = (nivel: NivelCliente) => {
    switch (nivel) {
      case "diamante": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "ouro": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "prata": return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      default: return "bg-orange-600/20 text-orange-400 border-orange-500/30";
    }
  };

  const getEtapaInfo = (etapa: EtapaProcesso) => {
    const etapas = {
      recepcao: { label: "Recepção", color: "bg-blue-500", icon: Car },
      diagnostico: { label: "Diagnóstico", color: "bg-purple-500", icon: Wrench },
      orcamento: { label: "Orçamento", color: "bg-orange-500", icon: DollarSign },
      aprovacao: { label: "Aprovação", color: "bg-yellow-500", icon: CheckCircle2 },
      execucao: { label: "Execução", color: "bg-indigo-500", icon: Settings },
      qualidade: { label: "Qualidade", color: "bg-pink-500", icon: Eye },
      entrega: { label: "Entrega", color: "bg-green-500", icon: Send },
    };
    return etapas[etapa];
  };

  const getPrioridadeInfo = (prioridade: PrioridadeItem) => {
    switch (prioridade) {
      case "urgente": return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/20", label: "Urgente" };
      case "atencao": return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Atenção" };
      default: return { icon: Shield, color: "text-green-500", bg: "bg-green-500/20", label: "Preventivo" };
    }
  };

  const getTierInfo = (tier: TierOrcamento) => {
    switch (tier) {
      case "premium": return { label: "Premium", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      case "eco": return { label: "Eco", color: "bg-green-500/20 text-green-400 border-green-500/30" };
      default: return { label: "Standard", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    }
  };

  const getChecklistIcon = (tipo: TipoChecklist) => {
    switch (tipo) {
      case "obrigatorio": return CheckCircle2;
      case "seguranca": return Shield;
      case "conforto": return Wind;
      default: return FileText;
    }
  };

  const etapaAtual = getEtapaInfo(dados.etapaProcesso);
  const EtapaIcon = etapaAtual.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {dados.osNumber}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Entrada: {dados.datas.entrada}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${etapaAtual.color} text-white`}>
                <EtapaIcon className="w-3.5 h-3.5" />
                {etapaAtual.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban - Etapas do Processo */}
      <div className="container py-3 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {(["recepcao", "diagnostico", "orcamento", "aprovacao", "execucao", "qualidade", "entrega"] as EtapaProcesso[]).map((etapa, index) => {
            const info = getEtapaInfo(etapa);
            const Icon = info.icon;
            const isAtual = etapa === dados.etapaProcesso;
            const isPast = index < ["recepcao", "diagnostico", "orcamento", "aprovacao", "execucao", "qualidade", "entrega"].indexOf(dados.etapaProcesso);
            
            return (
              <div
                key={etapa}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isAtual 
                    ? `${info.color} text-white` 
                    : isPast 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {info.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="container py-2">
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <LinkIcon className="w-4 h-4" />
            Link Cliente
          </button>
          <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <LinkIcon className="w-4 h-4" />
            Link Admin
          </button>
          <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Editar
          </button>
          <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

    {/* Conteúdo principal */}
<div className="container pb-36 lg:pb-6">
  {/* Desktop: grid center + right sticky | Mobile: 1 coluna */}
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
    
    {/* ========================= */}
    {/* CENTER SCROLL (COLUNA DO MEIO) */}
    {/* ========================= */}
    <main className="min-w-0 space-y-4">
      {/* ============================================ */}
      {/* DADOS CLIENTE, CARRO E KM + NÍVEL */}
      {/* ============================================ */}
      <motion.div
        id="cliente"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("cliente")}
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Cliente e Veículo</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 border ${getNivelColor(
                dados.cliente.nivel
              )}`}
            >
              {getNivelIcon(dados.cliente.nivel)}
              {dados.cliente.nivel.charAt(0).toUpperCase() + dados.cliente.nivel.slice(1)}
            </span>
            {expandedSections.cliente ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expandedSections.cliente && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{dados.cliente.nome || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{dados.cliente.telefone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Veículo</p>
                  <p className="font-medium">{dados.veiculo.modelo || "A identificar"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placa</p>
                  <p className="font-medium">{dados.veiculo.placa || "PENDENTE"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KM Atual</p>
                  {dados.veiculo.kmAtual ? (
                    <p className="font-medium">{dados.veiculo.kmAtual.toLocaleString()} km</p>
                  ) : (
                    <p className="text-yellow-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Não informado
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ano/Cor</p>
                  <p className="font-medium">
                    {dados.veiculo.ano} - {dados.veiculo.cor}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* DESCRIÇÃO DO PROBLEMA INICIAL */}
      {/* ============================================ */}
      <motion.div
        id="problema"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-lovable scroll-mt-24"
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Descrição do Problema</h2>
        </div>
        <p className="text-muted-foreground">
          {dados.descricaoProblema || "Nenhuma descrição informada"}
        </p>
      </motion.div>

      {/* ============================================ */}
      {/* RESUMO DE DATAS */}
      {/* ============================================ */}
      <motion.div
        id="datas"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("datas")}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Resumo de Datas</h2>
          </div>
          {expandedSections.datas ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <AnimatePresence>
          {expandedSections.datas && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Entrada", value: dados.datas.entrada, color: "text-blue-400" },
                  { label: "Orçamento", value: dados.datas.orcamento, color: "text-orange-400" },
                  { label: "Aprovação", value: dados.datas.aprovacao, color: "text-yellow-400" },
                  { label: "Execução", value: dados.datas.execucao, color: "text-indigo-400" },
                  { label: "Entrega", value: dados.datas.entrega, color: "text-green-400" },
                ].map((data) => (
                  <div key={data.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{data.label}</p>
                    <p className={`text-sm font-medium ${data.value ? data.color : "text-muted-foreground"}`}>
                      {data.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* CHECKLIST */}
      {/* ============================================ */}
      <motion.div
        id="checklist"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("checklist")}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Checklist de Entrada</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {dados.checklist.filter((c) => c.verificado).length}/{dados.checklist.length}
            </span>
            {expandedSections.checklist ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expandedSections.checklist && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Tabs de tipo */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {(["obrigatorio", "seguranca", "conforto", "documentacao"] as TipoChecklist[]).map((tipo) => {
                  const Icon = getChecklistIcon(tipo);
                  const count = dados.checklist.filter((c) => c.tipo === tipo).length;
                  return (
                    <button
                      key={tipo}
                      onClick={() => setChecklistTab(tipo)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                        checklistTab === tipo
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Lista de itens */}
              <div className="mt-4 space-y-2">
                {dados.checklist
                  .filter((item) => item.tipo === checklistTab)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.verificado
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-yellow-500/10 border-yellow-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.verificado ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{item.nome}</p>
                          {item.observacao && (
                            <p className="text-sm text-muted-foreground">{item.observacao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* FOTOS E VÍDEOS */}
      {/* ============================================ */}
      <motion.div
        id="midia"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("fotos")}
        >
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Fotos e Vídeos</h2>
          </div>
          {expandedSections.fotos ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <AnimatePresence>
          {expandedSections.fotos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                {dados.fotosVideosLink ? (
                  <a
                    href={dados.fotosVideosLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir pasta de mídias
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Camera className="w-12 h-12 mb-2 opacity-50" />
                    <p>Nenhuma mídia anexada</p>
                    <button className="mt-3 btn-secondary text-sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar link
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* DIAGNÓSTICO IA */}
      {/* ============================================ */}
      <motion.div
        id="ia"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="scroll-mt-24 rounded-xl border bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-4"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("diagnostico")}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-purple-300">Diagnóstico IA</h2>
          </div>
          {expandedSections.diagnostico ? (
            <ChevronUp className="w-5 h-5 text-purple-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-400" />
          )}
        </div>

        <AnimatePresence>
          {expandedSections.diagnostico && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                {dados.diagnosticoIA ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{dados.diagnosticoIA}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Zap className="w-10 h-10 mb-2 text-purple-400 opacity-50" />
                    <p>Diagnóstico não gerado ainda</p>
                    <button className="mt-3 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Gerar Diagnóstico
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* ITENS DO ORÇAMENTO */}
      {/* ============================================ */}
      <motion.div
        id="itens"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("itens")}
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Itens do Orçamento</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {itensFiltrados.length} itens
            </span>
            {expandedSections.itens ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expandedSections.itens && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Filtro de Tier */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {(["todos", "premium", "standard", "eco"] as (TierOrcamento | "todos")[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFiltro(tier)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      tierFiltro === tier
                        ? tier === "premium"
                          ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                          : tier === "eco"
                          ? "bg-green-500/30 text-green-300 border border-green-500/50"
                          : tier === "standard"
                          ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                          : "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tier === "todos" ? "Todos" : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>

              {/* Lista de itens */}
              <div className="mt-4 space-y-3">
                {itensFiltrados.map((item) => {
                  const prioInfo = getPrioridadeInfo(item.prioridade);
                  const tierInfo = getTierInfo(item.tier);
                  const PrioIcon = prioInfo.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        item.status === "aprovado"
                          ? "bg-green-500/5 border-green-500/20"
                          : item.status === "recusado"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${prioInfo.bg} ${prioInfo.color}`}>
                              <PrioIcon className="w-3 h-3 inline mr-1" />
                              {prioInfo.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${tierInfo.color}`}>
                              {tierInfo.label}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.tipo === "peca" ? "Peça" : "Mão de Obra"}
                            </span>
                          </div>
                          <p className="font-medium mt-2">{item.nome}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Qtd: {item.quantidade}</span>
                            <span>Unit: {formatCurrency(item.valorUnitario)}</span>
                          </div>
                          {item.motivoRecusa && (
                            <p className="mt-2 text-sm text-red-400">
                              Motivo: {item.motivoRecusa}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(item.valorTotal)}</p>
                          
                          {item.status === "pendente" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => aprovarItem(item.id)}
                                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setModalRecusa(item.id)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}

                          {item.status === "aprovado" && (
                            <span className="inline-flex items-center gap-1 mt-2 text-sm text-green-400">
                              <CheckCircle2 className="w-4 h-4" />
                              Aprovado
                            </span>
                          )}

                          {item.status === "recusado" && (
                            <span className="inline-flex items-center gap-1 mt-2 text-sm text-red-400">
                              <XCircle className="w-4 h-4" />
                              Recusado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* RESUMO DE VALORES */}
      {/* ============================================ */}
      <motion.div
        id="valores"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("valores")}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Resumo de Valores</h2>
          </div>
          {expandedSections.valores ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <AnimatePresence>
          {expandedSections.valores && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Total Orçado</span>
                  <span className="font-semibold">{formatCurrency(totais.orcado)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400">Total Aprovado</span>
                  <span className="font-bold text-green-400 text-lg">{formatCurrency(totais.aprovado)}</span>
                </div>

                {totais.pendente > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-yellow-400">Pendente de Aprovação</span>
                    <span className="font-semibold text-yellow-400">{formatCurrency(totais.pendente)}</span>
                  </div>
                )}

                {totais.recusado > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400">Recusado</span>
                    <span className="font-semibold text-red-400">{formatCurrency(totais.recusado)}</span>
                  </div>
                )}

                {/* Observações */}
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground">Observações</label>
                  <textarea
                    value={dados.observacoes}
                    onChange={(e) => setDados((prev) => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Adicione observações para o cliente..."
                    className="mt-2 w-full p-3 rounded-lg bg-secondary/50 border border-border text-foreground resize-none min-h-[100px]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* FEEDBACK */}
      {/* ============================================ */}
      <motion.div
        id="feedback"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="card-lovable scroll-mt-24"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("feedback")}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Feedback</h2>
          </div>
          {expandedSections.feedback ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <AnimatePresence>
          {expandedSections.feedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {/* Avaliação do cliente */}
                <div>
                  <label className="text-sm text-muted-foreground">Avaliação do Cliente</label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setDados((prev) => ({
                            ...prev,
                            feedback: { ...prev.feedback, avaliacaoCliente: star, relatoConsultor: prev.feedback?.relatoConsultor || "" },
                          }))
                        }
                        className={`p-1 transition-colors ${
                          (dados.feedback?.avaliacaoCliente || 0) >= star
                            ? "text-yellow-400"
                            : "text-muted-foreground hover:text-yellow-400/50"
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relato do consultor */}
                <div>
                  <label className="text-sm text-muted-foreground">Relato do Consultor</label>
                  <textarea
                    value={dados.feedback?.relatoConsultor || ""}
                    onChange={(e) =>
                      setDados((prev) => ({
                        ...prev,
                        feedback: { ...prev.feedback, avaliacaoCliente: prev.feedback?.avaliacaoCliente || 0, relatoConsultor: e.target.value },
                      }))
                    }
                    placeholder="Como foi a interação com o cliente?"
                    className="mt-2 w-full p-3 rounded-lg bg-secondary/50 border border-border text-foreground resize-none min-h-[80px]"
                  />
                </div>

                {/* Motivo de não fechamento */}
                <div>
                  <label className="text-sm text-muted-foreground">Motivo de Não Fechamento (se aplicável)</label>
                  <textarea
                    value={dados.feedback?.motivoNaoFechamento || ""}
                    onChange={(e) =>
                      setDados((prev) => ({
                        ...prev,
                        feedback: { ...prev.feedback, avaliacaoCliente: prev.feedback?.avaliacaoCliente || 0, relatoConsultor: prev.feedback?.relatoConsultor || "", motivoNaoFechamento: e.target.value },
                      }))
                    }
                    placeholder="Por que o cliente não fechou?"
                    className="mt-2 w-full p-3 rounded-lg bg-secondary/50 border border-border text-foreground resize-none min-h-[60px]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>

   {/* ========================= */}
{/* RIGHT STICKY (desktop) */}
{/* ========================= */}
<aside className="hidden lg:block">
  <div className="sticky top-[88px] space-y-4">
    {/* Totais */}
    <div className="card-lovable">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Total aprovado</p>
          <p className="text-2xl font-bold text-approved">
            {formatCurrency(totais.aprovado)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Orçado</p>
          <p className="text-sm font-semibold">
            {formatCurrency(totais.orcado)}
          </p>
        </div>
      </div>

      {totais.pendente > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-lg border bg-secondary/30 px-3 py-2">
          <span className="text-sm text-muted-foreground">Pendente</span>
          <span className="text-sm font-semibold text-pending">
            {formatCurrency(totais.pendente)}
          </span>
        </div>
      )}

      {totais.recusado > 0 && (
        <div className="mt-2 flex items-center justify-between rounded-lg border bg-secondary/20 px-3 py-2">
          <span className="text-sm text-muted-foreground">Recusado</span>
          <span className="text-sm font-semibold text-rejected">
            {formatCurrency(totais.recusado)}
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {totais.pendente > 0 ? (
          <button
            onClick={aprovarTodosPendentes}
            className="btn-success py-3"
          >
            Aprovar pendentes
          </button>
        ) : (
          <button className="btn-secondary py-3" disabled>
            Tudo aprovado
          </button>
        )}

        <button
          className="btn-primary py-3"
          onClick={() => {
            // V1: só scrolla pro bloco de envio (se você tiver) ou pro "valores"
            const el = document.querySelector("#valores");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Enviar orçamento
        </button>
      </div>

      {/* Atalho ECO */}
      {totais.pendente > 0 && (
        <div className="mt-3 rounded-lg border bg-green-500/10 p-3">
          <p className="text-sm text-green-400">
            Cliente travou? Mostra opção <strong>ECO</strong> pra destravar.
          </p>
          <button
            className="mt-2 text-sm underline text-green-400"
            onClick={() => setTierFiltro("eco")}
          >
            Filtrar ECO →
          </button>
        </div>
      )}
    </div>

    {/* Ações rápidas */}
    <div className="card-lovable">
      <p className="text-sm font-medium mb-2">Ações</p>
      <div className="space-y-2">
        <button className="w-full btn-secondary py-2">Enviar WhatsApp</button>
        <button className="w-full btn-secondary py-2">Enviar Sistema</button>
        <button className="w-full btn-secondary py-2">Baixar PDF</button>
      </div>
    </div>

    {/* Âncoras */}
    <div className="card-lovable">
      <p className="text-sm font-medium mb-2">Âncoras</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ["Cliente", "#cliente"],
          ["Problema", "#problema"],
          ["Datas", "#datas"],
          ["Checklist", "#checklist"],
          ["Mídia", "#midia"],
          ["IA", "#ia"],
          ["Itens", "#itens"],
          ["Valores", "#valores"],
          ["Feedback", "#feedback"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-lg border bg-secondary/40 px-3 py-2 hover:bg-secondary transition"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  </div>
</aside>
      </div>
    </div>
    </div>
  );
}


