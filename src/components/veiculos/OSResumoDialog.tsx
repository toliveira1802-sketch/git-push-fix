import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock, Wrench, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OSItem {
  id: string;
  descricao: string;
  tipo: "peca" | "servico";
  valor: number;
  quantidade: number;
  status: "aprovado" | "recusado" | "pendente";
}

export interface OSResumoData {
  osNumero: string;
  veiculo: {
    placa: string;
    modelo: string;
  };
  servico: string;
  entrada: string;
  previsaoSaida: string;
  itens: OSItem[];
  totalAprovado: number;
  totalRecusado: number;
  totalPendente: number;
}

interface OSResumoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: OSResumoData | null;
}

const statusConfig = {
  aprovado: { 
    icon: CheckCircle, 
    color: "text-emerald-600", 
    bg: "bg-emerald-500/10",
    label: "Aprovado"
  },
  recusado: { 
    icon: XCircle, 
    color: "text-red-600", 
    bg: "bg-red-500/10",
    label: "Recusado"
  },
  pendente: { 
    icon: Clock, 
    color: "text-amber-600", 
    bg: "bg-amber-500/10",
    label: "Pendente"
  },
};

export function OSResumoDialog({ open, onOpenChange, data }: OSResumoDialogProps) {
  if (!data) return null;

  const itensAprovados = data.itens.filter(i => i.status === "aprovado");
  const itensRecusados = data.itens.filter(i => i.status === "recusado");
  const itensPendentes = data.itens.filter(i => i.status === "pendente");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Resumo da OS
            <Badge variant="outline" className="font-mono">{data.osNumero}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info do veículo */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-semibold">{data.veiculo.modelo}</p>
            <p className="text-sm text-muted-foreground font-mono">{data.veiculo.placa}</p>
            <p className="text-sm mt-1">🔧 {data.servico}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ⏰ {data.entrada} → Previsão: {data.previsaoSaida}
            </p>
          </div>

          {/* Resumo financeiro */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
              <p className="text-lg font-bold text-emerald-600">
                R$ {data.totalAprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground">Aprovado</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-center">
              <p className="text-lg font-bold text-amber-600">
                R$ {data.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground">Pendente</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10 text-center">
              <p className="text-lg font-bold text-red-600">
                R$ {data.totalRecusado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground">Recusado</p>
            </div>
          </div>

          <Separator />

          {/* Lista de itens */}
          <ScrollArea className="h-[250px]">
            <div className="space-y-4 pr-2">
              {/* Itens aprovados */}
              {itensAprovados.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-600">
                      Itens Aprovados ({itensAprovados.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {itensAprovados.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Itens pendentes */}
              {itensPendentes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-600">
                      Itens Pendentes ({itensPendentes.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {itensPendentes.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Itens recusados */}
              {itensRecusados.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      Itens Recusados ({itensRecusados.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {itensRecusados.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({ item }: { item: OSItem }) {
  const config = statusConfig[item.status];
  const Icon = item.tipo === "peca" ? Package : Wrench;
  
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg",
      config.bg
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="text-xs truncate">{item.descricao}</span>
        {item.quantidade > 1 && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            x{item.quantidade}
          </Badge>
        )}
      </div>
      <span className={cn("text-xs font-medium shrink-0 ml-2", config.color)}>
        R$ {(item.valor * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
