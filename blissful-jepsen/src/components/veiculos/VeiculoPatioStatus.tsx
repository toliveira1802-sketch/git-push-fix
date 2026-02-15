import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  FileText, 
  Clock, 
  Package, 
  CheckCircle, 
  Wrench, 
  Car,
  FileCheck,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

// Configuração das etapas do workflow
const workflowConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  agendamento_confirmado: {
    label: "Agendamento Confirmado",
    icon: Clock,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10 border-teal-500/30"
  },
  diagnostico: { 
    label: "Diagnóstico", 
    icon: Search, 
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/30"
  },
  orcamento: { 
    label: "Orçamento", 
    icon: FileText, 
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/30"
  },
  aguardando_aprovacao: { 
    label: "Aguardando Aprovação", 
    icon: Clock, 
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/30"
  },
  aguardando_peca: { 
    label: "Aguardando Peças", 
    icon: Package, 
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/30"
  },
  pronto_iniciar: { 
    label: "Pronto para Iniciar", 
    icon: CheckCircle, 
    color: "text-lime-600",
    bgColor: "bg-lime-500/10 border-lime-500/30"
  },
  em_execucao: { 
    label: "Em Execução", 
    icon: Wrench, 
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10 border-cyan-500/30"
  },
  em_teste: { 
    label: "Em Teste", 
    icon: Car, 
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10 border-indigo-500/30"
  },
  pronto_retirada: { 
    label: "Pronto para Retirada", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 border-emerald-500/30"
  },
};

export interface PatioStatusInfo {
  etapaId: string;
  local?: string;
  osNumero: string;
  servico: string;
  entrada: string;
  previsaoSaida: string;
  valorAprovado?: number;
}

interface VeiculoPatioStatusProps {
  status: PatioStatusInfo;
  onVerOS: () => void;
}

export function VeiculoPatioStatus({ status, onVerOS }: VeiculoPatioStatusProps) {
  const config = workflowConfig[status.etapaId] || workflowConfig.diagnostico;
  const Icon = config.icon;

  return (
    <Card className={cn("mt-3 p-3 border", config.bgColor)}>
      {/* Status principal */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("w-4 h-4", config.color)} />
          </div>
          <div>
            <p className={cn("text-sm font-medium", config.color)}>{config.label}</p>
            {status.local && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {status.local}
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {status.osNumero}
        </Badge>
      </div>

      {/* Detalhes do serviço */}
      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        <p>🔧 {status.servico}</p>
        <p>⏰ Entrada: {status.entrada} → Previsão: {status.previsaoSaida}</p>
        {status.valorAprovado && (
          <p className="text-emerald-600 font-medium">
            ✅ Aprovado: R$ {status.valorAprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>

      {/* Botão para ver OS */}
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full gap-2"
        onClick={onVerOS}
      >
        <FileCheck className="w-4 h-4" />
        Ver Resumo da OS
      </Button>
    </Card>
  );
}
