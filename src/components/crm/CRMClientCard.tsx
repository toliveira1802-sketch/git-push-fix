import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import {
  Phone,
  Mail,
  Car,
  Calendar,
  Star,
  Award,
  ChevronRight,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CRMClient } from "@/hooks/useCRMData";

interface CRMClientCardProps {
  client: CRMClient;
  onClick?: () => void;
  variant?: "list" | "card";
}

const statusCrmConfig = {
  lead: { label: "Lead", className: "bg-purple-500/20 text-purple-500 border-purple-500/30" },
  ativo: { label: "Ativo", className: "bg-green-500/20 text-green-500 border-green-500/30" },
  em_risco: { label: "Em Risco", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  perdido: { label: "Perdido", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const loyaltyConfig = {
  bronze: { label: "Bronze", icon: "🥉", className: "bg-amber-700/20 text-amber-600" },
  prata: { label: "Prata", icon: "🥈", className: "bg-slate-400/20 text-slate-400" },
  ouro: { label: "Ouro", icon: "🥇", className: "bg-yellow-500/20 text-yellow-500" },
  diamante: { label: "Diamante", icon: "💎", className: "bg-cyan-400/20 text-cyan-400" },
};

const origemConfig: Record<string, string> = {
  indicacao: "Indicação",
  redes_sociais: "Redes Sociais",
  google: "Google",
  passando: "Passando",
  direto: "Direto",
};

export function CRMClientCard({ client, onClick, variant = "list" }: CRMClientCardProps) {
  const statusCrm = statusCrmConfig[client.status_crm as keyof typeof statusCrmConfig] || statusCrmConfig.ativo;
  const loyalty = loyaltyConfig[client.loyalty_level as keyof typeof loyaltyConfig] || loyaltyConfig.bronze;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const hasFollowupPending =
    client.proximo_contato && new Date(client.proximo_contato) <= new Date();

  if (variant === "card") {
    return (
      <Card
        className="hover:bg-accent/50 transition-colors cursor-pointer h-full"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{client.name}</p>
              <div className="flex items-center gap-1 flex-wrap mt-1">
                <Badge variant="outline" className={statusCrm.className}>
                  {statusCrm.label}
                </Badge>
                <Badge variant="outline" className={loyalty.className}>
                  {loyalty.icon} {loyalty.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Total Gasto
              </span>
              <span className="font-medium">{formatCurrency(client.total_spent)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Car className="h-3 w-3" />
                Veículos
              </span>
              <span>{client.vehicles_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Dias sem visita
              </span>
              <span className={client.dias_sem_visita && client.dias_sem_visita > 90 ? "text-destructive" : ""}>
                {client.dias_sem_visita ?? "N/A"}
              </span>
            </div>
            {client.nivel_satisfacao && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Satisfação
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < client.nivel_satisfacao! ? "fill-yellow-500 text-yellow-500" : "text-muted"
                      }`}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {hasFollowupPending && (
            <div className="mt-3 p-2 bg-blue-500/10 rounded-md flex items-center gap-2 text-xs text-blue-500">
              <AlertCircle className="h-3 w-3" />
              Follow-up pendente: {client.motivo_contato || "Contato"}
            </div>
          )}

          {client.tags && client.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {client.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {client.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{client.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <Card
      className="hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold truncate">{client.name}</span>
              <Badge variant="outline" className={statusCrm.className}>
                {statusCrm.label}
              </Badge>
              <Badge variant="outline" className={loyalty.className}>
                {loyalty.icon} {loyalty.label}
              </Badge>
              {hasFollowupPending && (
                <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                  📞 Follow-up
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Car className="h-3 w-3" />
                {client.vehicles_count} veículo(s)
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {client.last_service_date
                  ? `Último: ${format(new Date(client.last_service_date), "dd/MM/yy", {
                      locale: ptBR,
                    })}`
                  : "Sem serviços"}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {formatCurrency(client.total_spent)} ({client.orders_count} OS)
              </span>
              {client.origem && client.origem !== "direto" && (
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {origemConfig[client.origem] || client.origem}
                </span>
              )}
            </div>

            {client.tags && client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {client.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {client.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{client.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
