import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  User,
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Phone,
  ExternalLink,
  FileText,
  MapPin,
  Palette,
} from "lucide-react";
import { type VeiculoKanban } from "@/hooks/usePatioKanban";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KanbanCardDetailsProps {
  veiculo: VeiculoKanban | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface Mechanic {
  id: string;
  name: string;
}

// Recursos fixos do pátio
const RECURSOS_PATIO = [
  { id: 'box-a', nome: 'Box A' },
  { id: 'box-b', nome: 'Box B' },
  { id: 'box-c', nome: 'Box C' },
  { id: 'box-d', nome: 'Box D' },
  { id: 'box-e', nome: 'Box E' },
  { id: 'elevador-1', nome: 'Elevador 1' },
  { id: 'elevador-2', nome: 'Elevador 2' },
  { id: 'elevador-3', nome: 'Elevador 3' },
  { id: 'recepcao', nome: 'Recepção' },
  { id: 'externo', nome: 'Área Externa' },
];

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

export function KanbanCardDetails({ veiculo, open, onOpenChange, onUpdate }: KanbanCardDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string | null>(null);
  const [selectedRecurso, setSelectedRecurso] = useState<string | null>(null);

  // Carregar mecânicos
  useEffect(() => {
    const fetchMechanics = async () => {
      const { data } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (data) setMechanics(data);
    };
    fetchMechanics();
  }, []);

  // Sincronizar valores quando veiculo mudar
  useEffect(() => {
    if (veiculo) {
      setSelectedMechanic(veiculo.mecanicoId || null);
      setSelectedRecurso(veiculo.recurso || null);
    }
  }, [veiculo]);

  if (!veiculo) return null;

  const categoriaClasse = categoriaCores[veiculo.categoria] || categoriaCores['Geral'];

  const handleToggleTerceiros = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ em_terceiros: !veiculo.emTerceiros })
        .eq('id', veiculo.id);

      if (error) throw error;

      toast.success(veiculo.emTerceiros ? 'Veículo removido de terceiros' : 'Veículo marcado como em terceiros');
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMechanicChange = async (mechanicId: string) => {
    setIsUpdating(true);
    try {
      const newMechanicId = mechanicId === 'none' ? null : mechanicId;
      const { error } = await supabase
        .from('service_orders')
        .update({ mechanic_id: newMechanicId })
        .eq('id', veiculo.id);

      if (error) throw error;

      setSelectedMechanic(newMechanicId);
      toast.success('Mecânico atualizado');
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar mecânico:', error);
      toast.error('Erro ao atualizar mecânico');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecursoChange = async (recurso: string) => {
    setIsUpdating(true);
    try {
      const newRecurso = recurso === 'none' ? null : recurso;
      const { error } = await supabase
        .from('service_orders')
        .update({ recurso: newRecurso })
        .eq('id', veiculo.id);

      if (error) throw error;

      setSelectedRecurso(newRecurso);
      toast.success('Local atualizado');
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar recurso:', error);
      toast.error('Erro ao atualizar local');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calcular dias no pátio
  const diasNoPatio = Math.floor((new Date().getTime() - veiculo.entradaData.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-mono text-xl">{veiculo.placa}</span>
              <p className="text-sm font-normal text-muted-foreground">
                OS: {veiculo.orderNumber}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Em Terceiros Toggle */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            veiculo.emTerceiros && "bg-amber-500/10 border-amber-500/30"
          )}>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-500" />
              <Label htmlFor="terceiros" className="cursor-pointer">
                Em Terceiros (serviço externo)
              </Label>
            </div>
            <Switch
              id="terceiros"
              checked={veiculo.emTerceiros}
              onCheckedChange={handleToggleTerceiros}
              disabled={isUpdating}
            />
          </div>

          {/* Mecânico e Recurso Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Mecânico
              </Label>
              <Select
                value={selectedMechanic || 'none'}
                onValueChange={handleMechanicChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecionar mecânico" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="none">Sem mecânico</SelectItem>
                  {mechanics.map((mec) => (
                    <SelectItem key={mec.id} value={mec.id}>
                      {mec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Local / Recurso
              </Label>
              <Select
                value={selectedRecurso || 'none'}
                onValueChange={handleRecursoChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecionar local" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="none">Sem local</SelectItem>
                  {RECURSOS_PATIO.map((rec) => (
                    <SelectItem key={rec.id} value={rec.nome}>
                      {rec.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Veículo Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Car className="w-4 h-4" />
              Veículo
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Marca/Modelo</span>
                <p className="font-medium">{veiculo.marca} {veiculo.modelo}</p>
              </div>
              {veiculo.ano && (
                <div>
                  <span className="text-muted-foreground text-xs">Ano</span>
                  <p className="font-medium">{veiculo.ano}</p>
                </div>
              )}
              {veiculo.cor && (
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-muted-foreground" />
                  <span>{veiculo.cor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cliente Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{veiculo.cliente}</p>
              {veiculo.clienteTelefone && veiculo.clienteTelefone !== '(00) 00000-0000' && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <a 
                    href={`tel:${veiculo.clienteTelefone}`}
                    className="text-primary hover:underline"
                  >
                    {veiculo.clienteTelefone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Serviço */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Serviço
            </h3>
            <Badge 
              variant="outline" 
              className={cn("text-xs gap-1 mb-2", categoriaClasse)}
            >
              <Tag className="w-3 h-3" />
              {veiculo.categoria}
            </Badge>
            <p className="text-sm">{veiculo.servico}</p>
          </div>

          <Separator />

          {/* Datas e Tempo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Entrada</span>
              </div>
              <p className="text-sm font-medium">{veiculo.entrada}</p>
            </div>
            
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Dias no Pátio</span>
              </div>
              <p className={cn(
                "text-sm font-bold",
                diasNoPatio > 7 ? "text-destructive" : diasNoPatio > 3 ? "text-warning" : "text-emerald-500"
              )}>
                {diasNoPatio} {diasNoPatio === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </div>

          {veiculo.previsaoEntrega && (
            <div className="p-3 rounded-lg border bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Previsão de Entrega</span>
              </div>
              <p className="text-sm font-medium text-primary">{veiculo.previsaoEntrega}</p>
            </div>
          )}

          {/* Valor */}
          {veiculo.total > 0 && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium">Valor Total</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">
                  R$ {veiculo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`/admin/os/${veiculo.id}`, '_blank')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver OS Completa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}