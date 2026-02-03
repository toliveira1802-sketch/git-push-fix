import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Car, Wrench, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "@/hooks/useNavigate";

export default function OSAcompanhamento() {
  const [, routeParams] = useRoute<{ id: string }>("/os/:id");
  const navigate = useNavigate();
  const osId = routeParams?.id || "";

  // Mock data - replace with real data fetch
  const osData = {
    id: osId,
    orderNumber: "2025-00123",
    status: "em_execucao",
    veiculo: {
      placa: "ABC-1234",
      modelo: "Honda Civic",
      ano: 2022,
    },
    entrada: "03/02/2025 08:30",
    previsaoSaida: "05/02/2025 18:00",
    etapas: [
      { nome: "Recepção", concluida: true },
      { nome: "Diagnóstico", concluida: true },
      { nome: "Orçamento Aprovado", concluida: true },
      { nome: "Em Execução", concluida: false },
      { nome: "Controle de Qualidade", concluida: false },
      { nome: "Pronto para Entrega", concluida: false },
    ],
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    aguardando: { label: "Aguardando", color: "bg-amber-500" },
    em_execucao: { label: "Em Execução", color: "bg-blue-500" },
    finalizado: { label: "Finalizado", color: "bg-emerald-500" },
    entregue: { label: "Entregue", color: "bg-gray-500" },
  };

  const currentStatus = statusConfig[osData.status] || statusConfig.aguardando;

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Acompanhamento</h1>
          <p className="text-sm text-muted-foreground">OS #{osData.orderNumber}</p>
        </div>
        <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
      </div>

      {/* Veículo Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{osData.veiculo.modelo}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {osData.veiculo.placa} • {osData.veiculo.ano}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Status do Serviço
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {osData.etapas.map((etapa, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    etapa.concluida
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {etapa.concluida ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span
                  className={
                    etapa.concluida ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {etapa.nome}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Datas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Entrada:</span>
            <span className="font-medium">{osData.entrada}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Previsão:</span>
            <span className="font-medium">{osData.previsaoSaida}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={() => navigate(`/os/${osId}/orcamento`)}
        >
          Ver Orçamento
        </Button>
        <Button variant="outline" className="w-full">
          Falar com a Oficina
        </Button>
      </div>
    </div>
  );
}
