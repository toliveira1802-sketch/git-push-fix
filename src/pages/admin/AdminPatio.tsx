import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Car,
  RefreshCw,
  MapPin,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Flame,
  Star,
  GripVertical,
  Search,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Tipos
interface OSCard {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  cliente: string;
  servicoPrincipal: string;
  status: string;
  entradaNoStatus: Date;
  prioridade: number;
}

// Colunas do Kanban mapeadas para status do banco
const KANBAN_COLUMNS = [
  { id: 'diagnostico', titulo: 'Diagnóstico', subtitulo: 'Aguardando Orçamento', color: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'orcamento', titulo: 'Orçamento', subtitulo: 'Em orçamentação', color: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'aguardando_aprovacao', titulo: 'Aguard. Aprovação', subtitulo: 'Esperando cliente', color: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'aprovado', titulo: 'Aprovado', subtitulo: 'Pronto para iniciar', color: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: 'em_execucao', titulo: 'Em Execução', subtitulo: 'Mecânico trabalhando', color: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'concluido', titulo: 'Concluído', subtitulo: 'Teste / Quality Check', color: 'bg-indigo-500/10 border-indigo-500/30' },
  { id: 'entregue', titulo: 'Entregue', subtitulo: 'Finalizado', color: 'bg-slate-500/10 border-slate-500/30' },
];

// Marcas VIP para prioridade
const VIP_BRANDS = ['volkswagen', 'vw', 'audi'];

// Componente de Cronômetro
function Cronometro({ entradaNoStatus }: { entradaNoStatus: Date }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const diff = now.getTime() - entradaNoStatus.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setElapsed(`${days}d ${remainingHours}h ${minutes}m`);
      } else {
        setElapsed(`${hours}h ${minutes}m`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [entradaNoStatus]);

  return <span>{elapsed}</span>;
}

