import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Users, 
  ClipboardList, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface DashboardMetrics {
  totalOS: number;
  osAbertas: number;
  osConcluidas: number;
  totalClientes: number;
  totalVeiculos: number;
  faturamentoMes: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOS: 0,
    osAbertas: 0,
    osConcluidas: 0,
    totalClientes: 0,
    totalVeiculos: 0,
    faturamentoMes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Buscar nome do usuário
        const { data: profile } = await supabase
          .from('colaboradores')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }

        // Buscar métricas (queries paralelas)
        const [osResult, clientesResult, veiculosResult] = await Promise.all([
          supabase.from('ordens_servico').select('id, status, total', { count: 'exact' }),
          supabase.from('clientes').select('id', { count: 'exact' }),
          supabase.from('veiculos').select('id', { count: 'exact' }),
        ]);

        const os = osResult.data || [];
        const osAbertas = os.filter(o => o.status !== 'entregue' && o.status !== 'cancelada').length;
        const osConcluidas = os.filter(o => o.status === 'entregue').length;
        const faturamento = os
          .filter(o => o.status === 'entregue')
          .reduce((acc, o) => acc + (o.total || 0), 0);

        setMetrics({
          totalOS: osResult.count || 0,
          osAbertas,
          osConcluidas,
          totalClientes: clientesResult.count || 0,
          totalVeiculos: veiculosResult.count || 0,
          faturamentoMes: faturamento,
        });
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Doctor Auto Prime</h1>
              <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{userName}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral da oficina - {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Métricas Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ordens de Serviço
              </CardTitle>
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : metrics.totalOS}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de OS cadastradas
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">
                OS em Andamento
              </CardTitle>
              <Clock className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {loading ? '...' : metrics.osAbertas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Veículos na oficina
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                OS Concluídas
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loading ? '...' : metrics.osConcluidas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Entregas realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes
              </CardTitle>
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : metrics.totalClientes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Veículos
              </CardTitle>
              <Car className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : metrics.totalVeiculos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Veículos registrados
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Faturamento
              </CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {loading ? '...' : formatCurrency(metrics.faturamentoMes)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total em OS entregues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder para próximos módulos */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Módulos em Desenvolvimento</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aqui serão exibidos: Kanban de OS, Agenda de Mecânicos, Alertas e Gráficos de Performance.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
