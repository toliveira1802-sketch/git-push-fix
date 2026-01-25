import { useState } from "react";
import { ChevronDown, ChevronUp, Wrench, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface ServiceItem {
  id: string;
  date: string;
  vehicleModel: string;
  plate: string;
  services: string[];
  total: number;
  status: "completed" | "cancelled";
  cashback: number;
}

// Mock data
const mockHistory: ServiceItem[] = [
  {
    id: "1",
    date: "2024-01-15",
    vehicleModel: "Honda Civic",
    plate: "ABC-1234",
    services: ["Troca de Óleo", "Filtro de Ar", "Filtro de Cabine"],
    total: 450,
    status: "completed",
    cashback: 67.5,
  },
  {
    id: "2",
    date: "2024-01-02",
    vehicleModel: "Toyota Corolla",
    plate: "XYZ-5678",
    services: ["Revisão de Freios"],
    total: 280,
    status: "completed",
    cashback: 42,
  },
  {
    id: "3",
    date: "2023-12-20",
    vehicleModel: "Honda Civic",
    plate: "ABC-1234",
    services: ["Alinhamento e Balanceamento"],
    total: 120,
    status: "cancelled",
    cashback: 0,
  },
];

export default function Historico() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history] = useState<ServiceItem[]>(mockHistory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const completedServices = history.filter(s => s.status === "completed");
  const totalCashback = completedServices.reduce((acc, item) => acc + item.cashback, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Histórico</h1>
        <p className="text-white/80 mt-1">Seus serviços realizados</p>
        
        {/* Cashback Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Seu cashback disponível</p>
              <p className="text-white text-2xl font-bold">R$ {totalCashback.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white border-0">
                15% de volta
              </Badge>
              <p className="text-white/70 text-xs mt-1">para usar em serviços</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Service History */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-red-500" />
              Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((item) => (
              <Collapsible
                key={item.id}
                open={expandedId === item.id}
                onOpenChange={(open) => setExpandedId(open ? item.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
                      item.status === "completed" 
                        ? "bg-muted/50 hover:bg-muted" 
                        : "bg-destructive/5 hover:bg-destructive/10"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.status === "completed" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{item.vehicleModel}</p>
                        <Badge variant={item.status === "completed" ? "default" : "destructive"}>
                          {item.status === "completed" ? "Concluído" : "Cancelado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.plate}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-red-500">R$ {item.total}</p>
                      {expandedId === item.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="ml-13 pl-4 border-l-2 border-muted mt-2 mb-2 space-y-2">
                    {item.services.length > 0 && (
                      <>
                        <p className="text-sm font-medium">Serviços:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {item.services.map((service, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              {service}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {item.status === "completed" && item.cashback > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        +R$ {item.cashback.toFixed(2).replace('.', ',')} de cashback
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum serviço realizado ainda</p>
                <p className="text-sm">Agende seu primeiro serviço!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extra space for bottom nav */}
        <div className="h-4" />
      </div>

      <BottomNavigation />
    </div>
  );
}
