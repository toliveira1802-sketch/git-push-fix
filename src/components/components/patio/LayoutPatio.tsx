import { cn } from "@/lib/utils";
import { Car, Wrench, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type StatusArea = "livre" | "ocupado" | "manutencao" | "reservado";

export interface VeiculoInfo {
  placa: string;
  modelo: string;
  cliente: string;
  servico: string;
  entrada: string;
  previsaoSaida: string;
}

export interface Area {
  id: string;
  nome: string;
  tipo: "elevador" | "box" | "area" | "vaga";
  status: StatusArea;
  x: number;
  y: number;
  width: number;
  height: number;
  veiculo?: VeiculoInfo;
}

interface LayoutPatioProps {
  areas: Area[];
  onAreaClick?: (area: Area) => void;
  showGrid?: boolean;
}

const statusConfig: Record<StatusArea, { bg: string; border: string; text: string; icon: React.ElementType }> = {
  livre: { 
    bg: "bg-emerald-500/20", 
    border: "border-emerald-500/50", 
    text: "text-emerald-600",
    icon: CheckCircle
  },
  ocupado: { 
    bg: "bg-red-500/20", 
    border: "border-red-500/50", 
    text: "text-red-600",
    icon: Car
  },
  manutencao: { 
    bg: "bg-amber-500/20", 
    border: "border-amber-500/50", 
    text: "text-amber-600",
    icon: Wrench
  },
  reservado: { 
    bg: "bg-blue-500/20", 
    border: "border-blue-500/50", 
    text: "text-blue-600",
    icon: Clock
  },
};

export function LayoutPatio({ areas, onAreaClick, showGrid = false }: LayoutPatioProps) {
  // Tamanho da grid (colunas x linhas)
  const gridCols = 22;
  const gridRows = 38;
  const cellSize = 24; // pixels

  return (
    <TooltipProvider>
      <div 
        className="relative overflow-auto border border-border rounded-xl bg-muted/30 p-4"
        style={{ 
          minHeight: gridRows * cellSize + 32,
        }}
      >
        {/* Grid de fundo */}
        {showGrid && (
          <div 
            className="absolute inset-4 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: `${cellSize}px ${cellSize}px`,
            }}
          />
        )}

        {/* Áreas */}
        <div className="relative" style={{ width: gridCols * cellSize, height: gridRows * cellSize }}>
          {areas.map((area) => {
            const config = statusConfig[area.status];
            const Icon = config.icon;

            return (
              <Tooltip key={area.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute rounded-lg border-2 cursor-pointer transition-all duration-200",
                      "flex flex-col items-center justify-center gap-1 p-2",
                      "hover:scale-105 hover:z-10 hover:shadow-lg",
                      config.bg,
                      config.border
                    )}
                    style={{
                      left: area.x * cellSize,
                      top: (gridRows - area.y - area.height) * cellSize,
                      width: area.width * cellSize,
                      height: area.height * cellSize,
                    }}
                    onClick={() => onAreaClick?.(area)}
                  >
                    <Icon className={cn("w-4 h-4", config.text)} />
                    <span className={cn(
                      "text-[10px] font-medium text-center leading-tight",
                      config.text
                    )}>
                      {area.nome}
                    </span>
                    {area.veiculo && (
                      <span className="text-[8px] font-mono font-bold mt-0.5">
                        {area.veiculo.placa}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", config.text)} />
                      <span className="font-semibold">{area.nome}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p>Status: <span className={cn("font-medium capitalize", config.text)}>{area.status}</span></p>
                      <p>Tipo: <span className="capitalize">{area.tipo}</span></p>
                      {area.veiculo && (
                        <>
                          <hr className="my-2 border-border" />
                          <p className="font-semibold">{area.veiculo.placa} - {area.veiculo.modelo}</p>
                          <p>Cliente: {area.veiculo.cliente}</p>
                          <p>Serviço: {area.veiculo.servico}</p>
                          <p>Entrada: {area.veiculo.entrada} → Previsão: {area.veiculo.previsaoSaida}</p>
                        </>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded", config.bg, config.border, "border")} />
                <span className="text-xs capitalize text-muted-foreground">{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
