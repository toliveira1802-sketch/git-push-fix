/*
 * OSClienteOrcamento - Visão Cliente ANTES da Aprovação
 * Cliente vê o orçamento, pode aprovar/recusar itens
 * Doctor Auto Prime 2026
 */

import { useState } from "react";
import {
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Clock,
  DollarSign,
  Shield,
  AlertTriangle,
  Phone,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// TIPOS
// ============================================

type StatusItem = "aprovado" | "pendente" | "recusado";
type PrioridadeItem = "urgente" | "atencao" | "preventivo";
type TierOrcamento = "premium" | "standard" | "eco";

interface ItemOrcamento {
  id: string;
  nome: string;
  tipo: "peca" | "mao_de_obra";
  quantidade: number;
  valorTotal: number;
  status: StatusItem;
  prioridade: PrioridadeItem;
  tier: TierOrcamento;
  descricao?: string;
}

interface DadosOrcamentoCliente {
  osNumber: string;
  dataEntrada: string;
  previsaoEntrega?: string;
  veiculo: {
    modelo: string;
    placa: string;
    cor?: string;
  };
  descricaoProblema: string;
  itens: ItemOrcamento[];
  whatsappOficina: string;
}

// ============================================
// DADOS DE EXEMPLO
// ============================================

const dadosExemplo: DadosOrcamentoCliente = {
  osNumber: "OS-20260119-223346",
  dataEntrada: "19/01/2026",
  previsaoEntrega: "22/01/2026",
  veiculo: {
    modelo: "Honda Civic 2022",
    placa: "ABC-1234",
    cor: "Preto",
  },
  descricaoProblema: "Barulho ao frear e luz do ABS acesa",
  itens: [
    {
      id: "1",
      nome: "Pastilha de Freio Dianteira",
      tipo: "peca",
      quantidade: 1,
      valorTotal: 280,
      status: "pendente",
      prioridade: "urgente",
      tier: "standard",
      descricao: "Peça de qualidade standard com garantia de 1 ano",
    },
    {
      id: "2",
      nome: "Disco de Freio Dianteiro",
      tipo: "peca",
      quantidade: 2,
      valorTotal: 700,
      status: "pendente",
      prioridade: "urgente",
      tier: "standard",
      descricao: "Par de discos ventilados",
    },
    {
      id: "3",
      nome: "Serviço de Troca de Freios",
      tipo: "mao_de_obra",
      quantidade: 1,
      valorTotal: 200,
      status: "pendente",
      prioridade: "urgente",
      tier: "standard",
    },
    {
      id: "4",
      nome: "Sensor ABS",
      tipo: "peca",
      quantidade: 1,
      valorTotal: 450,
      status: "pendente",
      prioridade: "atencao",
      tier: "standard",
      descricao: "Sensor original compatível",
    },
    {
      id: "5",
      nome: "Diagnóstico Eletrônico",
      tipo: "mao_de_obra",
      quantidade: 1,
      valorTotal: 150,
      status: "aprovado",
      prioridade: "preventivo",
      tier: "standard",
    },
    {
      id: "6",
      nome: "Fluido de Freio DOT4",
      tipo: "peca",
      quantidade: 1,
      valorTotal: 80,
      status: "pendente",
      prioridade: "preventivo",
      tier: "standard",
    },
  ],
  whatsappOficina: "5511999999999",
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function OSClienteOrcamento() {
  const [dados, setDados] = useState<DadosOrcamentoCliente>(dadosExemplo);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [modalRecusa, setModalRecusa] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
        item.id === id ? { ...item, status: "recusado" as const } : item
      ),
    }));
    setModalRecusa(null);
    setMotivoRecusa("");
  };

  const aprovarTodosPendentes = () => {
    setDados((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.status === "pendente" ? { ...item, status: "aprovado" as const } : item
      ),
    }));
  };

  const enviarAprovacao = () => {
    // Aqui enviaria para o backend
    alert("Orçamento enviado para a oficina!");
  };

  // Cálculos
  const totais = {
    aprovado: dados.itens
      .filter((i) => i.status === "aprovado")
      .reduce((acc, item) => acc + item.valorTotal, 0),
    pendente: dados.itens
      .filter((i) => i.status === "pendente")
      .reduce((acc, item) => acc + item.valorTotal, 0),
    recusado: dados.itens
      .filter((i) => i.status === "recusado")
      .reduce((acc, item) => acc + item.valorTotal, 0),
  };

  const totalFinal = totais.aprovado;
  const itensPendentes = dados.itens.filter((i) => i.status === "pendente").length;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getPrioridadeInfo = (prioridade: PrioridadeItem) => {
    switch (prioridade) {
      case "urgente":
        return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "Urgente" };
      case "atencao":
        return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Atenção" };
      default:
        return { icon: Shield, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", label: "Preventivo" };
    }
  };

  const getStatusColor = (status: StatusItem) => {
    switch (status) {
      case "aprovado": return "bg-green-500";
      case "recusado": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const abrirWhatsApp = () => {
    const mensagem = `Olá! Tenho uma dúvida sobre o orçamento ${dados.osNumber}`;
    window.open(`https://wa.me/${dados.whatsappOficina}?text=${encodeURIComponent(mensagem)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#141414] border-b border-white/10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Seu Orçamento</h1>
              <p className="text-sm text-gray-400">{dados.osNumber}</p>
            </div>
            <button
              onClick={abrirWhatsApp}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Dúvidas?
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6 pb-40 space-y-4">
        {/* Card do Veículo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{dados.veiculo.modelo}</h2>
              <p className="text-gray-400">Placa: {dados.veiculo.placa} • {dados.veiculo.cor}</p>
              <p className="text-sm text-gray-500 mt-2">{dados.descricaoProblema}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Entrada</p>
                <p className="text-sm text-white font-medium">{dados.dataEntrada}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Previsão Entrega</p>
                <p className="text-sm text-green-400 font-medium">{dados.previsaoEntrega || "A definir"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resumo de Valores */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-green-400 mb-1">Aprovado</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totais.aprovado)}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-yellow-400 mb-1">Pendente</p>
            <p className="text-lg font-bold text-yellow-400">{formatCurrency(totais.pendente)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-red-400 mb-1">Recusado</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totais.recusado)}</p>
          </div>
        </motion.div>

        {/* Lista de Itens */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Itens do Orçamento</h2>
            {itensPendentes > 0 && (
              <button
                onClick={aprovarTodosPendentes}
                className="text-sm text-green-400 hover:text-green-300 font-medium"
              >
                Aprovar todos ({itensPendentes})
              </button>
            )}
          </div>

          {dados.itens.map((item) => {
            const prioridade = getPrioridadeInfo(item.prioridade);
            const PrioridadeIcon = prioridade.icon;
            const isExpanded = expandedItems.includes(item.id);

            return (
              <motion.div
                key={item.id}
                layout
                className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${
                  item.status === "aprovado"
                    ? "border-green-500/30"
                    : item.status === "recusado"
                    ? "border-red-500/30"
                    : "border-white/10"
                }`}
              >
                {/* Header do Item */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${prioridade.bg} ${prioridade.color} border ${prioridade.border}`}>
                          {prioridade.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.tipo === "peca" ? "Peça" : "Mão de Obra"}
                        </span>
                      </div>
                      <h3 className="text-white font-medium">{item.nome}</h3>
                      {item.descricao && (
                        <p className="text-sm text-gray-500 mt-1">{item.descricao}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{formatCurrency(item.valorTotal)}</p>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 ml-auto mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações do Item (expandido) */}
                <AnimatePresence>
                  {isExpanded && item.status === "pendente" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            aprovarItem(item.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Aprovar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalRecusa(item.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 rounded-lg font-medium transition-colors border border-red-500/30"
                        >
                          <XCircle className="w-5 h-5" />
                          Recusar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Badge */}
                {item.status !== "pendente" && (
                  <div className={`px-4 py-2 text-center text-sm font-medium ${
                    item.status === "aprovado" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {item.status === "aprovado" ? "✓ Aprovado" : "✗ Recusado"}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-white/10 p-4 safe-area-bottom">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-400">Total a Pagar</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(totalFinal)}</p>
            </div>
            {itensPendentes > 0 && (
              <p className="text-sm text-yellow-400">
                {itensPendentes} item(ns) pendente(s)
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={abrirWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-white/10 text-white py-3 rounded-xl font-medium transition-colors hover:bg-[#222]"
            >
              <Phone className="w-5 h-5" />
              Falar com Oficina
            </button>
            <button
              onClick={enviarAprovacao}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirmar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Recusa */}
      <AnimatePresence>
        {modalRecusa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setModalRecusa(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-2">Recusar Item</h3>
              <p className="text-gray-400 mb-4">
                Pode nos contar o motivo? Isso nos ajuda a melhorar.
              </p>
              
              <textarea
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: Vou fazer em outro momento, preço alto, etc."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none h-24 focus:outline-none focus:border-orange-500/50"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setModalRecusa(null)}
                  className="flex-1 py-3 rounded-xl font-medium bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => recusarItem(modalRecusa)}
                  className="flex-1 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
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
