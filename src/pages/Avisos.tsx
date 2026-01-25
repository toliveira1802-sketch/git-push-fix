import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  AlertTriangle, 
  Droplets, 
  Snowflake, 
  MessageSquare, 
  Calendar, 
  Phone,
  X,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "pending_items" | "oil_change" | "seasonal" | "custom";
  title: string;
  message: string;
  due_date: string;
  status: "scheduled" | "sent" | "read" | "dismissed" | "completed";
}

// Mock alerts
const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "oil_change",
    title: "Troca de Óleo",
    message: "Seu Honda Civic está próximo da quilometragem recomendada para troca de óleo.",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "sent",
  },
  {
    id: "2",
    type: "pending_items",
    title: "Itens Pendentes",
    message: "Você tem 2 itens pendentes do último orçamento que recomendamos revisar.",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "sent",
  },
  {
    id: "3",
    type: "seasonal",
    title: "Preparação para o Verão",
    message: "Revise o ar-condicionado antes da temporada de calor!",
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
  },
];

const alertIcons: Record<string, React.ElementType> = {
  pending_items: AlertTriangle,
  oil_change: Droplets,
  seasonal: Snowflake,
  custom: MessageSquare,
};

const alertColors: Record<string, string> = {
  pending_items: "text-amber-500 bg-amber-500/20",
  oil_change: "text-blue-500 bg-blue-500/20",
  seasonal: "text-cyan-500 bg-cyan-500/20",
  custom: "text-purple-500 bg-purple-500/20",
};

const statusBadges: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Pendente", color: "bg-amber-500/20 text-amber-500" },
  sent: { label: "Novo", color: "bg-blue-500/20 text-blue-500" },
  read: { label: "Lido", color: "bg-muted text-muted-foreground" },
  dismissed: { label: "Dispensado", color: "bg-muted text-muted-foreground" },
  completed: { label: "Concluído", color: "bg-emerald-500/20 text-emerald-500" },
};

export default function Avisos() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: "dismissed" as const } : a
    ));
    toast.success("Aviso dispensado");
  };

  const handleSchedule = (alert: Alert) => {
    toast.success("Redirecionando para agendamento...");
    navigate("/novo-agendamento");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const activeAlerts = alerts.filter(a => a.status !== "dismissed" && a.status !== "completed");
  const pastAlerts = alerts.filter(a => a.status === "dismissed" || a.status === "completed");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-8">
      {/* Header */}
      <div className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">Avisos</h1>
          <p className="text-sm text-gray-400">{activeAlerts.length} pendentes</p>
        </div>
        <Bell className="w-5 h-5 text-red-500" />
      </div>

      <div className="p-4 space-y-6">
        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-400">Novos Avisos</h2>
            {activeAlerts.map(alert => {
              const Icon = alertIcons[alert.type];
              const colorClass = alertColors[alert.type];
              const badge = statusBadges[alert.status];
              
              return (
                <div
                  key={alert.id}
                  className="bg-[#111] border border-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", colorClass)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", badge.color)}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(alert.due_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleSchedule(alert)}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Agendar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {activeAlerts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tudo em dia!</h3>
            <p className="text-gray-400 text-sm">
              Você não tem avisos pendentes no momento.
            </p>
          </div>
        )}

        {/* Past Alerts */}
        {pastAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-400">Histórico</h2>
            {pastAlerts.map(alert => {
              const Icon = alertIcons[alert.type];
              
              return (
                <div
                  key={alert.id}
                  className="bg-[#111] border border-gray-800 rounded-xl p-4 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-400">{alert.title}</p>
                      <p className="text-xs text-gray-500">
                        {alert.status === "completed" ? "Concluído" : "Dispensado"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
