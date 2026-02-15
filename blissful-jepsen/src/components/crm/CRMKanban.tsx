import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { Target, UserCheck, AlertTriangle, UserX, Ban } from "lucide-react";
import type { CRMClient } from "@/hooks/useCRMData";

interface CRMKanbanProps {
  clients: CRMClient[];
  onClientClick?: (client: CRMClient) => void;
}

const columns = [
  {
    id: "lead",
    title: "Leads",
    icon: Target,
    className: "border-purple-500/30",
    headerClass: "text-purple-500",
    bgClass: "bg-purple-500/5",
  },
  {
    id: "ativo",
    title: "Ativos",
    icon: UserCheck,
    className: "border-green-500/30",
    headerClass: "text-green-500",
    bgClass: "bg-green-500/5",
  },
  {
    id: "em_risco",
    title: "Em Risco",
    icon: AlertTriangle,
    className: "border-yellow-500/30",
    headerClass: "text-yellow-500",
    bgClass: "bg-yellow-500/5",
  },
  {
    id: "inativo",
    title: "Inativos",
    icon: UserX,
    className: "border-muted",
    headerClass: "text-muted-foreground",
    bgClass: "bg-muted/20",
  },
  {
    id: "perdido",
    title: "Perdidos",
    icon: Ban,
    className: "border-destructive/30",
    headerClass: "text-destructive",
    bgClass: "bg-destructive/5",
  },
];

const loyaltyConfig = {
  bronze: { icon: "🥉" },
  prata: { icon: "🥈" },
  ouro: { icon: "🥇" },
  diamante: { icon: "💎" },
};

export function CRMKanban({ clients, onClientClick }: CRMKanbanProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnClients = clients.filter((c) => c.status_crm === column.id);
        const Icon = column.icon;
        const totalValue = columnClients.reduce((sum, c) => sum + c.total_spent, 0);

        return (
          <div key={column.id} className="flex-shrink-0 w-72">
            <Card className={`${column.className} ${column.bgClass}`}>
              <CardHeader className="p-3 pb-2">
                <CardTitle className={`text-sm flex items-center justify-between ${column.headerClass}`}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {column.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {columnClients.length}
                  </Badge>
                </CardTitle>
                {totalValue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total: {formatCurrency(totalValue)}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px]">
                  <div className="space-y-2 pr-2">
                    {columnClients.map((client) => {
                      const loyalty =
                        loyaltyConfig[client.loyalty_level as keyof typeof loyaltyConfig] ||
                        loyaltyConfig.bronze;

                      return (
                        <Card
                          key={client.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => onClientClick?.(client)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {getInitials(client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate flex items-center gap-1">
                                  {client.name}
                                  <span className="text-xs">{loyalty.icon}</span>
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {client.phone}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {client.vehicles_count} veíc.
                                  </span>
                                  <span className="text-xs font-medium">
                                    {formatCurrency(client.total_spent)}
                                  </span>
                                </div>
                                {client.dias_sem_visita !== null && (
                                  <p
                                    className={`text-xs mt-1 ${
                                      client.dias_sem_visita > 90
                                        ? "text-destructive"
                                        : client.dias_sem_visita > 60
                                        ? "text-yellow-500"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {client.dias_sem_visita} dias sem visita
                                  </p>
                                )}
                              </div>
                            </div>
                            {client.tags && client.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {client.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {columnClients.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        Nenhum cliente
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
