import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { 
  Check, XCircle, Trash2, AlertTriangle, 
  Package, Wrench, RotateCcw, Edit
} from "lucide-react";
import type { OSItemData, PrioridadeType, ItemStatus } from "@/hooks/useOSItems";

interface OSItemCardProps {
  item: OSItemData;
  onApprove?: (id: string) => void;
  onRefuse?: (id: string) => void;
  onReset?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showMargin?: boolean;
  compact?: boolean;
}

const prioridadeConfig: Record<PrioridadeType, { label: string; borderColor: string; bgColor: string; textColor: string }> = {
  verde: { 
    label: "Preventivo", 
    borderColor: "border-l-emerald-500", 
    bgColor: "bg-emerald-500/5",
    textColor: "text-emerald-600" 
  },
  amarelo: { 
    label: "Atenção", 
    borderColor: "border-l-amber-500", 
    bgColor: "bg-amber-500/5",
    textColor: "text-amber-600" 
  },
  vermelho: { 
    label: "Urgente", 
    borderColor: "border-l-red-500", 
    bgColor: "bg-red-500/5",
    textColor: "text-red-600" 
  },
};

const statusConfig: Record<ItemStatus, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const tierConfig: Record<string, { label: string; icon: string }> = {
  premium: { label: "Premium", icon: "⭐" },
  standard: { label: "Standard", icon: "🔧" },
  eco: { label: "Eco", icon: "💰" },
};

export function OSItemCard({
  item,
  onApprove,
  onRefuse,
  onReset,
  onDelete,
  onEdit,
  showMargin = false,
  compact = false,
}: OSItemCardProps) {
  const prioridade = prioridadeConfig[item.priority];
  const status = statusConfig[item.status];
  const tier = tierConfig[item.budget_tier];
  const isRecusado = item.status === "recusado";
  const isAprovado = item.status === "aprovado";

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        prioridade.borderColor,
        isRecusado && "opacity-60"
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between gap-4">
          {/* Left side - item info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Type icon */}
              {item.type === "peca" ? (
                <Package className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              
              {/* Description */}
              <span className={cn(
                "font-medium",
                isRecusado && "line-through"
              )}>
                {item.description}
              </span>
              
              {/* Status badge */}
              <Badge variant="outline" className={cn("text-xs", status.color)}>
                {status.label}
              </Badge>
              
              {/* Priority badge */}
              <Badge 
                variant="outline" 
                className={cn("text-xs border", prioridade.textColor)}
              >
                {prioridade.label}
              </Badge>
              
              {/* Tier badge */}
              {tier && (
                <Badge variant="outline" className="text-xs">
                  {tier.icon}
                </Badge>
              )}
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Qtd: {item.quantity} × {formatCurrency(item.unit_price)}
              </span>
              
              {showMargin && item.type === "peca" && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    item.margin_percent < 40 
                      ? "text-amber-600 border-amber-500/30" 
                      : "text-emerald-600 border-emerald-500/30"
                  )}
                >
                  {item.margin_percent.toFixed(0)}% margem
                </Badge>
              )}
            </div>

            {/* Notes */}
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {item.notes}
              </p>
            )}

            {/* Refusal reason */}
            {item.refusal_reason && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Motivo: {item.refusal_reason}
              </p>
            )}

            {/* Low margin warning */}
            {showMargin && item.margin_percent < 40 && item.discount_justification && (
              <p className="text-xs text-amber-600 mt-1">
                💡 {item.discount_justification}
              </p>
            )}
          </div>

          {/* Right side - price and actions */}
          <div className="text-right shrink-0">
            <p className={cn(
              "font-bold text-lg",
              isAprovado && "text-emerald-600",
              isRecusado && "text-red-600 line-through"
            )}>
              {formatCurrency(item.total_price)}
            </p>

            {/* Action buttons */}
            <div className="flex gap-1 mt-2 justify-end">
              {/* Approve button */}
              {!isAprovado && onApprove && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 p-0"
                  onClick={() => onApprove(item.id)}
                  title="Aprovar"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}

              {/* Refuse button */}
              {!isRecusado && onRefuse && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  onClick={() => onRefuse(item.id)}
                  title="Recusar"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}

              {/* Reset button (for approved/refused items) */}
              {(isAprovado || isRecusado) && onReset && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                  onClick={() => onReset(item.id)}
                  title="Voltar para pendente"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}

              {/* Edit button */}
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                  onClick={() => onEdit(item.id)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {/* Delete button */}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                  onClick={() => onDelete(item.id)}
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
