import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lightbulb, ArrowLeft, Plus, Clock, CheckCircle, XCircle, Loader2, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  prioridade: string;
  autor: string;
  votos: number;
  created_at: string;
}

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "interface", label: "Interface" },
  { value: "funcionalidade", label: "Funcionalidade" },
  { value: "performance", label: "Performance" },
  { value: "atendimento", label: "Atendimento" },
  { value: "processos", label: "Processos" },
];

const PRIORIDADES = [
  { value: "baixa", label: "Baixa", color: "bg-slate-500/10 text-slate-600" },
  { value: "media", label: "Média", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "alta", label: "Alta", color: "bg-orange-500/10 text-orange-600" },
  { value: "urgente", label: "Urgente", color: "bg-red-500/10 text-red-600" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  em_analise: { label: "Em Análise", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Loader2 },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
  implementado: { label: "Implementado", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: CheckCircle },
};

// Mock data
const mockSugestoes: Sugestao[] = [
  {
    id: "1",
    titulo: "Notificações push para lembretes",
    descricao: "Enviar notificações push para lembrar clientes de revisões próximas",
    categoria: "funcionalidade",
    status: "aprovado",
    prioridade: "alta",
    autor: "Maria Silva",
    votos: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    titulo: "Checklist de entrega digital",
    descricao: "Criar checklist digital para conferência na entrega do veículo com fotos",
    categoria: "processos",
    status: "em_analise",
    prioridade: "media",
    autor: "Carlos Santos",
    votos: 8,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    titulo: "Integração com WhatsApp Business",
    descricao: "Automatizar mensagens via API do WhatsApp Business para confirmações e atualizações",
    categoria: "funcionalidade",
    status: "pendente",
    prioridade: "alta",
    autor: "João Oliveira",
    votos: 15,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    titulo: "Relatório de peças mais usadas",
    descricao: "Dashboard com análise das peças mais consumidas para otimizar estoque",
    categoria: "performance",
    status: "implementado",
    prioridade: "media",
    autor: "Ana Costa",
    votos: 6,
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: "5",
    titulo: "Feedback pós-serviço automático",
    descricao: "Enviar pesquisa de satisfação automática 24h após retirada do veículo",
    categoria: "atendimento",
    status: "pendente",
    prioridade: "baixa",
    autor: "Pedro Lima",
    votos: 4,
    created_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

export default function AdminMelhorias() {
  const navigate = useNavigate();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>(mockSugestoes);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterCategoria, setFilterCategoria] = useState<string>("todos");
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "geral",
    prioridade: "media",
  });

  const handleSubmit = () => {
    if (!formData.titulo || !formData.descricao) {
      toast.error("Preencha todos os campos");
      return;
    }

    const novaSugestao: Sugestao = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      categoria: formData.categoria,
      status: "pendente",
      prioridade: formData.prioridade,
      autor: "Você",
      votos: 0,
      created_at: new Date().toISOString(),
    };

    setSugestoes([novaSugestao, ...sugestoes]);
    setFormData({ titulo: "", descricao: "", categoria: "geral", prioridade: "media" });
    setShowForm(false);
    toast.success("Sugestão enviada com sucesso!");
  };

  const handleVote = (id: string) => {
    setSugestoes(sugestoes.map(s => 
      s.id === id ? { ...s, votos: s.votos + 1 } : s
    ));
    toast.success("Voto registrado!");
  };

  const filteredSugestoes = sugestoes.filter(s => {
    if (filterStatus !== "todos" && s.status !== filterStatus) return false;
    if (filterCategoria !== "todos" && s.categoria !== filterCategoria) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/configuracoes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-amber-500" />
                Melhorias
              </h1>
              <p className="text-muted-foreground">
                Sugestões e ideias da equipe
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Sugestão
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{sugestoes.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {sugestoes.filter(s => s.status === "pendente").length}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {sugestoes.filter(s => s.status === "em_analise").length}
              </p>
              <p className="text-sm text-muted-foreground">Em Análise</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {sugestoes.filter(s => s.status === "aprovado").length}
              </p>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {sugestoes.filter(s => s.status === "implementado").length}
              </p>
              <p className="text-sm text-muted-foreground">Implementadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Sugestões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sugestões ({filteredSugestoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSugestoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sugestão encontrada
                </div>
              ) : (
                filteredSugestoes
                  .sort((a, b) => b.votos - a.votos)
                  .map((sugestao) => {
                    const status = STATUS_CONFIG[sugestao.status] || STATUS_CONFIG.pendente;
                    const StatusIcon = status.icon;
                    const categoria = CATEGORIAS.find(c => c.value === sugestao.categoria);
                    const prioridade = PRIORIDADES.find(p => p.value === sugestao.prioridade);

                    return (
                      <div
                        key={sugestao.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Vote Button */}
                          <button
                            onClick={() => handleVote(sugestao.id)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            <ThumbsUp className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">{sugestao.votos}</span>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium">{sugestao.titulo}</h4>
                              <Badge variant="outline" className="text-xs">
                                {categoria?.label}
                              </Badge>
                              {prioridade && (
                                <Badge variant="outline" className={`text-xs ${prioridade.color}`}>
                                  {prioridade.label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {sugestao.descricao}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>Por {sugestao.autor}</span>
                              <span>•</span>
                              <span>{format(new Date(sugestao.created_at), "dd 'de' MMMM", { locale: ptBR })}</span>
                            </div>
                          </div>

                          {/* Status */}
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nova Sugestão */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Nova Sugestão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Resumo da sua ideia"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva sua sugestão em detalhes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Enviar Sugestão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