// Componente do Card da OS
function OSKanbanCard({
  os,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick
}: {
  os: OSCard;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const horasNoStatus = (Date.now() - os.entradaNoStatus.getTime()) / (1000 * 60 * 60);
  const isGargalo = horasNoStatus > 48;
  const isPrioridade = os.prioridade === 1;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border-2 bg-card hover:shadow-lg transition-all cursor-grab active:cursor-grabbing relative",
        isDragging && "opacity-50 scale-95",
        isGargalo ? "border-red-500 shadow-red-500/20 shadow-md" : "border-border",
        isPrioridade && "ring-2 ring-amber-400/50"
      )}
    >
      {/* Indicadores de Alerta/Prioridade */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {isGargalo && (
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        {isPrioridade && (
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Cabeçalho: Modelo + Placa */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="font-bold text-sm leading-tight">{os.modelo}</p>
            <Badge variant="outline" className="text-[10px] font-mono mt-0.5">
              {os.placa}
            </Badge>
          </div>
        </div>
        <Car className="w-5 h-5 text-primary shrink-0" />
      </div>

      {/* Corpo: Cliente + Serviço */}
      <div className="mb-3 space-y-1">
        <p className="text-xs text-muted-foreground truncate">
          {os.cliente}
        </p>
        <p className="text-xs font-medium text-foreground line-clamp-2">
          {os.servicoPrincipal}
        </p>
      </div>

      {/* Rodapé: Cronômetro */}
      <div className={cn(
        "flex items-center gap-1.5 text-xs py-1.5 px-2 rounded-md",
        isGargalo ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"
      )}>
        <Clock className="w-3.5 h-3.5" />
        <Cronometro entradaNoStatus={os.entradaNoStatus} />
        {isGargalo && <span className="font-medium">GARGALO</span>}
      </div>
    </div>
  );
}

export default function MonitoramentoPatio() {
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [osData, setOsData] = useState<OSCard[]>([]);
  const [draggedOS, setDraggedOS] = useState<{ os: OSCard; fromColumn: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrdens = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          id, order_number, status, created_at, updated_at, problem_description,
          clientes (id, name),
          veiculos (id, plate, brand, model)
        `)
        .not('status', 'eq', 'entregue')
        .order("created_at", { ascending: false });

      if (error) throw error;

      const cards: OSCard[] = (data || []).map((os: any) => {
        const brand = os.veiculos?.brand?.toLowerCase() || '';
        const isVIP = VIP_BRANDS.some(v => brand.includes(v));

        return {
          id: os.id,
          placa: os.veiculos?.plate || '-',
          modelo: os.veiculos?.model || '-',
          marca: os.veiculos?.brand || '-',
          cliente: os.clientes?.name || '-',
          servicoPrincipal: os.problem_description || 'Sem descrição',
          status: os.status,
          entradaNoStatus: new Date(os.updated_at || os.created_at),
          prioridade: isVIP ? 1 : 0,
        };
      });

      setOsData(cards);
    } catch (error) {
      console.error("Erro ao carregar OS:", error);
      toast.error("Erro ao carregar dados do pátio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdens();
  }, [fetchOrdens]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrdens, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrdens]);

  // Agrupar OS por coluna
  const osPorColuna = useMemo(() => {
    const grouped: Record<string, OSCard[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      grouped[col.id] = osData
        .filter(os => os.status === col.id)
        .filter(os =>
          filtroPlaca.trim() === '' ||
          os.placa.toLowerCase().includes(filtroPlaca.toLowerCase()) ||
          os.cliente.toLowerCase().includes(filtroPlaca.toLowerCase())
        );
    });
    return grouped;
  }, [osData, filtroPlaca]);

  // Estatísticas
  const totalOS = osData.length;
  const totalGargalos = osData.filter(os => {
    const horasNoStatus = (Date.now() - os.entradaNoStatus.getTime()) / (1000 * 60 * 60);
    return horasNoStatus > 48;
  }).length;
  const totalPrioridade = osData.filter(os => os.prioridade === 1).length;

  // Handlers Drag and Drop
  const handleDragStart = (os: OSCard, fromColumn: string) => {
    setDraggedOS({ os, fromColumn });
  };

  const handleDragEnd = () => {
    setDraggedOS(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    if (!draggedOS) return;

    if (draggedOS.fromColumn === toColumn) {
      setDraggedOS(null);
      setDragOverColumn(null);
      return;
    }

    // Atualizar estado local imediatamente (optimistic update)
    setOsData(prev => prev.map(os =>
      os.id === draggedOS.os.id
        ? { ...os, status: toColumn, entradaNoStatus: new Date() }
        : os
    ));

    setDraggedOS(null);
    setDragOverColumn(null);

    // Persistir no banco
    try {
      const { error } = await supabase
        .from("ordens_servico")
        .update({ status: toColumn, updated_at: new Date().toISOString() })
        .eq("id", draggedOS.os.id);

      if (error) throw error;

      // Registrar no histórico
      await supabase.from("historico_ordem_servico").insert({
        service_order_id: draggedOS.os.id,
        event_type: "status_change",
        description: `Status alterado de "${draggedOS.fromColumn}" para "${toColumn}" via Kanban`,
      });

      toast.success(`OS movida para ${KANBAN_COLUMNS.find(c => c.id === toColumn)?.titulo || toColumn}`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao salvar mudança de status");
      // Reverter em caso de erro
      fetchOrdens();
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchOrdens();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Monitoramento de Oficina
              </h1>
              <p className="text-sm text-muted-foreground">Kanban Board - Workflow de Atendimento</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOS}</p>
                <p className="text-xs text-muted-foreground">No Pátio</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{totalGargalos}</p>
                <p className="text-xs text-muted-foreground">Gargalos (&gt;48h)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{totalPrioridade}</p>
                <p className="text-xs text-muted-foreground">Prioridade VIP</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">{osPorColuna['concluido']?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-muted-foreground">Gargalo (&gt;48h no status)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
              <Flame className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-muted-foreground">Prioridade VIP (VW/Audi)</span>
          </div>
        </div>

        {/* Filtro */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa ou cliente..."
            value={filtroPlaca}
            onChange={(e) => setFiltroPlaca(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Loading */}
        {loading && osData.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Kanban Board */}
        {(!loading || osData.length > 0) && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {KANBAN_COLUMNS.map((column) => (
                <Card
                  key={column.id}
                  className={cn(
                    "w-64 shrink-0 border-2 transition-all",
                    column.color,
                    dragOverColumn === column.id && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <CardHeader className="pb-2 px-3 pt-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold">{column.titulo}</p>
                        <p className="text-[10px] font-normal text-muted-foreground">{column.subtitulo}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs px-2">
                        {osPorColuna[column.id]?.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2.5 pr-1">
                        {(osPorColuna[column.id]?.length || 0) === 0 ? (
                          <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-muted rounded-lg">
                            {dragOverColumn === column.id ? 'Solte aqui' : 'Nenhuma OS'}
                          </div>
                        ) : (
                          osPorColuna[column.id]?.map((os) => (
                            <OSKanbanCard
                              key={os.id}
                              os={os}
                              isDragging={draggedOS?.os.id === os.id}
                              onDragStart={() => handleDragStart(os, column.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => navigate(`/admin/os/${os.id}`)}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
