import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Save, Plus, Trash2, Phone, Car, User,
  Calendar, DollarSign, FileText, Wrench, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, Edit2,
  ChevronDown, ChevronUp, Camera, Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";

interface OrdemServicoItem {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  prioridade: 'verde' | 'amarelo' | 'vermelho' | null;
}

const prioridadeConfig: Record<string, { label: string; borderColor: string; bgColor: string }> = {
  verde: { label: "Tranquilo", borderColor: "border-emerald-500", bgColor: "bg-emerald-500/5" },
  amarelo: { label: "Médio", borderColor: "border-amber-500", bgColor: "bg-amber-500/5" },
  vermelho: { label: "Imediato", borderColor: "border-red-500", bgColor: "bg-red-500/5" },
};

interface OrdemServico {
  id: string;
  numero_os: string;
  plate: string;
  vehicle: string;
  client_name: string | null;
  client_phone: string | null;
  status: string;
  data_entrada: string | null;
  valor_orcado: number | null;
  valor_aprovado: number | null;
  descricao_problema: string | null;
  diagnostico: string | null;
  observacoes: string | null;
  km_atual: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  diagnostico: { label: "Diagnóstico", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Wrench },
  orcamento: { label: "Orçamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: FileText },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  parcial: { label: "Parcial", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: AlertTriangle },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  em_execucao: { label: "Em Execução", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Wrench },
  concluido: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  entregue: { label: "Entregue", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
};

const itemStatusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

// Mock data for the OS
const mockOS: OrdemServico = {
  id: 'os-1',
  numero_os: 'OS-2024-001',
  plate: 'ABC-1234',
  vehicle: 'Volkswagen Golf GTI 2020',
  client_name: 'João Silva',
  client_phone: '11999887766',
  status: 'orcamento',
  data_entrada: '2024-01-20T10:00:00Z',
  valor_orcado: 2500,
  valor_aprovado: 0,
  descricao_problema: 'Veículo apresentando barulho ao frear e vibração no volante.',
  diagnostico: 'Pastilhas de freio desgastadas, discos empenados.',
  observacoes: 'Cliente solicitou orçamento completo.',
  km_atual: '45.000',
};

const mockItens: OrdemServicoItem[] = [
  {
    id: 'item-1',
    descricao: 'Pastilhas de freio dianteiras',
    tipo: 'peca',
    quantidade: 1,
    valor_unitario: 350,
    valor_total: 350,
    status: 'pendente',
    prioridade: 'vermelho',
  },
  {
    id: 'item-2',
    descricao: 'Discos de freio dianteiros',
    tipo: 'peca',
    quantidade: 2,
    valor_unitario: 280,
    valor_total: 560,
    status: 'pendente',
    prioridade: 'vermelho',
  },
  {
    id: 'item-3',
    descricao: 'Mão de obra - Troca de freios',
    tipo: 'mao_de_obra',
    quantidade: 1,
    valor_unitario: 200,
    valor_total: 200,
    status: 'pendente',
    prioridade: 'amarelo',
  },
];

const checklistItems = [
  { key: 'nivelOleo', label: 'Nível do Óleo' },
  { key: 'nivelAgua', label: 'Nível da Água' },
  { key: 'freios', label: 'Freios' },
  { key: 'pneus', label: 'Pneus' },
  { key: 'luzes', label: 'Luzes' },
  { key: 'bateria', label: 'Bateria' },
  { key: 'correia', label: 'Correia' },
  { key: 'suspensao', label: 'Suspensão' },
];

export default function AdminOSDetalhes() {
  const { osId } = useParams<{ osId: string }>();
  const [searchParams] = useSearchParams();
  const isNewOS = searchParams.get("new") === "true";
  const navigate = useNavigate();

  const [os, setOS] = useState<OrdemServico>(mockOS);
  const [itens, setItens] = useState<OrdemServicoItem[]>(mockItens);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<Partial<OrdemServico>>({});

  // Collapsible sections
  const [checklistOpen, setChecklistOpen] = useState(isNewOS);
  const [fotosOpen, setFotosOpen] = useState(isNewOS);
  const [servicosOpen, setServicosOpen] = useState(true);

  // Checklist state
  const [checklistEntrada, setChecklistEntrada] = useState<Record<string, boolean>>({});

  // Add item dialog
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    descricao: "",
    tipo: "peca",
    quantidade: 1,
    valor_unitario: 0,
    prioridade: "amarelo" as 'verde' | 'amarelo' | 'vermelho',
  });

  useEffect(() => {
    if (os) {
      setEditedOS(os);
    }
  }, [os]);

  const handleSave = () => {
    setOS({ ...os, ...editedOS });
    setIsEditing(false);
    toast.success("OS atualizada com sucesso!");
  };

  const handleStatusChange = (newStatus: string) => {
    setOS({ ...os, status: newStatus });
    toast.success("Status atualizado!");
  };

  const handleAddItem = () => {
    const valor_total = newItem.valor_unitario * newItem.quantidade;
    const item: OrdemServicoItem = {
      id: 'item-' + Date.now(),
      ...newItem,
      valor_total,
      status: 'pendente',
    };
    setItens([...itens, item]);
    setShowAddItemDialog(false);
    setNewItem({
      descricao: "",
      tipo: "peca",
      quantidade: 1,
      valor_unitario: 0,
      prioridade: "amarelo",
    });
    toast.success("Item adicionado!");
  };

