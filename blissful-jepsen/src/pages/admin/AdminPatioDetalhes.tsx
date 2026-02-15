import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { useRoute } from "wouter";
import { 
  ArrowLeft, 
  Car, 
  Phone, 
  FileText, 
  User, 
  Clock,
  Check,
  Wrench,
  MessageSquare,
  Save,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type OSStatus = 
  | "diagnostico"
  | "aguardando_pecas"
  | "pronto_iniciar"
  | "em_execucao"
  | "pronto_retirada"
  | "concluido";

interface TimelineStep {
  id: OSStatus;
  title: string;
  icon: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

interface PatioData {
  id: string;
  status: string;
  observations: string | null;
  created_at: string;
  vehicle_id: string;
  client_id: string;
  order_number: string;
  vehicle?: {
    brand: string;
    model: string;
    plate: string;
  } | null;
  client?: {
    name: string;
    phone: string;
  } | null;
}

const statusConfig: Record<OSStatus, { label: string; icon: string; color: string }> = {
  diagnostico: {
    label: "🧠 Diagnóstico",
    icon: "🧠",
    color: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  },
  aguardando_pecas: {
    label: "😤 Aguardando Peças",
    icon: "😤",
    color: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  },
  pronto_iniciar: {
    label: "🫵 Pronto para Iniciar",
    icon: "🫵",
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  },
  em_execucao: {
    label: "🛠️🔩 Em Execução",
    icon: "🛠️",
    color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  },
  pronto_retirada: {
    label: "💰 Pronto / Aguardando Retirada",
    icon: "💰",
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  },
  concluido: {
    label: "✅ Concluído",
    icon: "✅",
    color: "bg-success/20 text-success border-success/30",
  },
};

const statusOrder: OSStatus[] = [
  "diagnostico",
  "aguardando_pecas",
  "pronto_iniciar",
  "em_execucao",
  "pronto_retirada",
  "concluido",
];

const AdminPatioDetalhes = () => {
  const navigate = useNavigate();
  const [, routeParams] = useRoute("/admin/patio/:id");
  const patioId = (routeParams as { id?: string } | null)?.id || "";
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusHistory, setStatusHistory] = useState<Array<{ status: string; timestamp: string; user: string }>>([]);

  // Fetch patio data from service_orders table
  const { data: patio, isLoading, error } = useQuery({
    queryKey: ["patio", patioId],
    queryFn: async () => {
      if (!patioId) throw new Error("ID não fornecido");
      
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          id, 
          status, 
          observations, 
          created_at, 
          vehicle_id, 
          client_id, 
          order_number,
          veiculos:vehicle_id (brand, model, plate),
          clientes:client_id (name, phone)
        `)
        .eq("id", patioId)
        .single();

      if (error) throw error;
      return {
        ...(data as any),
        vehicle: (data as any).veiculos,
        client: (data as any).clientes,
      } as PatioData;
    },
    enabled: !!patioId,
  });

  useEffect(() => {
    if (patio) {
      setNotes(patio.observations || "");
      // Initialize status history with current status
      setStatusHistory([
        { 
          status: patio.status, 
          timestamp: new Date(patio.created_at).toLocaleString("pt-BR"), 
          user: "Sistema" 
        }
      ]);
    }
  }, [patio]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: OSStatus) => {
      const { error } = await supabase
        .from("ordens_servico")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", patioId);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["patio", patioId] });
      const timestamp = new Date().toLocaleString("pt-BR");
      setStatusHistory(prev => [...prev, { status: newStatus, timestamp, user: "Admin" }]);
      
      toast.success("Status atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const handleStatusChange = async (newStatus: OSStatus) => {
    setIsSaving(true);
    await updateStatusMutation.mutateAsync(newStatus);
    setIsSaving(false);
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("ordens_servico")
        .update({ observations: notes })
        .eq("id", patioId);
      
      if (error) throw error;
      toast.success("Observações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar observações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTrelloWebhook = async () => {
    setIsSaving(true);
    // Webhook is stored locally for now
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Webhook do Trello configurado!");
    setIsSaving(false);
  };

  const getTimelineSteps = (): TimelineStep[] => {
    if (!patio) return [];
    const currentIndex = statusOrder.indexOf(patio.status as OSStatus);
    
    return statusOrder.map((status, index) => {
      const historyEntry = statusHistory.find((h) => h.status === status);
      
      return {
        id: status,
        title: statusConfig[status].label,
        icon: statusConfig[status].icon,
        completed: index < currentIndex,
        current: index === currentIndex,
        timestamp: historyEntry?.timestamp,
      };
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !patio) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Pátio não encontrado</h2>
          <Button onClick={() => navigate("/admin/patio")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const currentStatus = patio.status as OSStatus;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Pátio #{patio.id?.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">
              Criada em {new Date(patio.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border",
              statusConfig[currentStatus].color
            )}>
              {statusConfig[currentStatus].label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Vehicle Info */}
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Cliente
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">{patio.client?.name || "Não informado"}</p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {patio.client?.phone || "Não informado"}
                      </p>
                    </div>
                    {patio.client?.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(`https://wa.me/55${patio.client?.phone?.replace(/\D/g, "")}`, "_blank");
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                  </div>

                  {/* Vehicle */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      Veículo
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">
                        {patio.vehicle ? `${patio.vehicle.brand} ${patio.vehicle.model}` : "Não informado"}
                      </p>
                      <p className="text-muted-foreground">Placa: {patio.vehicle?.plate || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Timeline do Pátio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-0">
                  {getTimelineSteps().map((step, index) => {
                    const isLast = index === statusOrder.length - 1;

                    return (
                      <div key={step.id} className="relative flex gap-4">
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 text-lg transition-all duration-300",
                              step.completed 
                                ? "bg-success border-success" 
                                : step.current 
                                  ? "bg-primary border-primary status-pulse" 
                                  : "bg-muted border-border"
                            )}
                          >
                            {step.completed ? (
                              <Check className="w-5 h-5 text-success-foreground" />
                            ) : (
                              <span>{step.icon}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "w-0.5 h-full min-h-[40px] -mt-1",
                                step.completed ? "bg-success" : "bg-border"
                              )}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className={cn("flex-1 pb-4", !isLast && "min-h-[60px]")}>
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-medium",
                              step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {step.title}
                            </h3>
                            {step.timestamp && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {step.timestamp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a OS..."
                  rows={4}
                  className="bg-background/50"
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Observações
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Change */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Alterar Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Select
                  value={currentStatus}
                  onValueChange={(value) => handleStatusChange(value as OSStatus)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusConfig[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  {statusOrder.map((status) => (
                    <Button
                      key={status}
                      variant={currentStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      disabled={isSaving || currentStatus === status}
                      className={cn(
                        "text-xs h-auto py-2 px-3",
                        currentStatus === status && "gradient-primary"
                      )}
                    >
                      {statusConfig[status].icon}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Histórico</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {statusHistory.slice().reverse().map((entry, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 text-sm border-b border-border/50 pb-3 last:border-0"
                    >
                      <span className="text-lg">{statusConfig[entry.status as OSStatus]?.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {statusConfig[entry.status as OSStatus]?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.timestamp} • {entry.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPatioDetalhes;
