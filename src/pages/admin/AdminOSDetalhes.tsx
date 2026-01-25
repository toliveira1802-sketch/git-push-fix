import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Save, Plus, Phone, Car, User,
  Calendar, FileText, Wrench, CheckCircle,
  XCircle, AlertTriangle, Clock, Loader2, Edit2,
  Camera, Send, MessageSquare,
  History, Copy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DiagnosticoIA } from "@/components/os/DiagnosticoIA";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";

// New components and hooks
import { useOSDetails } from "@/hooks/useOSDetails";
import { useOSItems } from "@/hooks/useOSItems";
import { OSTotalsCards } from "@/components/os/OSTotalsCards";
import { OSItemCard } from "@/components/os/OSItemCard";
import { ItemFormDialog } from "@/components/os/ItemFormDialog";
import { RefuseItemDialog } from "@/components/os/RefuseItemDialog";
import { OSSearchCreate } from "@/components/os/OSSearchCreate";

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
  const navigate = useNavigate();
  
  // Determina se é modo criação: osId é "nova" ou não existe
  const isCreateMode = !osId || osId === "nova";
  const [currentOsId, setCurrentOsId] = useState<string | undefined>(isCreateMode ? undefined : osId);
  const isNewOS = searchParams.get("new") === "true";

  // Hooks for data - MUST be called before any conditional returns
  const { 
    os, 
    history, 
    isLoading: osLoading, 
    isSaving: osSaving,
    updateOS,
    updateStatus,
    updateChecklist,
    markBudgetSent,
  } = useOSDetails(currentOsId);

  const {
    items,
    isLoading: itemsLoading,
    isSaving: itemsSaving,
    addItem,
    deleteItem,
    approveItem,
    refuseItem,
    resetItemStatus,
    totalOrcado,
    totalAprovado,
    totalRecusado,
    totalPendente,
    itensAprovados,
    itensPendentes,
    itensRecusados,
    DEFAULT_MARGIN,
  } = useOSItems(currentOsId);

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<{
    problem_description?: string;
    diagnosis?: string;
    observations?: string;
    entry_km?: number;
  }>({});
  const [activeTab, setActiveTab] = useState("orcamento");
  const [checklistEntrada, setChecklistEntrada] = useState<Record<string, boolean>>({});
  
  // Dialogs
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseItemId, setRefuseItemId] = useState<string | null>(null);
  const [refuseItemDescription, setRefuseItemDescription] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "aprovado" | "pendente" | "recusado">("all");

  // Initialize edited OS and checklist when data loads
  useEffect(() => {
    if (os) {
      setEditedOS({
        problem_description: os.problem_description || "",
        diagnosis: os.diagnosis || "",
        observations: os.observations || "",
        entry_km: os.entry_km || undefined,
      });
      setChecklistEntrada(os.entry_checklist || {});
    }
  }, [os]);

  // Se não tem osId, mostrar tela de busca/criação
  if (!currentOsId) {
    return (
      <AdminLayout>
        <OSSearchCreate 
          onOSCreated={(newOsId) => {
            setCurrentOsId(newOsId);
            navigate(`/admin/os/${newOsId}?new=true`, { replace: true });
          }} 
        />
      </AdminLayout>
    );
  }

  // Handlers
  const handleSave = async () => {
    const success = await updateOS({
      problem_description: editedOS.problem_description,
      diagnosis: editedOS.diagnosis,
      observations: editedOS.observations,
      entry_km: editedOS.entry_km,
    });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus(newStatus);
  };

  const handleChecklistChange = async (key: string, checked: boolean) => {
    const newChecklist = { ...checklistEntrada, [key]: checked };
    setChecklistEntrada(newChecklist);
    await updateChecklist(newChecklist);
  };

  const handleRefuseClick = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    setRefuseItemId(itemId);
    setRefuseItemDescription(item?.description || "");
    setShowRefuseDialog(true);
  };

  const handleConfirmRefuse = async (reason?: string) => {
    if (refuseItemId) {
      await refuseItem(refuseItemId, reason);
    }
    setShowRefuseDialog(false);
    setRefuseItemId(null);
    setRefuseItemDescription("");
  };

  const handleEnviarOrcamento = async () => {
    const phone = os?.client?.phone?.replace(/\D/g, '');
    if (!phone) {
      toast.error("Telefone do cliente não informado");
      return;
    }
    
    await markBudgetSent();
    
    const linkOrcamento = `${window.location.origin}/orcamento/${os?.id}`;
    const vehicleInfo = os?.vehicle ? `${os.vehicle.brand} ${os.vehicle.model}` : "Veículo";
    const mensagem = `Olá ${os?.client?.name || "Cliente"}! 🚗\n\nSeu orçamento da OS ${os?.order_number} está pronto.\n\nVeículo: ${vehicleInfo}\nPlaca: ${os?.vehicle?.plate || ""}\n\nValor Total: ${formatCurrency(totalOrcado)}\n\nAcesse o link para ver os detalhes:\n${linkOrcamento}\n\nDoctor Auto Prime`;
    
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(mensagem)}`, '_blank');
    toast.success("Abrindo WhatsApp...");
  };

  const handleCopyLink = () => {
    const linkOrcamento = `${window.location.origin}/orcamento/${os?.id}`;
    navigator.clipboard.writeText(linkOrcamento);
    toast.success("Link copiado!");
  };

  // Filtered items
  const filteredItems = statusFilter === "all" 
    ? items 
    : items.filter(i => i.status === statusFilter);

  // Loading state
  const isLoading = osLoading || itemsLoading;
  const isSaving = osSaving || itemsSaving;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!os) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">OS não encontrada</p>
          <Button onClick={() => navigate("/admin/ordens-servico")}>
            Voltar para lista
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const currentStatus = statusConfig[os.status] || statusConfig.orcamento;
  const StatusIcon = currentStatus.icon;
  const vehicleDescription = os.vehicle ? `${os.vehicle.brand} ${os.vehicle.model}${os.vehicle.year ? ` ${os.vehicle.year}` : ''}` : '-';

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
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold font-mono text-foreground">{os.order_number}</h1>
                <Badge variant="outline" className={cn("gap-1", currentStatus.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {os.client?.name || '-'} • {os.vehicle?.plate || '-'} • Entrada: {os.created_at ? new Date(os.created_at).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleEnviarOrcamento} disabled={isSaving}>
              <Send className="w-4 h-4 mr-2" />
              Enviar WhatsApp
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <OSTotalsCards
          totalOrcado={totalOrcado}
          totalAprovado={totalAprovado}
          totalRecusado={totalRecusado}
          totalPendente={totalPendente}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orcamento" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Orçamento</span>
              <Badge variant="secondary" className="ml-1">{items.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Orçamento */}
          <TabsContent value="orcamento" className="space-y-4">
            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge 
                variant={statusFilter === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent shrink-0"
                onClick={() => setStatusFilter("all")}
              >
                Todos ({items.length})
              </Badge>
              <Badge 
                variant={statusFilter === "aprovado" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer shrink-0",
                  statusFilter !== "aprovado" && "hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                )}
                onClick={() => setStatusFilter("aprovado")}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Aprovados ({itensAprovados.length})
              </Badge>
              <Badge 
                variant={statusFilter === "pendente" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer shrink-0",
                  statusFilter !== "pendente" && "hover:bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}
                onClick={() => setStatusFilter("pendente")}
              >
                <Clock className="w-3 h-3 mr-1" />
                Pendentes ({itensPendentes.length})
              </Badge>
              <Badge 
                variant={statusFilter === "recusado" ? "default" : "outline"}
                className={cn(
                  "cursor-pointer shrink-0",
                  statusFilter !== "recusado" && "hover:bg-red-500/10 text-red-600 border-red-500/30"
                )}
                onClick={() => setStatusFilter("recusado")}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Recusados ({itensRecusados.length})
              </Badge>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-4">
                      {statusFilter === "all" 
                        ? "Nenhum item no orçamento ainda" 
                        : `Nenhum item ${statusFilter}`}
                    </p>
                    {statusFilter === "all" && (
                      <Button onClick={() => setShowAddItemDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Item
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredItems.map((item) => (
                    <OSItemCard
                      key={item.id}
                      item={item}
                      showMargin={true}
                      onApprove={approveItem}
                      onRefuse={handleRefuseClick}
                      onReset={resetItemStatus}
                      onDelete={deleteItem}
                    />
                  ))}
                </>
              )}

              {items.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddItemDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Tab: Detalhes */}
          <TabsContent value="detalhes" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Nome</Label>
                      <p className="font-medium">{os.client?.name || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Telefone</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{os.client?.phone || "-"}</p>
                        {os.client?.phone && (
                          <a
                            href={`https://wa.me/55${os.client.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    {os.client?.email && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Email</Label>
                        <p className="font-medium">{os.client.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="w-5 h-5" />
                    Veículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Veículo</Label>
                      <p className="font-medium">{vehicleDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-muted-foreground text-xs">Placa</Label>
                        <p className="font-mono font-bold text-primary">{os.vehicle?.plate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">KM Atual</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editedOS.entry_km || ""}
                            onChange={(e) => setEditedOS({ ...editedOS, entry_km: Number(e.target.value) || undefined })}
                          />
                        ) : (
                          <p className="font-medium">{os.entry_km?.toLocaleString('pt-BR') || os.vehicle?.km?.toLocaleString('pt-BR') || "-"} km</p>
                        )}
                      </div>
                    </div>
                    {os.vehicle?.color && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Cor</Label>
                        <p className="font-medium">{os.vehicle.color}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Problem & Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5" />
                  Problema e Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Descrição do Problema</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.problem_description || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, problem_description: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{os.problem_description || "Não informado"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Diagnóstico</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.diagnosis || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, diagnosis: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{os.diagnosis || "Não informado"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Observações</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedOS.observations || ""}
                      onChange={(e) => setEditedOS({ ...editedOS, observations: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm">{os.observations || "Nenhuma"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dr. Auto IA */}
            <DiagnosticoIA
              descricaoProblema={os.problem_description || ""}
              veiculo={vehicleDescription}
              kmAtual={os.entry_km?.toString() || os.vehicle?.km?.toString()}
              onSugestaoClick={(sugestao) => {
                const novosDados = {
                  ...editedOS,
                  diagnosis: editedOS.diagnosis
                    ? `${editedOS.diagnosis}\n• ${sugestao}` 
                    : `• ${sugestao}`
                };
                setEditedOS(novosDados);
                setIsEditing(true);
                toast.success(`"${sugestao}" adicionado ao diagnóstico`);
              }}
            />

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da OS</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={os.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full md:w-64">
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
          </TabsContent>

          {/* Tab: Checklist */}
          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Checklist de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {checklistItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={item.key}
                        checked={checklistEntrada[item.key] || false}
                        onCheckedChange={(checked) => handleChecklistChange(item.key, !!checked)}
                      />
                      <Label htmlFor={item.key} className="text-sm cursor-pointer flex-1">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Fotos do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">Nenhuma foto adicionada</p>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Fotos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum evento registrado ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((evento, index) => (
                      <div key={evento.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{evento.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(evento.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <ItemFormDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        onSubmit={addItem}
        defaultMargin={DEFAULT_MARGIN}
        isSaving={itemsSaving}
      />

      {/* Refuse Dialog */}
      <RefuseItemDialog
        open={showRefuseDialog}
        onOpenChange={setShowRefuseDialog}
        onConfirm={handleConfirmRefuse}
        itemDescription={refuseItemDescription}
        isLoading={itemsSaving}
      />
    </AdminLayout>
  );
}
