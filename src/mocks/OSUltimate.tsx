import { osUltimateMock } from "@/mocks/osUltimate.mock";


export const osUltimateMock = {
  os: {
    meta: {
      version: "v1",
      osId: "OS-20260119-223346",
      createdAt: "2026-01-19T22:33:00-03:00",
      updatedAt: "2026-01-20T10:15:00-03:00",
      lockedAfterApproval: false, // vira true quando “aprovada e travada” (V1)
    },

    status: {
      etapaProcesso: "orcamento", // recepcao | diagnostico | orcamento | aprovacao | execucao | qualidade | entrega
      postApprovalLocked: false, // quando true: oficina não altera itens; só fecha/execução
    },

    cliente: {
      id: "cli_001",
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      email: "joao@email.com",
      nivel: "prata", // bronze | prata | ouro | diamante  (BADGE 2)
      tags: ["retorno", "boa margem"],
    },

    veiculo: {
      id: "veh_001",
      modelo: "Honda Civic 2022",
      placa: "ABC-1234",
      kmAtual: 45000, // BOLINHA 1 (KM)
      ano: 2022,
      cor: "Preto",
      vin: null,
      motor: null,
    },

    entrada: {
      descricaoProblema:
        "Barulho ao frear e luz do ABS acesa. Cliente relata que o problema começou há 2 semanas.",
      canalOrigem: null, // V2: google | indicacao | promocao | organic | etc
      promocaoSelecionadaId: null, // V2/V3
    },

    links: {
      fotosVideos: "https://drive.google.com/drive/folders/exemplo",
      linkClientePublico: null, // V1: pode gerar rota /os/:osId/...
      linkAdmin: "/admin/os-ultimate",
    },

    checklist: {
      tabAtiva: "obrigatorio", // obrigatorio | seguranca | conforto | documentacao
      itens: [
        { id: "1", nome: "Nível de Óleo", tipo: "obrigatorio", verificado: true, observacao: "" },
        { id: "2", nome: "Nível de Água", tipo: "obrigatorio", verificado: true, observacao: "" },
        { id: "3", nome: "Freios", tipo: "obrigatorio", verificado: false, observacao: "Desgaste acentuado" },
        { id: "4", nome: "KM Atual Registrado", tipo: "obrigatorio", verificado: true, observacao: "" },

        { id: "5", nome: "Pneus", tipo: "seguranca", verificado: true, observacao: "" },
        { id: "6", nome: "Luzes", tipo: "seguranca", verificado: true, observacao: "" },
        { id: "7", nome: "Bateria", tipo: "seguranca", verificado: false, observacao: "Verificar carga" },
        { id: "8", nome: "Suspensão", tipo: "seguranca", verificado: true, observacao: "" },

        { id: "9", nome: "Ar Condicionado", tipo: "conforto", verificado: true, observacao: "" },
        { id: "10", nome: "Vidros", tipo: "conforto", verificado: true, observacao: "" },
        { id: "11", nome: "Limpadores", tipo: "conforto", verificado: true, observacao: "" },

        { id: "12", nome: "Documentos do veículo", tipo: "documentacao", verificado: true, observacao: "" },
      ],
    },

    diagnostico: {
      parecerInicial: "", // texto da oficina (V1)
      ia: {
        enabled: true,
        resumo:
          "Baseado no checklist e descrição: 1) Freios com desgaste crítico - trocar pastilhas e avaliar discos. 2) Luz ABS indica provável falha em sensor/roda. Recomendado diagnóstico eletrônico.",
        updatedAt: "2026-01-20T10:15:00-03:00",
        promptHints: ["@ia", "freios", "abs"],
      },
    },

    orcamento: {
      tierDoMes: "standard", // premium | standard | eco
      itens: [
        {
          id: "1",
          nome: "Pastilha de Freio Dianteira Original",
          tipo: "peca",
          quantidade: 1,
          precos: {
            custo: 250,
            venda: 380,
            desconto: 0,
            margemMinimaPct: 20, // V2: validação
          },
          valorTotalVenda: 380,
          status: "pendente", // aprovado | pendente | recusado
          prioridade: "urgente", // urgente | atencao | preventivo
          tier: "premium",
          farolCliente: "vermelho", // verde | amarelo | vermelho (V1 opcional)
          motivoRecusa: "",
          lembreteRetorno: null,
        },
        {
          id: "2",
          nome: "Pastilha de Freio Dianteira Paralela",
          tipo: "peca",
          quantidade: 1,
          precos: {
            custo: 120,
            venda: 180,
            desconto: 0,
            margemMinimaPct: 20,
          },
          valorTotalVenda: 180,
          status: "pendente",
          prioridade: "urgente",
          tier: "eco",
          farolCliente: "amarelo",
          motivoRecusa: "",
          lembreteRetorno: null,
        },
        {
          id: "3",
          nome: "Disco de Freio Dianteiro",
          tipo: "peca",
          quantidade: 2,
          precos: {
            custo: 240,
            venda: 350,
            desconto: 0,
            margemMinimaPct: 20,
          },
          valorTotalVenda: 700,
          status: "pendente",
          prioridade: "urgente",
          tier: "standard",
          farolCliente: "vermelho",
          motivoRecusa: "",
          lembreteRetorno: null,
        },
        {
          id: "4",
          nome: "Serviço de Troca de Freios",
          tipo: "mao_de_obra",
          quantidade: 1,
          precos: {
            custo: 0, // custo pode ser 0 ou custo interno (V2)
            venda: 200,
            desconto: 0,
            margemMinimaPct: 0,
          },
          valorTotalVenda: 200,
          status: "pendente",
          prioridade: "urgente",
          tier: "standard",
          farolCliente: "vermelho",
          motivoRecusa: "",
          lembreteRetorno: null,
        },
        {
          id: "5",
          nome: "Sensor ABS",
          tipo: "peca",
          quantidade: 1,
          precos: {
            custo: 300,
            venda: 450,
            desconto: 0,
            margemMinimaPct: 20,
          },
          valorTotalVenda: 450,
          status: "pendente",
          prioridade: "atencao",
          tier: "standard",
          farolCliente: "amarelo",
          motivoRecusa: "",
          lembreteRetorno: null,
        },
        {
          id: "6",
          nome: "Diagnóstico Eletrônico",
          tipo: "mao_de_obra",
          quantidade: 1,
          precos: {
            custo: 0,
            venda: 150,
            desconto: 0,
            margemMinimaPct: 0,
          },
          valorTotalVenda: 150,
          status: "aprovado",
          prioridade: "preventivo",
          tier: "standard",
          farolCliente: "verde",
          motivoRecusa: "",
          lembreteRetorno: null,
        },
        {
          id: "7",
          nome: "Fluido de Freio DOT4",
          tipo: "peca",
          quantidade: 1,
          precos: {
            custo: 40,
            venda: 80,
            desconto: 0,
            margemMinimaPct: 20,
          },
          valorTotalVenda: 80,
          status: "recusado",
          prioridade: "preventivo",
          tier: "standard",
          farolCliente: "amarelo",
          motivoRecusa: "Cliente já tem em casa",
          lembreteRetorno: { date: "2026-02-19", motivo: "Retomar troca do fluido na próxima visita" },
        },
      ],
    },

    totals: {
      moeda: "BRL",
      // você pode recalcular na UI (mais seguro), mas já deixo aqui também:
      orcado: 2140,
      aprovado: 150,
      pendente: 1910,
      recusado: 80,
      final: 150,
    },

    feedback: {
      enabled: true,
      consultor: {
        avaliacaoLead: 0, // 1-5
        relato: "",
        motivoNaoFechamento: "",
      },
    },

    // =========================
    // V2/V3 (não ativa agora)
    // =========================
    v2v3: {
      promocoes: {
        enabled: false,
        promocaoSelecionadaId: null,
        // ideia: ao escolher uma promoção, UI cria “card promo” no Right Sticky com itens prontos
      },
      precosReferenciaPorModelo: {
        enabled: false,
        // ideia: “Jetta + amortecedor + serviço + média” pra dashboard avisar
      },
      revisaoRetorno: {
        enabled: false,
        // ideia: itens recusados geram tarefas/lembretes no CRM
      },
    },
  },
} as const;

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
  const [dados, setDados] = useState(osUltimateMock.os);
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
        {/* (seu bloco checklist igual já está) */}
        {/* COPIA/COLE aqui o seu bloco Checklist inteiro */}
      </motion.div>

      {/* ============================================ */}
      {/* FOTOS */}
      {/* ============================================ */}
      <motion.div
        id="midia"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-lovable scroll-mt-24"
      >
        {/* COPIA/COLE aqui o seu bloco Fotos e Vídeos inteiro */}
      </motion.div>

      {/* ============================================ */}
      {/* IA */}
      {/* ============================================ */}
      <motion.div
        id="ia"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="section-purple scroll-mt-24"
      >
        {/* COPIA/COLE aqui o seu bloco Diagnóstico IA inteiro */}
      </motion.div>

      {/* ============================================ */}
      {/* ITENS */}
      {/* ============================================ */}
      <motion.div
        id="itens"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-lovable scroll-mt-24"
      >
        {/* COPIA/COLE aqui o seu bloco Itens do Orçamento inteiro */}
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
        {/* COPIA/COLE aqui o seu bloco Resumo de Valores inteiro */}
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
        {/* COPIA/COLE aqui o seu bloco Feedback inteiro */}
      </motion.div>
    </main>

    {/* ========================= */}
    {/* RIGHT STICKY (desktop) */}
    {/* ========================= */}
    <aside className="hidden lg:block">
      <div className="sticky top-[88px] space-y-4">
        <div className="card-lovable">
          <p className="text-sm text-muted-foreground">Total Aprovado</p>
          <p className="text-2xl font-bold text-approved">{formatCurrency(totais.aprovado)}</p>

          {totais.pendente > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente</span>
              <span className="text-sm font-semibold text-pending">{formatCurrency(totais.pendente)}</span>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {totais.pendente > 0 && (
              <button
                onClick={aprovarTodosPendentes}
                className="flex-1 btn-success py-3"
              >
                Aprovar todos
              </button>
            )}
            <button className="flex-1 btn-primary py-3">
              Falar com Oficina
            </button>
          </div>
        </div>

        <div className="card-lovable">
          <p className="text-sm font-medium mb-2">Ações</p>
          <div className="space-y-2">
            <button className="w-full btn-secondary py-2">Enviar WhatsApp</button>
            <button className="w-full btn-secondary py-2">Enviar Sistema</button>
            <button className="w-full btn-secondary py-2">Baixar PDF</button>
          </div>
        </div>

        <div className="card-lovable">
          <p className="text-sm font-medium mb-2">Âncoras</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Cliente", "#cliente"],
              ["Problema", "#problema"],
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

