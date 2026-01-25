import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface OSTotalsCardsProps {
  totalOrcado: number;
  totalAprovado: number;
  totalRecusado: number;
  totalPendente: number;
}

export function OSTotalsCards({
  totalOrcado,
  totalAprovado,
  totalRecusado,
  totalPendente,
}: OSTotalsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-card">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Orçado</p>
          <p className="text-2xl font-bold">{formatCurrency(totalOrcado)}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-emerald-600">Aprovado</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAprovado)}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-red-500/5 border-red-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-red-600">Recusado</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalRecusado)}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-amber-600">Pendente</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendente)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
