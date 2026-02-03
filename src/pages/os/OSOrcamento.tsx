import { useState } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  Package,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "@/hooks/useNavigate";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OSTotalsCards } from "@/components/os/OSTotalsCards";

interface OSItem {
  id: string;
  descricao: string;
  tipo: "peca" | "servico";
  valor: number;
  quantidade: number;
  status: "aprovado" | "recusado" | "pendente";
}

export default function OSOrcamento() {
  const [, routeParams] = useRoute<{ id: string }>("/os/:id/orcamento");
  const navigate = useNavigate();
  const osId = routeParams?.id || "";

  // Mock data - replace with real data
  const [itens, setItens] = useState<OSItem[]>([
    { id: "1", descricao: "Troca de óleo 5W30", tipo: "servico", valor: 150, quantidade: 1, status: "aprovado" },
    { id: "2", descricao: "Filtro de óleo", tipo: "peca", valor: 45, quantidade: 1, status: "aprovado" },
    { id: "3", descricao: "Pastilha de freio dianteira", tipo: "peca", valor: 280, quantidade: 1, status: "pendente" },
    { id: "4", descricao: "Mão de obra freios", tipo: "servico", valor: 200, quantidade: 1, status: "pendente" },
    { id: "5", descricao: "Alinhamento", tipo: "servico", valor: 120, quantidade: 1, status: "recusado" },
    { id: "6", descricao: "Balanceamento", tipo: "servico", valor: 80, quantidade: 4, status: "pendente" },
  ]);

  const totalOrcado = itens.reduce((sum, i) => sum + i.valor * i.quantidade, 0);
  const totalAprovado = itens
    .filter((i) => i.status === "aprovado")
    .reduce((sum, i) => sum + i.valor * i.quantidade, 0);
  const totalRecusado = itens
    .filter((i) => i.status === "recusado")
    .reduce((sum, i) => sum + i.valor * i.quantidade, 0);
  const totalPendente = itens
    .filter((i) => i.status === "pendente")
    .reduce((sum, i) => sum + i.valor * i.quantidade, 0);

  const itensPendentes = itens.filter((i) => i.status === "pendente");
  const temPendentes = itensPendentes.length > 0;

  const handleAprovarItem = (id: string) => {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "aprovado" as const } : i))
    );
    toast.success("Item aprovado!");
  };

  const handleRecusarItem = (id: string) => {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "recusado" as const } : i))
    );
    toast.info("Item recusado");
  };

  const handleAprovarTudo = () => {
    setItens((prev) =>
      prev.map((i) =>
        i.status === "pendente" ? { ...i, status: "aprovado" as const } : i
      )
    );
    toast.success("Todos os itens pendentes foram aprovados!");
  };

  const statusConfig = {
    aprovado: {
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      label: "Aprovado",
    },
    recusado: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-500/10",
      label: "Recusado",
    },
    pendente: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      label: "Pendente",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Orçamento</h1>
            <p className="text-sm text-muted-foreground">OS #{osId}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Totals Cards */}
        <OSTotalsCards
          totalOrcado={totalOrcado}
          totalAprovado={totalAprovado}
          totalRecusado={totalRecusado}
          totalPendente={totalPendente}
        />

        <Separator />

        {/* Lista de Itens */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {itens.map((item) => {
                  const config = statusConfig[item.status];
                  const Icon = item.tipo === "peca" ? Package : Wrench;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        config.bg
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.descricao}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {item.quantidade > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  x{item.quantidade}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={cn("text-xs", config.color)}
                              >
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className={cn("text-sm font-bold shrink-0", config.color)}>
                          R$ {(item.valor * item.quantidade).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Actions for pending items */}
                      {item.status === "pendente" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 h-8 bg-primary hover:bg-primary/90"
                            onClick={() => handleAprovarItem(item.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRecusarItem(item.id)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        {temPendentes && (
          <div className="space-y-2 pb-4">
            <Button
              className="w-full"
              onClick={handleAprovarTudo}
            >
              <Check className="w-4 h-4 mr-2" />
              Aprovar Todos Pendentes (R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Tenho Dúvidas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
