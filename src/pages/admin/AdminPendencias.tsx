import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { colaboradoresMock } from "@/lib/mockData";
import { toast } from "sonner";

interface Pendencia {
  id: number;
  nomePendencia: string;
  descricao: string;
  responsavelId: number;
  criadorId: number;
  status: "pendente" | "feita" | "feita_ressalvas";
  dataCriacao: string;
  timestampCriacao: number;
}

export default function AdminPendencias() {
  const [colaborador, setColaborador] = useState<any>(null);
  const [pendencias, setPendencias] = useState<Pendencia[]>([
    // Dados mock iniciais - ordenados por FIFO (mais antigos primeiro)
    { 
      id: 1, 
      nomePendencia: "Ligar para cliente sobre peça", 
      descricao: "Cliente João da Silva aguardando retorno sobre a peça do motor. Verificar disponibilidade com fornecedor.",
      responsavelId: 1, 
      criadorId: 2, 
      status: "pendente", 
      dataCriacao: "2026-02-01",
      timestampCriacao: new Date("2026-02-01T08:00:00").getTime()
    },
    { 
      id: 2, 
      nomePendencia: "Verificar garantia do motor", 
      descricao: "Motor do cliente precisa de análise de garantia. Contatar montadora para verificar cobertura.",
      responsavelId: 5, 
      criadorId: 1, 
      status: "feita", 
      dataCriacao: "2026-02-01",
      timestampCriacao: new Date("2026-02-01T09:30:00").getTime()
    },
    { 
      id: 3, 
      nomePendencia: "Orçamento para cliente VIP", 
      descricao: "Preparar orçamento detalhado para revisão completa do Porsche Cayenne. Cliente aguardando até 15h.",
      responsavelId: 6, 
      criadorId: 1, 
      status: "feita_ressalvas", 
      dataCriacao: "2026-02-01",
      timestampCriacao: new Date("2026-02-01T10:00:00").getTime()
    },
    { 
      id: 4, 
      nomePendencia: "Confirmar agendamento de amanhã", 
      descricao: "Ligar para os 3 clientes agendados para amanhã e confirmar horário e serviços.",
      responsavelId: 5, 
      criadorId: 3, 
      status: "pendente", 
      dataCriacao: "2026-02-01",
      timestampCriacao: new Date("2026-02-01T11:00:00").getTime()
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [consultorSelecionado, setConsultorSelecionado] = useState<number | null>(null);
  const [novaPendencia, setNovaPendencia] = useState({
    nomePendencia: "",
    descricao: "",
    responsavelId: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("colaborador");
    if (stored) {
      setColaborador(JSON.parse(stored));
    }
  }, []);

  // Consultores da Prime: Thales (id 1), Pedro (id 5), João (id 6)
  const consultoresPrime = colaboradoresMock.filter(c => 
    [1, 5, 6].includes(c.id)
  );

  // Verifica se o usuário logado pode adicionar pendências para outros
  // Gestão e Direção podem adicionar para qualquer um
  // Consultores só podem adicionar para si mesmos
  const podeAdicionarParaOutros = colaborador && 
    ["Gestão", "Direção"].includes(colaborador.cargo);

  // Lista de responsáveis disponíveis no dropdown
  const responsaveisDisponiveis = podeAdicionarParaOutros
    ? consultoresPrime
    : consultoresPrime.filter(c => c.id === colaborador?.id);

  const handleCriarPendencia = () => {
    if (!novaPendencia.nomePendencia || !novaPendencia.descricao || !novaPendencia.responsavelId) {
      toast.error("Preencha o nome, descrição e selecione o responsável");
      return;
    }

    // Verifica permissão
    if (!podeAdicionarParaOutros && novaPendencia.responsavelId !== colaborador?.id) {
      toast.error("Você só pode criar pendências para si mesmo");
      return;
    }

    const nova: Pendencia = {
      id: pendencias.length + 1,
      nomePendencia: novaPendencia.nomePendencia,
      descricao: novaPendencia.descricao,
      responsavelId: novaPendencia.responsavelId,
      criadorId: colaborador?.id || 1,
      status: "pendente",
      dataCriacao: new Date().toISOString().split("T")[0],
      timestampCriacao: Date.now(),
    };

    setPendencias([...pendencias, nova]);
    setNovaPendencia({ nomePendencia: "", descricao: "", responsavelId: 0 });
    setModalOpen(false);
    toast.success("Pendência criada com sucesso!");
  };

  const handleAtualizarStatus = (id: number, novoStatus: Pendencia["status"]) => {
    setPendencias(pendencias.map(p => 
      p.id === id ? { ...p, status: novoStatus } : p
    ));
    toast.success("Status atualizado!");
  };

  const getStatusIcon = (status: Pendencia["status"]) => {
    switch (status) {
      case "feita": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "feita_ressalvas": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: Pendencia["status"]) => {
    switch (status) {
      case "feita": return "Feita";
      case "feita_ressalvas": return "Feita c/ Ressalvas";
      default: return "Pendente";
    }
  };

  const getStatusColor = (status: Pendencia["status"]) => {
    switch (status) {
      case "feita": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "feita_ressalvas": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  // Filtra por consultor selecionado e ordena por FIFO (mais antigos primeiro)
  const pendenciasDoConsultor = (consultorSelecionado
    ? pendencias.filter(p => p.responsavelId === consultorSelecionado)
    : pendencias
  ).sort((a, b) => a.timestampCriacao - b.timestampCriacao);

  const getNomeColaborador = (id: number) => {
    const col = colaboradoresMock.find(c => c.id === id);
    return col?.nome || "Desconhecido";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Pendências do Dia</h1>
            <p className="text-gray-400">Gerencie as pendências da equipe</p>
          </div>
        </div>
        
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pendência
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1f26] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Nova Pendência</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Nome da Pendência *</Label>
                <Input
                  placeholder="Ex: Ligar para cliente..."
                  value={novaPendencia.nomePendencia}
                  onChange={(e) => setNovaPendencia({...novaPendencia, nomePendencia: e.target.value})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Descrição *</Label>
                <Textarea
                  placeholder="Descreva os detalhes da pendência..."
                  value={novaPendencia.descricao}
                  onChange={(e) => setNovaPendencia({...novaPendencia, descricao: e.target.value})}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Responsável *</Label>
                <select
                  value={novaPendencia.responsavelId}
                  onChange={(e) => setNovaPendencia({...novaPendencia, responsavelId: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value={0} className="bg-gray-800">Selecione...</option>
                  {responsaveisDisponiveis.map((col) => (
                    <option key={col.id} value={col.id} className="bg-gray-800">{col.nome}</option>
                  ))}
                </select>
                {!podeAdicionarParaOutros && (
                  <p className="text-xs text-gray-500">Você só pode criar pendências para si mesmo</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Quem Criou</Label>
                  <Input
                    value={colaborador?.nome || "Usuário"}
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Data de Criação</Label>
                  <Input
                    value={new Date().toLocaleDateString("pt-BR")}
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400"
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCriarPendencia}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Pendência
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro por Consultores: Todos, Thales, Pedro, João */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <Button
          variant={consultorSelecionado === null ? "default" : "outline"}
          className={consultorSelecionado === null ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-400"}
          onClick={() => setConsultorSelecionado(null)}
        >
          Todos
        </Button>
        {consultoresPrime.map((consultor) => {
          const qtdPendencias = pendencias.filter(p => p.responsavelId === consultor.id && p.status === "pendente").length;
          return (
            <Button
              key={consultor.id}
              variant={consultorSelecionado === consultor.id ? "default" : "outline"}
              className={consultorSelecionado === consultor.id ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-400 hover:text-white"}
              onClick={() => setConsultorSelecionado(consultor.id)}
            >
              <Users className="h-4 w-4 mr-2" />
              {consultor.nome}
              {qtdPendencias > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {qtdPendencias}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Lista de Pendências - Cards com descrição */}
      <div className="space-y-4">
        {pendenciasDoConsultor.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">Nenhuma pendência encontrada</p>
            </CardContent>
          </Card>
        ) : (
          pendenciasDoConsultor.map((pendencia) => (
            <Card key={pendencia.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(pendencia.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{pendencia.nomePendencia}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(pendencia.status)}`}>
                          {getStatusLabel(pendencia.status)}
                        </span>
                      </div>
                      
                      {/* Descrição - sempre visível */}
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                        {pendencia.descricao}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Responsável: <span className="text-gray-400">{getNomeColaborador(pendencia.responsavelId)}</span></span>
                        <span>•</span>
                        <span>Criado por: <span className="text-gray-400">{getNomeColaborador(pendencia.criadorId)}</span></span>
                        <span>•</span>
                        <span>{pendencia.dataCriacao}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de ação - só aparecem se status for pendente */}
                  {pendencia.status === "pendente" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAtualizarStatus(pendencia.id, "feita")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Feita
                      </Button>
                      <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => handleAtualizarStatus(pendencia.id, "feita_ressalvas")}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Ressalvas
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
