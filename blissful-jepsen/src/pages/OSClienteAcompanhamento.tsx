/*
 * OSClienteAcompanhamento - Visão Cliente DEPOIS da Aprovação
 * Cliente acompanha em tempo real onde está o carro, etapa atual, prazo de entrega
 * Doctor Auto Prime 2026
 */

import { useState, useEffect } from "react";
import {
  Car,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  Calendar,
  MapPin,
  Wrench,
  Settings,
  Eye,
  Send,
  Package,
  AlertCircle,
  RefreshCw,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

// ============================================
// TIPOS
// ============================================

type EtapaProcesso = "recepcao" | "diagnostico" | "orcamento" | "aprovacao" | "execucao" | "qualidade" | "entrega";

interface ItemAprovado {
  id: string;
  nome: string;
  tipo: "peca" | "mao_de_obra";
  valorTotal: number;
  status: "aguardando" | "em_andamento" | "concluido";
}

interface AtualizacaoTimeline {
  id: string;
  data: string;
  hora: string;
  titulo: string;
  descricao: string;
  tipo: "info" | "progresso" | "alerta" | "concluido";
}

interface DadosAcompanhamento {
  osNumber: string;
  dataEntrada: string;
  previsaoEntrega: string;
  etapaAtual: EtapaProcesso;
  progressoGeral: number; // 0-100
  veiculo: {
    modelo: string;
    placa: string;
    cor?: string;
  };
  itensAprovados: ItemAprovado[];
  valorTotal: number;
  timeline: AtualizacaoTimeline[];
  whatsappOficina: string;
  ultimaAtualizacao: string;
}

// ============================================
// DADOS DE EXEMPLO
// ============================================

const dadosExemplo: DadosAcompanhamento = {
  osNumber: "OS-20260119-223346",
  dataEntrada: "19/01/2026",
  previsaoEntrega: "22/01/2026 às 17:00",
  etapaAtual: "execucao",
  progressoGeral: 65,
  veiculo: {
    modelo: "Honda Civic 2022",
    placa: "ABC-1234",
    cor: "Preto",
  },
  itensAprovados: [
    { id: "1", nome: "Pastilha de Freio Dianteira", tipo: "peca", valorTotal: 280, status: "concluido" },
    { id: "2", nome: "Disco de Freio Dianteiro", tipo: "peca", valorTotal: 700, status: "em_andamento" },
    { id: "3", nome: "Serviço de Troca de Freios", tipo: "mao_de_obra", valorTotal: 200, status: "em_andamento" },
    { id: "4", nome: "Sensor ABS", tipo: "peca", valorTotal: 450, status: "aguardando" },
    { id: "5", nome: "Diagnóstico Eletrônico", tipo: "mao_de_obra", valorTotal: 150, status: "concluido" },
  ],
  valorTotal: 1780,
  timeline: [
    {
      id: "1",
      data: "19/01",
      hora: "22:33",
      titulo: "Veículo recebido",
      descricao: "Seu veículo foi recebido na oficina",
      tipo: "info",
    },
    {
      id: "2",
      data: "20/01",
      hora: "09:15",
      titulo: "Diagnóstico iniciado",
      descricao: "Iniciamos a análise do problema reportado",
      tipo: "progresso",
    },
    {
      id: "3",
      data: "20/01",
      hora: "11:30",
      titulo: "Orçamento enviado",
      descricao: "Orçamento enviado para sua aprovação",
      tipo: "info",
    },
    {
      id: "4",
      data: "20/01",
      hora: "14:22",
      titulo: "Orçamento aprovado",
      descricao: "Você aprovou o orçamento. Iniciando serviços!",
      tipo: "concluido",
    },
    {
      id: "5",
      data: "21/01",
      hora: "08:00",
      titulo: "Execução iniciada",
      descricao: "Mecânico Carlos iniciou os serviços",
      tipo: "progresso",
    },
    {
      id: "6",
      data: "21/01",
      hora: "10:45",
      titulo: "Pastilhas trocadas",
      descricao: "Troca das pastilhas de freio concluída",
      tipo: "concluido",
    },
    {
      id: "7",
      data: "21/01",
      hora: "14:30",
      titulo: "Em andamento",
      descricao: "Trabalhando na troca dos discos de freio",
      tipo: "progresso",
    },
  ],
  whatsappOficina: "5511999999999",
  ultimaAtualizacao: "21/01/2026 14:30",
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function OSClienteAcompanhamento() {
  const [dados] = useState<DadosAcompanhamento>(dadosExemplo);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const etapas: { key: EtapaProcesso; label: string; icon: typeof Car }[] = [
    { key: "recepcao", label: "Recepção", icon: Car },
    { key: "diagnostico", label: "Diagnóstico", icon: Wrench },
    { key: "orcamento", label: "Orçamento", icon: Package },
    { key: "aprovacao", label: "Aprovação", icon: CheckCircle2 },
    { key: "execucao", label: "Execução", icon: Settings },
    { key: "qualidade", label: "Qualidade", icon: Eye },
    { key: "entrega", label: "Entrega", icon: Send },
  ];

  const etapaAtualIndex = etapas.findIndex((e) => e.key === dados.etapaAtual);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getStatusColor = (status: ItemAprovado["status"]) => {
    switch (status) {
      case "concluido": return "bg-green-500";
      case "em_andamento": return "bg-yellow-500 animate-pulse";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: ItemAprovado["status"]) => {
    switch (status) {
      case "concluido": return "Concluído";
      case "em_andamento": return "Em andamento";
      default: return "Aguardando";
    }
  };

  const getTimelineIcon = (tipo: AtualizacaoTimeline["tipo"]) => {
    switch (tipo) {
      case "concluido": return CheckCircle2;
      case "progresso": return Settings;
      case "alerta": return AlertCircle;
      default: return Bell;
    }
  };

  const getTimelineColor = (tipo: AtualizacaoTimeline["tipo"]) => {
    switch (tipo) {
      case "concluido": return "bg-green-500 text-green-500";
      case "progresso": return "bg-yellow-500 text-yellow-500";
      case "alerta": return "bg-red-500 text-red-500";
      default: return "bg-blue-500 text-blue-500";
    }
  };

  const abrirWhatsApp = () => {
    const mensagem = `Olá! Gostaria de saber o status do meu veículo. OS: ${dados.osNumber}`;
    window.open(`https://wa.me/${dados.whatsappOficina}?text=${encodeURIComponent(mensagem)}`, "_blank");
  };

  const atualizarDados = () => {
    setIsRefreshing(true);
    // Simula atualização
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Simula atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Aqui faria polling ou usaria websocket
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#141414] border-b border-white/10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Acompanhamento</h1>
              <p className="text-sm text-gray-400">{dados.osNumber}</p>
            </div>
            <button
              onClick={atualizarDados}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-[#222]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6 pb-32 space-y-6">
        {/* Card do Veículo + Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{dados.veiculo.modelo}</h2>
              <p className="text-gray-400">Placa: {dados.veiculo.placa}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">{dados.progressoGeral}%</p>
              <p className="text-xs text-gray-500">concluído</p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full bg-[#0a0a0a] rounded-full h-3 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dados.progressoGeral}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full"
            />
          </div>

          {/* Previsão de Entrega */}
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Previsão de Entrega</span>
            </div>
            <span className="text-white font-bold">{dados.previsaoEntrega}</span>
          </div>
        </motion.div>

        {/* Etapas do Processo - Visual */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            Onde está seu carro?
          </h3>

          <div className="relative">
            {/* Linha de conexão */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#333]" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-green-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(etapaAtualIndex / (etapas.length - 1)) * 100}%` }}
            />

            {/* Etapas */}
            <div className="relative flex justify-between">
              {etapas.map((etapa, index) => {
                const Icon = etapa.icon;
                const isPast = index < etapaAtualIndex;
                const isCurrent = index === etapaAtualIndex;
                const isFuture = index > etapaAtualIndex;

                return (
                  <div key={etapa.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                        isPast
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-orange-500 text-white ring-4 ring-orange-500/30 animate-pulse"
                          : "bg-[#333] text-gray-500"
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? "text-orange-400 font-medium" : isPast ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {etapa.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status atual */}
          <div className="mt-6 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 text-sm">
              <span className="font-semibold">Status atual:</span> Seu veículo está em{" "}
              <span className="font-bold">{etapas[etapaAtualIndex].label}</span>
            </p>
          </div>
        </motion.div>

        {/* Itens Aprovados */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Serviços Aprovados</h3>
            <span className="text-green-400 font-bold">{formatCurrency(dados.valorTotal)}</span>
          </div>

          <div className="space-y-3">
            {dados.itensAprovados.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                  <div>
                    <p className="text-white text-sm">{item.nome}</p>
                    <p className="text-xs text-gray-500">{getStatusLabel(item.status)}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{formatCurrency(item.valorTotal)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline de Atualizações */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Histórico de Atualizações
          </h3>

          <div className="space-y-4">
            {dados.timeline.slice().reverse().map((item, index) => {
              const Icon = getTimelineIcon(item.tipo);
              const colorClass = getTimelineColor(item.tipo);

              return (
                <div key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass.split(" ")[0]}/20`}>
                      <Icon className={`w-4 h-4 ${colorClass.split(" ")[1]}`} />
                    </div>
                    {index < dados.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-[#333] my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{item.titulo}</span>
                      <span className="text-xs text-gray-500">{item.data} {item.hora}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{item.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Última atualização: {dados.ultimaAtualizacao}
          </p>
        </motion.div>
      </main>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-white/10 p-4 safe-area-bottom">
        <div className="container">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={abrirWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com Oficina
            </button>
            <button
              onClick={() => window.location.href = `tel:${dados.whatsappOficina}`}
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-white/10 text-white py-3 rounded-xl font-medium transition-colors hover:bg-[#222]"
            >
              <Phone className="w-5 h-5" />
              Ligar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
