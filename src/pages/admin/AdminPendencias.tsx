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
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Colaborador {
  id: string;
  full_name: string | null;
  cargo: string | null;
}

interface Pendencia {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  created_at: string;
  mechanic_id: string | null;
}

export default function AdminPendencias() {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [consultorSelecionado, setConsultorSelecionado] = useState<string | null>(null);
  const [novaPendencia, setNovaPendencia] = useState({
    titulo: "",
    descricao: "",
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [pendRes, colabRes] = await Promise.all([
        supabase.from("pendencias").select("*").order("created_at", { ascending: true }),
        supabase.from("colaboradores").select("id, full_name, cargo"),
      ]);
      setPendencias(pendRes.data ?? []);
      setColaboradores(colabRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleCriarPendencia = async () => {
    if (!novaPendencia.titulo || !novaPendencia.descricao) {
      toast.error("Preencha o título e descrição");
      return;
    }

    const { data, error } = await supabase.from("pendencias").insert({
      titulo: novaPendencia.titulo,
      descricao: novaPendencia.descricao,
      tipo: "geral",
    }).select().single();

    if (error) {
      toast.error("Erro ao criar pendência: " + error.message);
      return;
    }

    setPendencias([...pendencias, data]);
    setNovaPendencia({ titulo: "", descricao: "" });
    setModalOpen(false);
    toast.success("Pendência criada com sucesso!");
  };

  const handleAtualizarStatus = async (id: string, novoStatus: string) => {
    const updates: Record<string, unknown> = { status: novoStatus };
    if (novoStatus === "resolvido") {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase.from("pendencias").update(updates).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }

    setPendencias(pendencias.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    toast.success("Status atualizado!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolvido": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "em_andamento": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolvido": return "Resolvida";
      case "em_andamento": return "Em Andamento";
      default: return "Pendente";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolvido": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "em_andamento": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const pendenciasFiltradas = consultorSelecionado
    ? pendencias.filter(p => p.mechanic_id === consultorSelecionado)
    : pendencias;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
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
                <Label className="text-gray-400">Título *</Label>
                <Input
                  placeholder="Ex: Ligar para cliente..."
                  value={novaPendencia.titulo}
                  onChange={(e) => setNovaPendencia({...novaPendencia, titulo: e.target.value})}
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

      <div className="flex gap-4 mb-6 flex-wrap">
        <Button
          variant={consultorSelecionado === null ? "default" : "outline"}
          className={consultorSelecionado === null ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-400"}
          onClick={() => setConsultorSelecionado(null)}
        >
          Todos
        </Button>
        {colaboradores.filter(c => c.cargo && ["Consultor Técnico", "Gestão", "Direção"].includes(c.cargo)).map((colab) => (
          <Button
            key={colab.id}
            variant={consultorSelecionado === colab.id ? "default" : "outline"}
            className={consultorSelecionado === colab.id ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-400 hover:text-white"}
            onClick={() => setConsultorSelecionado(colab.id)}
          >
            <Users className="h-4 w-4 mr-2" />
            {colab.full_name || "Sem nome"}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {pendenciasFiltradas.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">Nenhuma pendência encontrada</p>
            </CardContent>
          </Card>
        ) : (
          pendenciasFiltradas.map((pendencia) => (
            <Card key={pendencia.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(pendencia.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{pendencia.titulo}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(pendencia.status)}`}>
                          {getStatusLabel(pendencia.status)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                        {pendencia.descricao || "Sem descrição"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(pendencia.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {pendencia.status === "pendente" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAtualizarStatus(pendencia.id, "resolvido")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Resolvida
                      </Button>
                      <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => handleAtualizarStatus(pendencia.id, "em_andamento")}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Em Andamento
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
