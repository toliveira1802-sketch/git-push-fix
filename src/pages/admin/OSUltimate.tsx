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
      <main className="container pb-36 space-y-4">
        
        {/* ============================================ */}
        {/* DADOS CLIENTE, CARRO E KM + NÍVEL */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lovable"
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 border ${getNivelColor(dados.cliente.nivel)}`}>
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
                    <p className="font-medium">{dados.veiculo.ano} - {dados.veiculo.cor}</p>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-lovable"
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-lovable"
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
        {/* CHECKLIST - 4 TIPOS */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-lovable"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("checklist")}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Checklist</h2>
            </div>
            {expandedSections.checklist ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
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
                <div className="flex gap-1 mt-4 bg-secondary/50 p-1 rounded-lg">
                  {(["obrigatorio", "seguranca", "conforto", "documentacao"] as TipoChecklist[]).map((tipo) => {
                    const Icon = getChecklistIcon(tipo);
                    const labels = { obrigatorio: "Obrigatório", seguranca: "Segurança", conforto: "Conforto", documentacao: "Docs" };
                    return (
                      <button
                        key={tipo}
                        onClick={(e) => { e.stopPropagation(); setChecklistTab(tipo); }}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                          checklistTab === tipo ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {labels[tipo]}
                      </button>
                    );
                  })}
                </div>

                {/* Itens do checklist */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {dados.checklist
                    .filter((item) => item.tipo === checklistTab)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          item.verificado
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-red-500/30 bg-red-500/5"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          item.verificado ? "border-green-500 bg-green-500" : "border-red-500"
                        }`}>
                          {item.verificado && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm">{item.nome}</span>
                      </div>
                    ))}
                </div>

                {checklistTab === "obrigatorio" && (
                  <p className="text-xs text-red-400 mt-3 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Itens obrigatórios devem ser verificados antes do orçamento
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ============================================ */}
        {/* FOTOS E VÍDEOS - LINK GOOGLE DRIVE */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-lovable"
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
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    Link do Google Drive (Fotos/Vídeos)
                  </p>
                  {dados.fotosVideosLink ? (
                    <a
                      href={dados.fotosVideosLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-3 rounded-lg text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <span className="truncate">{dados.fotosVideosLink}</span>
                    </a>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">Adicione o link do Google Drive</p>
                      <p className="text-xs text-muted-foreground mt-1">As fotos ficam no Drive para não pesar a página</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ============================================ */}
        {/* DIAGNÓSTICO - ASSISTIDO POR IA */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="section-purple"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("diagnostico")}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-purple-300">Diagnóstico IA</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg">
                <Sparkles className="w-4 h-4" />
                Analisar
              </button>
              {expandedSections.diagnostico ? (
                <ChevronUp className="w-5 h-5 text-purple-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-purple-400" />
              )}
            </div>
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
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-purple-100">{dados.diagnosticoIA}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
                      <p className="text-sm text-purple-300/70">
                        Clique em "Analisar" para receber diagnóstico baseado no checklist
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-purple-400/60 mt-3">
                    IA calcula preços, sugere lembretes e vincula estoque (V2)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ============================================ */}
        {/* ORÇAMENTO SEMÁFORO - PREMIUM/STANDARD/ECO */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-lovable"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("itens")}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Itens do Orçamento</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Item
              </button>
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
                {/* Filtro por Tier */}
                <div className="flex gap-2 mt-4 mb-4">
                  <span className="text-sm text-muted-foreground self-center">Tier:</span>
                  {(["todos", "premium", "standard", "eco"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={(e) => { e.stopPropagation(); setTierFiltro(tier); }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        tierFiltro === tier
                          ? tier === "todos" 
                            ? "bg-primary text-white"
                            : getTierInfo(tier as TierOrcamento).color
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tier === "todos" ? "Todos" : getTierInfo(tier as TierOrcamento).label}
                    </button>
                  ))}
                </div>

                {/* Tier atual do mês */}
                <div className="bg-secondary/50 rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tier do mês:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierInfo(dados.tierAtual).color}`}>
                    {getTierInfo(dados.tierAtual).label}
                  </span>
                </div>

                {/* Lista de itens */}
                <div className="space-y-3">
                  {itensFiltrados.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">Nenhum item neste tier</p>
                    </div>
                  ) : (
                    itensFiltrados.map((item) => {
                      const prioInfo = getPrioridadeInfo(item.prioridade);
                      const PrioIcon = prioInfo.icon;
                      const tierInfo = getTierInfo(item.tier);

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border ${
                            item.status === "aprovado"
                              ? "border-green-500/30 bg-green-500/5"
                              : item.status === "recusado"
                              ? "border-red-500/30 bg-red-500/5"
                              : "border-yellow-500/30 bg-yellow-500/5"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${prioInfo.bg} ${prioInfo.color}`}>
                                <PrioIcon className="w-3 h-3" />
                                {prioInfo.label}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded border ${tierInfo.color}`}>
                                {tierInfo.label}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.tipo === "peca" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                              }`}>
                                {item.tipo === "peca" ? "Peça" : "M.O."}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {item.status === "aprovado" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                              {item.status === "recusado" && <XCircle className="w-5 h-5 text-red-500" />}
                              {item.status === "pendente" && <Clock className="w-5 h-5 text-yellow-500" />}
                            </div>
                          </div>

                          <h3 className="font-medium mb-1">{item.nome}</h3>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantidade}x {formatCurrency(item.valorUnitario)}
                            </span>
                            <span className="font-semibold">{formatCurrency(item.valorTotal)}</span>
                          </div>

                          {item.motivoRecusa && (
                            <div className="mt-2 p-2 bg-red-500/10 rounded">
                              <p className="text-sm text-red-400">Motivo: {item.motivoRecusa}</p>
                              {item.dataLembrete && (
                                <p className="text-xs text-red-300 mt-1 flex items-center gap-1">
                                  <Bell className="w-3 h-3" />
                                  Lembrete: {item.dataLembrete}
                                </p>
                              )}
                            </div>
                          )}

                          {item.status === "pendente" && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => aprovarItem(item.id)}
                                className="flex-1 btn-success text-sm py-2"
                              >
                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                Aprovar
                              </button>
                              <button
                                onClick={() => setModalRecusa(item.id)}
                                className="flex-1 btn-destructive text-sm py-2"
                              >
                                <XCircle className="w-4 h-4 inline mr-1" />
                                Recusar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Sugestão ECO */}
                {totais.pendente > 0 && tierFiltro !== "eco" && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Não aprovou? Veja opções <strong>ECO</strong> mais em conta!
                    </p>
                    <button
                      onClick={() => setTierFiltro("eco")}
                      className="mt-2 text-sm text-green-400 underline"
                    >
                      Ver opções ECO →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ============================================ */}
        {/* RESUMO APROVAÇÃO + VALORES */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card-lovable"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Resumo de Valores</h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orçado:</span>
              <span className="font-medium">{formatCurrency(totais.orcado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-approved">Aprovado:</span>
              <span className="text-approved font-medium">{formatCurrency(totais.aprovado)}</span>
            </div>
            {totais.pendente > 0 && (
              <div className="flex justify-between">
                <span className="text-pending">Pendente:</span>
                <span className="text-pending font-medium">{formatCurrency(totais.pendente)}</span>
              </div>
            )}
            {totais.recusado > 0 && (
              <div className="flex justify-between">
                <span className="text-rejected">Recusado:</span>
                <span className="text-rejected font-medium">{formatCurrency(totais.recusado)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Final:</span>
                <span className="font-bold text-xl">{formatCurrency(totais.aprovado)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* IMPRESSÃO E ENVIOS */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-lovable"
        >
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Enviar Orçamento</h2>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span>Enviar por WhatsApp</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <Send className="w-5 h-5 text-blue-500" />
              <span>Enviar pelo Sistema</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <Download className="w-5 h-5 text-red-500" />
              <span>Baixar PDF</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <Printer className="w-5 h-5 text-gray-400" />
              <span>Imprimir</span>
            </button>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* FEEDBACK DO CONSULTOR */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card-lovable"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("feedback")}
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Feedback do Consultor</h2>
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
                    <p className="text-sm text-muted-foreground mb-2">Avaliação do Lead (1-5)</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`p-1 rounded ${
                            (dados.feedback?.avaliacaoCliente || 0) >= star
                              ? "text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Relato */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Relato do Consultor</p>
                    <textarea
                      placeholder="Descreva o atendimento, objeções do cliente, motivos de não fechamento..."
                      className="input-lovable w-full h-24 resize-none"
                    />
                  </div>

                  {/* Motivo não fechamento */}
                  {totais.recusado > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Por que não fechou?</p>
                      <textarea
                        placeholder="Explique os motivos dos itens recusados..."
                        className="input-lovable w-full h-20 resize-none"
                      />
                    </div>
                  )}

                  <button className="w-full btn-primary">
                    Salvar Feedback
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </main>

      {/* Footer fixo */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Aprovado</p>
              <p className="text-2xl font-bold text-approved">{formatCurrency(totais.aprovado)}</p>
            </div>
            {totais.pendente > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-lg font-semibold text-pending">{formatCurrency(totais.pendente)}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {totais.pendente > 0 && (
              <button
                onClick={aprovarTodosPendentes}
                className="flex-1 btn-success py-3 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Aprovar Todos ({itensFiltrados.filter((i) => i.status === "pendente").length})
              </button>
            )}
            <button className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Falar com Oficina
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Recusa com Lembrete */}
      <AnimatePresence>
        {modalRecusa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setModalRecusa(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Recusar Item</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Motivo da Recusa</label>
                  <textarea
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    placeholder="Informe o motivo da recusa..."
                    className="input-lovable w-full h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                    <Bell className="w-4 h-4" />
                    Criar lembrete para contato futuro
                  </label>
                  <input
                    type="date"
                    value={dataLembrete}
                    onChange={(e) => setDataLembrete(e.target.value)}
                    className="input-lovable w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O comercial será notificado para recontatar o cliente
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setModalRecusa(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => recusarItem(modalRecusa)}
                  className="flex-1 btn-destructive"
                >
                  Confirmar Recusa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
