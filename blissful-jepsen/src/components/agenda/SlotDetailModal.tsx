import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, User, Wrench, Calendar, Clock, CheckCircle, FlaskConical, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlotDetail {
  id?: string;
  mechanic_id: string;
  mechanicName: string;
  hora: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  vehicle_brand?: string;
  cliente?: string;
  servico?: string;
  osNumber?: string;
  origem: 'patio' | 'agendamento';
  tipo: 'normal' | 'encaixe';
  status: string;
  serviceOrderId?: string;
}

interface SlotDetailModalProps {
  slot: SlotDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove?: (slot: SlotDetail) => void;
  onPronto?: (slot: SlotDetail) => void;
  onEmTeste?: (slot: SlotDetail) => void;
  onBOPeca?: (slot: SlotDetail) => void;
  onFeedback?: (slot: SlotDetail) => void;
}

export function SlotDetailModal({ 
  slot, 
  open, 
  onOpenChange, 
  onRemove,
  onPronto,
  onEmTeste,
  onBOPeca,
  onFeedback
}: SlotDetailModalProps) {
  if (!slot) return null;

  const isAgendamento = slot.origem === 'agendamento';
  const isEncaixe = slot.tipo === 'encaixe';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Detalhes do Slot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={isAgendamento ? "default" : "secondary"} 
              className={cn(
                "gap-1",
                isAgendamento && "bg-teal-500 hover:bg-teal-600"
              )}
            >
              {isAgendamento ? (
                <>
                  <Calendar className="w-3 h-3" />
                  Agendamento Confirmado
                </>
              ) : (
                <>
                  <Wrench className="w-3 h-3" />
                  Veículo no Pátio
                </>
              )}
            </Badge>
            {isEncaixe && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                Encaixe
              </Badge>
            )}
          </div>

          {/* Veículo Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-mono font-bold text-lg">{slot.vehicle_plate || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  {slot.vehicle_brand} {slot.vehicle_model}
                </p>
              </div>
            </div>

            {slot.osNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="font-mono">
                  {slot.osNumber}
                </Badge>
              </div>
            )}
          </div>

          {/* Cliente */}
          {slot.cliente && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{slot.cliente}</span>
            </div>
          )}

          {/* Serviço */}
          {slot.servico && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Serviço</p>
              <p className="text-sm">{slot.servico}</p>
            </div>
          )}

          {/* Horário */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Horário: {slot.hora}</span>
          </div>

          {/* Mecânico */}
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <span>Mecânico: {slot.mechanicName}</span>
          </div>

          {/* Action Buttons - 3 principais */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
              onClick={() => {
                onPronto?.(slot);
                onOpenChange(false);
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Pronto
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border-indigo-500/30"
              onClick={() => {
                onEmTeste?.(slot);
                onOpenChange(false);
              }}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Em Teste
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/30"
              onClick={() => {
                onBOPeca?.(slot);
                onOpenChange(false);
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              B.O Peça
            </Button>
          </div>

          {/* Botão de Feedback + Remover */}
          <div className="flex justify-between gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                onFeedback?.(slot);
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback
            </Button>
            
            <div className="flex gap-2">
              {onRemove && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    onRemove(slot);
                    onOpenChange(false);
                  }}
                >
                  Remover
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
