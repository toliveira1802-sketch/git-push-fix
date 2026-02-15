import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Clock,
  DollarSign,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Servico = Tables<"catalogo_servicos">;

interface ServicoForm {
  nome: string;
  descricao: string;
  tipo: string;
  valor_base: number;
  tempo_estimado: number;
  is_active: boolean;
}

const emptyForm: ServicoForm = {
  nome: "",
  descricao: "",
  tipo: "mecanica",
  valor_base: 0,
  tempo_estimado: 60,
  is_active: true,
};

const tiposServico = [
  { value: "mecanica", label: "Mecânica" },
  { value: "eletrica", label: "Elétrica" },
  { value: "funilaria", label: "Funilaria" },
  { value: "pintura", label: "Pintura" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "revisao", label: "Revisão" },
  { value: "outro", label: "Outro" },
];

export default function AdminServicos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServicoForm>(emptyForm);

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ["catalogo_servicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalogo_servicos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Servico[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ServicoForm & { id?: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase
          .from("catalogo_servicos")
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("catalogo_servicos")
          .insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo_servicos"] });
      toast.success(editingId ? "Serviço atualizado!" : "Serviço criado!");
      closeDialog();
    },
    onError: () => toast.error("Erro ao salvar serviço"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("catalogo_servicos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo_servicos"] });
      toast.success("Serviço removido!");
      setDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: () => toast.error("Erro ao remover serviço"),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Servico) => {
    setEditingId(s.id);
    setForm({
      nome: s.nome,
      descricao: s.descricao || "",
      tipo: s.tipo || "mecanica",
      valor_base: s.valor_base ?? 0,
      tempo_estimado: s.tempo_estimado ?? 60,
      is_active: s.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    saveMutation.mutate({ ...form, id: editingId ?? undefined });
  };

  const filtered = servicos.filter(
    (s) =>
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      (s.tipo || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (v: number | null) =>
    (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatMinutes = (m: number | null) => {
    if (!m) return "-";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return min > 0 ? `${h}h${min}min` : `${h}h`;
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="w-6 h-6 text-primary" />
              Catálogo de Serviços
            </h1>
            <p className="text-muted-foreground">
              {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} cadastrado{servicos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Serviço
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{servicos.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-emerald-500">
                {servicos.filter((s) => s.is_active).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Inativos</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {servicos.filter((s) => !s.is_active).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Valor Médio</p>
              <p className="text-2xl font-bold">
                {servicos.length > 0
                  ? formatCurrency(
                      servicos.reduce((a, s) => a + (s.valor_base ?? 0), 0) /
                        servicos.length
                    )
                  : "R$ 0"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Wrench className="w-8 h-8 mb-2 opacity-50" />
                <p>{search ? "Nenhum resultado encontrado" : "Nenhum serviço cadastrado"}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="text-right">Valor Base</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">Tempo Est.</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{s.nome}</p>
                          {s.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {s.descricao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="capitalize">
                          {s.tipo || "outro"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(s.valor_base)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center">
                        <span className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatMinutes(s.tempo_estimado)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={s.is_active ? "default" : "secondary"}>
                          {s.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(s)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingId(s.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Troca de óleo"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Descrição do serviço..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServico.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor Base (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={form.valor_base}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, valor_base: parseFloat(e.target.value) || 0 }))
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo Estimado (min)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={form.tempo_estimado}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tempo_estimado: parseInt(e.target.value) || 0 }))
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                  />
                  <Label>{form.is_active ? "Ativo" : "Inativo"}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
