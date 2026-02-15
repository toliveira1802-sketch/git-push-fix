import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Car, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';

interface OSKanbanItem {
  id: string;
  order_number: string;
  status: string;
  client_name: string;
  vehicle_info: string;
  created_at: string;
  priority: string | null;
}

interface DashboardMetrics {
  veiculosNoPatio: number;
  osAbertas: number;
  osEmAndamento: number;
  osFinalizadas: number;
  faturadoMes: number;
  agendamentosHoje: number;
}

export default function DashboardCockpit() {
  const [, setLocation] = useLocation();
  const [osItems, setOsItems] = useState<OSKanbanItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    veiculosNoPatio: 0,
    osAbertas: 0,
    osEmAndamento: 0,
    osFinalizadas: 0,
    faturadoMes: 0,
    agendamentosHoje: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch OS data with client and vehicle info
      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          order_number,
          status,
          priority,
          created_at,
          clientes (name),
          veiculos (plate, model, brand)
        `)
        .in('status', ['aberta', 'em_andamento', 'orcamento_enviado', 'orcamento_aprovado', 'em_execucao'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (!osError && osData) {
        const mappedOS = osData.map((os: any) => ({
          id: os.id,
          order_number: os.order_number,
          status: os.status,
          client_name: os.clientes?.name || 'Cliente',
          vehicle_info: os.veiculos ? `${os.veiculos.brand} ${os.veiculos.model} - ${os.veiculos.plate}` : 'Veículo',
          created_at: os.created_at,
          priority: os.priority,
        }));
        setOsItems(mappedOS);
      }

      // Fetch metrics
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [veiculosRes, osAbertasRes, osAndamentoRes, osFinalizadasRes, agendamentosRes] = await Promise.all([
        supabase.from('ordens_servico').select('id', { count: 'exact' }).in('status', ['aberta', 'em_andamento', 'em_execucao']),
        supabase.from('ordens_servico').select('id', { count: 'exact' }).eq('status', 'aberta'),
        supabase.from('ordens_servico').select('id', { count: 'exact' }).eq('status', 'em_andamento'),
        supabase.from('ordens_servico').select('total', { count: 'exact' }).eq('status', 'entregue').gte('completed_at', startOfMonth),
        supabase.from('agendamentos').select('id', { count: 'exact' }).eq('scheduled_date', today),
      ]);

      // Calculate faturado do mês
      const { data: faturadoData } = await supabase
        .from('ordens_servico')
        .select('total')
        .eq('status', 'entregue')
        .gte('completed_at', startOfMonth);

      const faturadoMes = faturadoData?.reduce((sum, os) => sum + (os.total || 0), 0) || 0;

      setMetrics({
        veiculosNoPatio: veiculosRes.count || 0,
        osAbertas: osAbertasRes.count || 0,
        osEmAndamento: osAndamentoRes.count || 0,
        osFinalizadas: osFinalizadasRes.count || 0,
        faturadoMes,
        agendamentosHoje: agendamentosRes.count || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'em_andamento': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'orcamento_enviado': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'orcamento_aprovado': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'em_execucao': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'em_andamento': return 'Em Andamento';
      case 'orcamento_enviado': return 'Orçamento Enviado';
      case 'orcamento_aprovado': return 'Aprovado';
      case 'em_execucao': return 'Em Execução';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Group OS by status for Kanban
  const kanbanColumns = [
    { key: 'aberta', title: 'Abertas', icon: Clock },
    { key: 'em_andamento', title: 'Em Andamento', icon: Wrench },
    { key: 'orcamento_enviado', title: 'Orçamento Enviado', icon: DollarSign },
    { key: 'orcamento_aprovado', title: 'Aprovados', icon: CheckCircle },
    { key: 'em_execucao', title: 'Em Execução', icon: Car },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard Cockpit</h1>
          <p className="text-muted-foreground">Visão Geral da Oficina</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Car className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.veiculosNoPatio}</p>
                  <p className="text-xs text-muted-foreground">No Pátio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.osAbertas}</p>
                  <p className="text-xs text-muted-foreground">OS Abertas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Wrench className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.osEmAndamento}</p>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.osFinalizadas}</p>
                  <p className="text-xs text-muted-foreground">Finalizadas (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(metrics.faturadoMes)}</p>
                  <p className="text-xs text-muted-foreground">Faturado (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.agendamentosHoje}</p>
                  <p className="text-xs text-muted-foreground">Agendamentos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setLocation('/admin/nova-os')} className="gradient-primary">
            <Wrench className="w-4 h-4 mr-2" />
            Nova OS
          </Button>
          <Button variant="outline" onClick={() => setLocation('/admin/patio')}>
            <Car className="w-4 h-4 mr-2" />
            Ver Pátio
          </Button>
          <Button variant="outline" onClick={() => setLocation('/admin/agendamentos')}>
            <Calendar className="w-4 h-4 mr-2" />
            Agendamentos
          </Button>
          <Button variant="outline" onClick={() => setLocation('/admin/clientes')}>
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </Button>
        </div>

        {/* Kanban Board */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Kanban - Ordens de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {kanbanColumns.map((column) => {
                  const Icon = column.icon;
                  const columnItems = osItems.filter(os => os.status === column.key);
                  
                  return (
                    <div key={column.key} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{column.title}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {columnItems.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {columnItems.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            Nenhuma OS
                          </p>
                        ) : (
                          columnItems.map((os) => (
                            <Card 
                              key={os.id} 
                              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setLocation(`/admin/os/${os.id}`)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-bold text-primary">
                                    {os.order_number}
                                  </span>
                                  {os.priority === 'alta' && (
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  )}
                                </div>
                                <p className="text-sm font-medium truncate">{os.client_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{os.vehicle_info}</p>
                                <Badge className={`text-xs ${getStatusColor(os.status)}`}>
                                  {getStatusLabel(os.status)}
                                </Badge>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
