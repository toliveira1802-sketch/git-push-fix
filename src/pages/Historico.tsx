import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { ChevronDown, ChevronUp, Wrench, CheckCircle2, XCircle, Clock, Loader2, Home, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useClientData, type ClientServiceHistory } from "@/hooks/useClientData";
import { OSResumoDialog, type OSResumoData } from "@/components/veiculos/OSResumoDialog";

export default function Historico() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { serviceHistory, loading } = useClientData();
  const [osResumoOpen, setOsResumoOpen] = useState(false);
  const [selectedOSResumo, setSelectedOSResumo] = useState<OSResumoData | null>(null);

  const handleVerOS = (item: ClientServiceHistory) => {
    const itensAprovados = item.items.filter(i => i.status === 'aprovado');
    const itensPendentes = item.items.filter(i => i.status === 'pendente' || i.status === 'orcamento');
    const itensRecusados = item.items.filter(i => i.status === 'recusado');
    
    const resumo: OSResumoData = {
      osNumero: item.order_number,
      veiculo: {
        placa: item.vehicle_plate,
        modelo: `${item.vehicle_brand} ${item.vehicle_model}`,
      },
      servico: item.problem_description || 'Serviço realizado',
      entrada: new Date(item.order_date).toLocaleDateString('pt-BR'),
      previsaoSaida: item.completed_at ? new Date(item.completed_at).toLocaleDateString('pt-BR') : '-',
      itens: item.items.map(i => ({
        id: i.id,
        descricao: i.description,
        tipo: i.type as 'peca' | 'servico',
        valor: i.unit_price,
        quantidade: i.quantity || 1,
        status: (i.status === 'aprovado' ? 'aprovado' : 
                i.status === 'recusado' ? 'recusado' : 'pendente') as 'aprovado' | 'recusado' | 'pendente',
      })),
      totalAprovado: itensAprovados.reduce((sum, i) => sum + (i.total_price || 0), 0),
      totalPendente: itensPendentes.reduce((sum, i) => sum + (i.total_price || 0), 0),
      totalRecusado: itensRecusados.reduce((sum, i) => sum + (i.total_price || 0), 0),
    };
    
    setSelectedOSResumo(resumo);
    setOsResumoOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    if (['fechada', 'concluida', 'entregue'].includes(statusLower)) {
      return { label: 'Concluído', variant: 'default' as const, icon: CheckCircle2, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    }
    if (['cancelada'].includes(statusLower)) {
      return { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle, iconColor: 'text-destructive', bgColor: 'bg-destructive/10' };
    }
    return { label: 'Em andamento', variant: 'secondary' as const, icon: Clock, iconColor: 'text-amber-600', bgColor: 'bg-amber-100' };
  };

  // Calculate total spent (only completed orders)
  const completedOrders = serviceHistory.filter(s => 
    ['fechada', 'concluida', 'entregue'].includes(s.order_status.toLowerCase())
  );
  const totalSpent = completedOrders.reduce((acc, item) => acc + (item.total || 0), 0);
  const estimatedCashback = totalSpent * 0.15;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Histórico</h1>
        </div>
        <p className="text-primary-foreground/80">Seus serviços realizados</p>
        
        {/* Cashback Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/70 text-sm">Seu cashback estimado</p>
              <p className="text-primary-foreground text-2xl font-bold">
                R$ {estimatedCashback.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-primary-foreground border-0">
                15% de volta
              </Badge>
              <p className="text-primary-foreground/70 text-xs mt-1">para usar em serviços</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Service History */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Serviços ({serviceHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceHistory.map((item) => {
              const statusConfig = getStatusConfig(item.order_status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Collapsible
                  key={item.service_order_id}
                  open={expandedId === item.service_order_id}
                  onOpenChange={(open) => setExpandedId(open ? item.service_order_id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors bg-muted/50 hover:bg-muted"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.bgColor}`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{item.vehicle_brand} {item.vehicle_model}</p>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{item.vehicle_plate}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{formatDate(item.order_date)}</p>
                          <Badge variant="outline" className="text-[10px]">{item.order_number}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-primary">
                          R$ {(item.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {expandedId === item.service_order_id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-13 pl-4 border-l-2 border-muted mt-2 mb-2 space-y-3">
                      {/* Problem description */}
                      {item.problem_description && (
                        <div>
                          <p className="text-sm font-medium">Problema relatado:</p>
                          <p className="text-sm text-muted-foreground">{item.problem_description}</p>
                        </div>
                      )}
                      
                      {/* Diagnosis */}
                      {item.diagnosis && (
                        <div>
                          <p className="text-sm font-medium">Diagnóstico:</p>
                          <p className="text-sm text-muted-foreground">{item.diagnosis}</p>
                        </div>
                      )}
                      
                      {/* Service items */}
                      {item.items && item.items.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Itens do serviço:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                            {item.items.map((serviceItem, idx) => (
                              <li key={serviceItem.id || idx} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span className="truncate">{serviceItem.description}</span>
                                  {serviceItem.status === 'aprovado' && (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  )}
                                  {serviceItem.status === 'recusado' && (
                                    <XCircle className="h-3 w-3 text-destructive" />
                                  )}
                                </div>
                                <span className="text-xs font-medium shrink-0">
                                  R$ {(serviceItem.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Payment info */}
                      {item.payment_status && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Pagamento:</span>
                          <Badge variant="outline" className="text-xs">
                            {item.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                          </Badge>
                          {item.payment_method && (
                            <span className="text-muted-foreground">({item.payment_method})</span>
                          )}
                        </div>
                      )}
                      
                      {/* Totals breakdown */}
                      {(item.total_parts || item.total_labor) && (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-muted">
                          {item.total_parts && (
                            <div>
                              <span className="text-muted-foreground">Peças: </span>
                              <span className="font-medium">R$ {item.total_parts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          {item.total_labor && (
                            <div>
                              <span className="text-muted-foreground">Mão de obra: </span>
                              <span className="font-medium">R$ {item.total_labor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Ver OS Button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerOS(item);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver detalhes da OS
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {serviceHistory.length === 0 && (
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

      {/* Dialog de Resumo da OS */}
      <OSResumoDialog 
        open={osResumoOpen} 
        onOpenChange={setOsResumoOpen} 
        data={selectedOSResumo} 
      />

      <BottomNavigation />
    </div>
  );
}