  const handleDeleteItem = (itemId: string) => {
    setItens(itens.filter(i => i.id !== itemId));
    toast.success("Item removido!");
  };

  const handleItemStatusChange = (itemId: string, status: string) => {
    setItens(itens.map(i => i.id === itemId ? { ...i, status } : i));
    toast.success("Status do item atualizado!");
  };

  const totalOrcado = itens.reduce((acc, item) => acc + item.valor_total, 0);
  const totalAprovado = itens.filter(i => i.status === 'aprovado').reduce((acc, item) => acc + item.valor_total, 0);

  const currentStatus = statusConfig[os.status] || statusConfig.orcamento;
  const StatusIcon = currentStatus.icon;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/ordens-servico")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono text-foreground">{os.numero_os}</h1>
                <Badge variant="outline" className={cn("gap-1", currentStatus.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Entrada: {os.data_entrada ? new Date(os.data_entrada).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Vehicle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Cliente e Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.client_name || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, client_name: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium mt-1">{os.client_name || "-"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    {isEditing ? (
                      <Input
                        value={editedOS.client_phone || ""}
                        onChange={(e) => setEditedOS({ ...editedOS, client_phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium">{os.client_phone || "-"}</p>
                        {os.client_phone && (
                          <a
                            href={`https://wa.me/55${os.client_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Veículo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{os.vehicle}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Placa</Label>
                    <p className="font-mono font-bold text-primary mt-1">{os.plate}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">KM Atual</Label>
                  {isEditing ? (
                    <Input
                      value={editedOS.km_atual || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, km_atual: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium mt-1">{os.km_atual || "-"} km</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Problem & Diagnostic */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Problema e Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Descrição do Problema</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.descricao_problema || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, descricao_problema: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1">{os.descricao_problema || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Diagnóstico</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.diagnostico || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, diagnostico: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1">{os.diagnostico || "-"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Checklist de Entrada
                      </div>
                      {checklistOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {checklistItems.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          <Checkbox
                            id={item.key}
                            checked={checklistEntrada[item.key] || false}
                            onCheckedChange={(checked) => {
                              setChecklistEntrada({ ...checklistEntrada, [item.key]: !!checked });
                            }}
                          />
                          <Label htmlFor={item.key} className="text-sm cursor-pointer">
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Photos */}
            <Collapsible open={fotosOpen} onOpenChange={setFotosOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Fotos
                      </div>
                      {fotosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Nenhuma foto adicionada</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Fotos
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Services */}
            <Collapsible open={servicosOpen} onOpenChange={setServicosOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Serviços e Peças
                      </div>
                      {servicosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {itens.map((item) => {
                      const prioridade = item.prioridade ? prioridadeConfig[item.prioridade] : null;
                      const itemStatus = itemStatusConfig[item.status] || itemStatusConfig.pendente;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-4 rounded-lg border-2",
                            prioridade?.borderColor || "border-border",
                            prioridade?.bgColor
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{item.descricao}</span>
                                <Badge variant="outline" className={itemStatus.color}>
                                  {itemStatus.label}
                                </Badge>
                                {prioridade && (
                                  <Badge variant="outline" className={cn(prioridade.borderColor, "border")}>
                                    {prioridade.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.tipo === 'mao_de_obra' ? 'Mão de Obra' : 'Peça'} • 
                                Qtd: {item.quantidade} • 
                                {formatCurrency(item.valor_unitario)}/un
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatCurrency(item.valor_total)}</p>
                              <div className="flex gap-1 mt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => handleItemStatusChange(item.id, 'aprovado')}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleItemStatusChange(item.id, 'recusado')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAddItemDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={os.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Orçado</span>
                  <span className="font-bold text-xl">{formatCurrency(totalOrcado)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Aprovado</span>
                  <span className="font-bold text-xl text-emerald-600">{formatCurrency(totalAprovado)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-muted-foreground">Itens</span>
                  <span>{itens.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Aprovados</span>
                  <span className="text-emerald-600">{itens.filter(i => i.status === 'aprovado').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pendentes</span>
                  <span className="text-amber-600">{itens.filter(i => i.status === 'pendente').length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedOS.observacoes || ""}
                    onChange={(e) => setEditedOS({ ...editedOS, observacoes: e.target.value })}
                    rows={4}
                    placeholder="Observações gerais..."
                  />
                ) : (
                  <p className="text-sm">{os.observacoes || "Nenhuma observação"}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição</Label>
              <Input
                value={newItem.descricao}
                onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                placeholder="Ex: Pastilhas de freio"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={newItem.tipo}
                  onValueChange={(v) => setNewItem({ ...newItem, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peca">Peça</SelectItem>
                    <SelectItem value="mao_de_obra">Mão de Obra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={newItem.prioridade}
                  onValueChange={(v) => setNewItem({ ...newItem, prioridade: v as 'verde' | 'amarelo' | 'vermelho' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verde">🟢 Tranquilo</SelectItem>
                    <SelectItem value="amarelo">🟡 Médio</SelectItem>
                    <SelectItem value="vermelho">🔴 Imediato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div>
                <Label>Valor Unitário</Label>
                <Input
                  type="number"
                  value={newItem.valor_unitario}
                  onChange={(e) => setNewItem({ ...newItem, valor_unitario: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">{formatCurrency(newItem.valor_unitario * newItem.quantidade)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem} disabled={!newItem.descricao || newItem.valor_unitario <= 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
