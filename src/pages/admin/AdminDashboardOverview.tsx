import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Activity, FileText, Clock, Wrench, CheckCircle, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface OSRow {
  id: string;
  order_number: string;
  status: string;
  clientes: { name: string } | null;
  veiculos: { plate: string; brand: string; model: string } | null;
}

const statusConfig: Record<string, { label: string; color: string; bgSolid: string; icon: React.ElementType }> = {
  diagnostico: { label: 'Diagnóstico', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', bgSolid: 'bg-blue-500', icon: Activity },
  orcamento: { label: 'Orçamento', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', bgSolid: 'bg-purple-500', icon: FileText },
  aguardando_aprovacao: { label: 'Aguard. Aprovação', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', bgSolid: 'bg-yellow-500', icon: Clock },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', bgSolid: 'bg-emerald-500', icon: CheckCircle },
  em_execucao: { label: 'Em Execução', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', bgSolid: 'bg-orange-500', icon: Wrench },
  concluido: { label: 'Concluído', color: 'bg-green-500/10 text-green-400 border-green-500/30', bgSolid: 'bg-green-500', icon: CheckCircle },
  entregue: { label: 'Entregue', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', bgSolid: 'bg-slate-500', icon: CheckCircle },
};

const statusList = Object.entries(statusConfig)
  .filter(([k]) => k !== 'entregue')
  .map(([id, v]) => ({ id, ...v }));

export default function AdminDashboardOverview() {
  const [, setLocation] = useLocation();
  const [osList, setOsList] = useState<OSRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOS = async () => {
      try {
        const { data, error } = await supabase
          .from("ordens_servico")
          .select(`
            id, order_number, status,
            clientes (name),
            veiculos (plate, brand, model)
          `)
          .neq('status', 'entregue')
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOsList((data as any) || []);
      } catch (error) {
        console.error("Erro ao carregar OS:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOS();
  }, []);

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 bg-card border-b border-border flex items-center px-4">
          <button onClick={() => setLocation('/admin')} className="text-muted-foreground hover:text-foreground mr-3">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-semibold text-sm">Visão Geral</h1>
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Status Cards */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {statusList.map(s => (
                  <div key={s.id} className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${s.bgSolid}`}></div>
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <p className="text-xl font-bold">
                      {osList.filter(os => os.status === s.id).length}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tabela OS em Andamento */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold text-sm">OS em Andamento ({osList.length})</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground px-3 py-2">OS</th>
                      <th className="text-left text-xs text-muted-foreground px-3 py-2">Veículo</th>
                      <th className="text-left text-xs text-muted-foreground px-3 py-2">Cliente</th>
                      <th className="text-left text-xs text-muted-foreground px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {osList.map(os => {
                      const c = statusConfig[os.status] || statusConfig.diagnostico;
                      const vehicleDesc = os.veiculos
                        ? `${os.veiculos.brand} ${os.veiculos.model}`
                        : '-';
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {osList.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma OS em andamento
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
