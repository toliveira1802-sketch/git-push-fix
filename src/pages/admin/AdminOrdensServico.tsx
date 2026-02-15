import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, Plus, Activity, FileText, Clock, Wrench, CheckCircle, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface OSRow {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  entry_km: number | null;
  total: number | null;
  approved_total: number | null;
  problem_description: string | null;
  clientes: {
    id: string;
    name: string;
    phone: string;
  } | null;
  veiculos: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; bgSolid: string; icon: React.ElementType }> = {
  diagnostico: { label: 'Diagnóstico', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', bgSolid: 'bg-blue-500', icon: Activity },
  orcamento: { label: 'Orçamento', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', bgSolid: 'bg-purple-500', icon: FileText },
  aguardando_aprovacao: { label: 'Aguard. Aprovação', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', bgSolid: 'bg-yellow-500', icon: Clock },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', bgSolid: 'bg-emerald-500', icon: CheckCircle },
  parcial: { label: 'Parcial', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', bgSolid: 'bg-amber-500', icon: Clock },
  em_execucao: { label: 'Em Execução', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', bgSolid: 'bg-orange-500', icon: Wrench },
  concluido: { label: 'Concluído', color: 'bg-green-500/10 text-green-400 border-green-500/30', bgSolid: 'bg-green-500', icon: CheckCircle },
  entregue: { label: 'Entregue', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', bgSolid: 'bg-slate-500', icon: CheckCircle },
};

export default function AdminOrdensServico() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [osList, setOsList] = useState<OSRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrdens();
  }, []);

  const fetchOrdens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          id, order_number, status, created_at, entry_km, total, approved_total, problem_description,
          clientes (id, name, phone),
          veiculos (id, plate, brand, model, year)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOsList((data as any) || []);
    } catch (error) {
      console.error("Erro ao carregar OS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = osList.filter(os => {
    const plate = os.veiculos?.plate?.toLowerCase() || '';
    const clientName = os.clientes?.name?.toLowerCase() || '';
    const orderNum = os.order_number?.toLowerCase() || '';
    const searchLower = search.toLowerCase();

    const matchesSearch = plate.includes(searchLower) ||
      clientName.includes(searchLower) ||
      orderNum.includes(searchLower);
    const matchesFilter = filter === 'todos' || os.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/admin')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="font-semibold text-sm">Ordens de Serviço</h1>
          </div>
          <button
            onClick={() => setLocation('/admin/nova-os')}
            className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs flex items-center gap-1 hover:bg-primary/90"
          >
            <Plus className="w-3 h-3" /> Nova
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Filtros */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 max-w-xs flex items-center gap-2 px-2 py-1.5 bg-muted border border-border rounded-lg">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-foreground outline-none text-sm"
                placeholder="Buscar por placa, cliente ou OS..."
              />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-muted border border-border rounded-lg px-2 py-1 text-foreground text-xs"
            >
              <option value="todos">Todos</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Tabela */}
          {!isLoading && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">OS</th>
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Veículo</th>
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Cliente</th>
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Status</th>
                    <th className="text-right text-xs text-muted-foreground px-3 py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(os => {
                    const c = statusConfig[os.status] || statusConfig.diagnostico;
                    const vehicleDesc = os.veiculos
                      ? `${os.veiculos.brand} ${os.veiculos.model}${os.veiculos.year ? ` ${os.veiculos.year}` : ''}`
                      : '-';
                    const valor = Number(os.approved_total) || Number(os.total) || 0;
                    return (
                      <tr
                        key={os.id}
                        onClick={() => setLocation(`/admin/os/${os.id}`)}
                        className="border-b border-border hover:bg-accent/50 cursor-pointer"
                      >
                        <td className="px-3 py-2 font-mono">{os.order_number}</td>
                        <td className="px-3 py-2">
                          <p className="font-bold">{os.veiculos?.plate || '-'}</p>
                          <p className="text-muted-foreground text-xs">{vehicleDesc}</p>
                        </td>
                        <td className="px-3 py-2">{os.clientes?.name || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${c.color}`}>
                            {c.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-green-400 font-semibold">
                          {valor > 0 ? `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {osList.length === 0 ? 'Nenhuma OS cadastrada' : 'Nenhuma OS encontrada com os filtros aplicados'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
