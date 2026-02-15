import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  UserPlus,
  UserCheck,
  AlertTriangle,
  UserX,
  TrendingUp,
  Phone,
  Target,
} from "lucide-react";
import type { CRMStats } from "@/hooks/useCRMData";

interface CRMStatsCardsProps {
  stats: CRMStats;
  onFilterClick?: (status: string) => void;
  activeFilter?: string;
}

export function CRMStatsCards({ stats, onFilterClick, activeFilter }: CRMStatsCardsProps) {
  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: Users,
      filter: "all",
      className: "bg-card border",
      textClass: "text-foreground",
      iconClass: "text-muted-foreground",
    },
    {
      label: "Leads",
      value: stats.leads,
      icon: Target,
      filter: "lead",
      className: "bg-purple-500/10 border-purple-500/30",
      textClass: "text-purple-500",
      iconClass: "text-purple-500",
    },
    {
      label: "Ativos",
      value: stats.ativos,
      icon: UserCheck,
      filter: "ativo",
      className: "bg-green-500/10 border-green-500/30",
      textClass: "text-green-500",
      iconClass: "text-green-500",
    },
    {
      label: "Em Risco",
      value: stats.em_risco,
      icon: AlertTriangle,
      filter: "em_risco",
      className: "bg-yellow-500/10 border-yellow-500/30",
      textClass: "text-yellow-500",
      iconClass: "text-yellow-500",
    },
    {
      label: "Inativos",
      value: stats.inativos,
      icon: UserX,
      filter: "inativo",
      className: "bg-muted border",
      textClass: "text-muted-foreground",
      iconClass: "text-muted-foreground",
    },
    {
      label: "Perdidos",
      value: stats.perdidos,
      icon: UserX,
      filter: "perdido",
      className: "bg-destructive/10 border-destructive/30",
      textClass: "text-destructive",
      iconClass: "text-destructive",
    },
    {
      label: "Faturamento",
      value: formatCurrency(stats.total_faturamento),
      icon: TrendingUp,
      filter: null,
      className: "bg-emerald-500/10 border-emerald-500/30",
      textClass: "text-emerald-500",
      iconClass: "text-emerald-500",
      isMonetary: true,
    },
    {
      label: "Follow-ups",
      value: stats.com_followup_pendente,
      icon: Phone,
      filter: "followup",
      className: "bg-blue-500/10 border-blue-500/30",
      textClass: "text-blue-500",
      iconClass: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.filter;

        return (
          <Card
            key={card.label}
            className={`${card.className} ${
              card.filter ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
            } ${isActive ? "ring-2 ring-primary" : ""}`}
            onClick={() => card.filter && onFilterClick?.(card.filter)}
          >
            <CardContent className="p-3">
              <div className={`flex items-center gap-1 text-xs mb-1 ${card.iconClass}`}>
                <Icon className="h-3 w-3" />
                {card.label}
              </div>
              <p className={`text-lg font-bold ${card.textClass}`}>
                {card.isMonetary ? card.value : card.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
