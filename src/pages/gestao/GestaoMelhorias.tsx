import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lightbulb, ArrowLeft, Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
  created_at: string;
}

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "interface", label: "Interface" },
  { value: "funcionalidade", label: "Funcionalidade" },
  { value: "performance", label: "Performance" },
  { value: "seguranca", label: "Segurança" },
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
    descricao: "Enviar notificações push para lembrar clientes de revisões",
    categoria: "funcionalidade",
    status: "aprovado",
    prioridade: "alta",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    titulo: "Modo escuro no app",
    descricao: "Adicionar opção de tema escuro para melhor usabilidade",
    categoria: "interface",
    status: "em_analise",
    prioridade: "media",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    titulo: "Integração com WhatsApp Business",
    descricao: "Automatizar mensagens via API do WhatsApp Business",
    categoria: "funcionalidade",
    status: "pendente",
    prioridade: "alta",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function GestaoMelhorias() {
  const navigate = useNavigate();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>(mockSugestoes);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "geral",
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
      prioridade: "media",
      created_at: new Date().toISOString(),
    };

    setSugestoes([novaSugestao, ...sugestoes]);
    setFormData({ titulo: "", descricao: "", categoria: "geral" });
    setShowForm(false);
    toast.success("Sugestão enviada com sucesso!");
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gestao")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-cyan-500" />
                Melhorias
              </h1>
              <p className="text-muted-foreground">
                Sugestões e ideias para o sistema
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Sugestão
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Lista de Sugestões */}
        <Card>
          <CardHeader>
            <CardTitle>Sugestões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sugestoes.map((sugestao) => {
                const status = STATUS_CONFIG[sugestao.status] || STATUS_CONFIG.pendente;
                const StatusIcon = status.icon;
                const categoria = CATEGORIAS.find(c => c.value === sugestao.categoria);

                return (
                  <div
                    key={sugestao.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{sugestao.titulo}</h4>
                          <Badge variant="outline" className="text-xs">
                            {categoria?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sugestao.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(sugestao.created_at), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nova Sugestão */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
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
