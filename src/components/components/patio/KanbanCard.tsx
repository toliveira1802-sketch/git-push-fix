import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  GripVertical, 
  User, 
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  ExternalLink,
  MapPin
} from "lucide-react";
import { type VeiculoKanban } from "@/hooks/usePatioKanban";
import { cn } from "@/lib/utils";
import { KanbanCardDetails } from "./KanbanCardDetails";

interface KanbanCardProps {
  veiculo: VeiculoKanban;
  isDragging?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onUpdate?: () => void;
}

// Cores para categorias
const categoriaCores: Record<string, string> = {
  'Revisão': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Troca de Óleo': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  'Freios': 'bg-red-500/10 text-red-600 border-red-500/30',
  'Suspensão': 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  'Motor': 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  'Elétrica': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  'Ar Condicionado': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  'Manutenção': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Geral': 'bg-muted text-muted-foreground border-muted-foreground/30',
};

export function KanbanCard({ veiculo, isDragging, onDragStart, onDragEnd, onUpdate }: KanbanCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const categoriaClasse = categoriaCores[veiculo.categoria] || categoriaCores['Geral'];

  const handleClick = (e: React.MouseEvent) => {
    // Não abrir modal se estiver arrastando
    if (isDragging) return;
    // Evitar abrir se clicou no grip
    if ((e.target as HTMLElement).closest('.drag-handle')) return;
    setShowDetails(true);
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={handleClick}
        className={cn(
          "p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer relative",
          isDragging && "opacity-50 scale-95 cursor-grabbing",
          veiculo.emTerceiros && "border-amber-500/50 bg-amber-500/5"
        )}
      >
        {/* Indicador Em Terceiros */}
        {veiculo.emTerceiros && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-amber-500 text-white text-[9px] gap-1 px-1.5 py-0.5 shadow-md">
              <ExternalLink className="w-2.5 h-2.5" />
              Em Terceiros
            </Badge>
          </div>
        )}
        {/* Header: Placa + OS */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="drag-handle cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            <Car className="w-4 h-4 text-primary" />
            <span className="font-mono font-bold text-sm">{veiculo.placa}</span>
          </div>
          <Badge variant="outline" className="text-[9px] font-mono px-1.5">
            {veiculo.orderNumber}
          </Badge>
        </div>

        {/* Veículo info */}
        <div className="mb-2">
          <p className="text-xs font-medium truncate">
            {veiculo.marca} {veiculo.modelo}
            {veiculo.ano && <span className="text-muted-foreground"> • {veiculo.ano}</span>}
          </p>
          {veiculo.cor && (
            <p className="text-[10px] text-muted-foreground">Cor: {veiculo.cor}</p>
          )}
        </div>

        {/* Descrição do serviço */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 min-h-[32px]">
          {veiculo.servico}
        </p>

        {/* Categoria */}
        <div className="mb-2">
          <Badge 
            variant="outline" 
            className={cn("text-[10px] gap-1", categoriaClasse)}
          >
            <Tag className="w-2.5 h-2.5" />
            {veiculo.categoria}
          </Badge>
        </div>

        {/* Cliente */}
        <div className="flex items-center gap-1.5 mb-2">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs truncate">{veiculo.cliente}</span>
        </div>

        {/* Mecânico e Recurso */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {veiculo.mecanico ? (
            <Badge variant="secondary" className="text-[10px] gap-1 py-0.5">
              <Wrench className="w-2.5 h-2.5" />
              {veiculo.mecanico}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] gap-1 py-0.5 text-muted-foreground border-dashed">
              <Wrench className="w-2.5 h-2.5" />
              Sem mecânico
            </Badge>
          )}
          {veiculo.recurso ? (
            <Badge variant="secondary" className="text-[10px] gap-1 py-0.5 bg-primary/10 text-primary">
              <MapPin className="w-2.5 h-2.5" />
              {veiculo.recurso}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] gap-1 py-0.5 text-muted-foreground border-dashed">
              <MapPin className="w-2.5 h-2.5" />
              Sem local
            </Badge>
          )}
        </div>

        {/* Datas */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{veiculo.entrada}</span>
          </div>
          {veiculo.previsaoEntrega && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>→ {veiculo.previsaoEntrega}</span>
            </div>
          )}
        </div>

        {/* Valor Aprovado */}
        {veiculo.valorAprovado > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-[10px] text-muted-foreground">Aprovado:</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">
                R$ {veiculo.valorAprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <KanbanCardDetails
        veiculo={veiculo}
        open={showDetails}
        onOpenChange={setShowDetails}
        onUpdate={onUpdate}
      />
    </>
  );
}
