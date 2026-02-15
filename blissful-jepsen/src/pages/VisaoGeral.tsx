import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { ArrowLeft, TrendingUp, Calendar, Clock, Award, Target, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default function VisaoGeral() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServicos: 0,
    economia: 0,
    pontos: 0,
    nivel: "Bronze",
    mesesCliente: 0
  });
  const [servicosData, setServicosData] = useState<{ mes: string; servicos: number }[]>([]);
  const [ultimosServicos, setUltimosServicos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get client
      const { data: client } = await supabase
        .from('clientes')
        .select('id, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!client) {
        setLoading(false);
        return;
      }

      // Get profile for loyalty info
      const { data: profile } = await supabase
        .from('colaboradores')
        .select('loyalty_points, loyalty_level')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get service orders for this client
      const { data: orders } = await supabase
        .from('ordens_servico')
        .select('id, order_number, total, completed_at, status, veiculos(brand, model)')
        .eq('client_id', (client as any).id)
        .order('created_at', { ascending: false });

      if (orders) {
        const completedOrders = (orders as any[]).filter(o => o.status === 'entregue');
        const totalGasto = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        
        // Calculate months as client
        const createdAt = new Date((client as any).created_at);
        const now = new Date();
        const meses = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000)));

        setStats({
          totalServicos: completedOrders.length,
          economia: Math.round(totalGasto * 0.1), // Estimate 10% savings
          pontos: (profile as any)?.loyalty_points || 0,
          nivel: (profile as any)?.loyalty_level || "Bronze",
          mesesCliente: meses
        });

        // Group orders by month for chart
        const monthlyData: Record<string, number> = {};
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        completedOrders.forEach((order: any) => {
          if (order.completed_at) {
            const date = new Date(order.completed_at);
            const key = monthNames[date.getMonth()];
            monthlyData[key] = (monthlyData[key] || 0) + 1;
          }
        });

        // Get last 6 months
        const now2 = new Date();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
          const key = monthNames[d.getMonth()];
          last6Months.push({ mes: key, servicos: monthlyData[key] || 0 });
        }
        setServicosData(last6Months);

        // Last 3 services
        setUltimosServicos(completedOrders.slice(0, 3).map((o: any) => ({
          id: o.id,
          tipo: "Serviço",
          data: o.completed_at ? new Date(o.completed_at).toLocaleDateString('pt-BR') : '-',
          valor: `R$ ${(o.total || 0).toLocaleString('pt-BR')}`,
          veiculo: o.veiculos ? `${o.veiculos.brand} ${o.veiculos.model}` : '-'
        })));
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="Visão Geral" showHomeButton />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-primary-foreground">Visão Geral</h1>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="bg-primary-foreground/10 border-0 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-primary-foreground/70 text-xs">Serviços</p>
              <p className="text-2xl font-bold text-primary-foreground">{stats.totalServicos}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-primary-foreground/70 text-xs">Economia</p>
              <p className="text-2xl font-bold text-primary-foreground">R${stats.economia}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary-foreground/10 border-0 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-primary-foreground/70 text-xs">Pontos</p>
              <p className="text-2xl font-bold text-primary-foreground">{stats.pontos}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Gráfico de Serviços */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicosData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="servicos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Programa de Fidelidade */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Programa de Fidelidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
                <Badge className="bg-amber-700 text-primary-foreground mt-1">{stats.nivel}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próximo Nível</p>
                <Badge variant="outline" className="border-muted-foreground text-muted-foreground mt-1">
                  {stats.nivel === "Bronze" ? "Prata" : stats.nivel === "Prata" ? "Ouro" : "Platina"}
                </Badge>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{stats.pontos} pontos</span>
                <span className="text-muted-foreground">500 pontos</span>
              </div>
              <Progress value={Math.min((stats.pontos / 500) * 100, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Faltam {Math.max(0, 500 - stats.pontos)} pontos para o próximo nível
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Últimos Serviços */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Últimos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ultimosServicos.length > 0 ? (
              ultimosServicos.map((servico) => (
                <div 
                  key={servico.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{servico.tipo}</p>
                    <p className="text-xs text-muted-foreground">
                      {servico.veiculo} • {servico.data}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">{servico.valor}</span>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">Nenhum serviço realizado</p>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => navigate("/historico")}
            >
              Ver histórico completo
            </Button>
          </CardContent>
        </Card>

        {/* Tempo como Cliente */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground">
          <CardContent className="p-6 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <p className="text-primary-foreground/80 text-sm">Você é nosso cliente há</p>
            <p className="text-3xl font-bold mt-1">{stats.mesesCliente} {stats.mesesCliente === 1 ? 'mês' : 'meses'}</p>
            <p className="text-primary-foreground/70 text-sm mt-2">
              Obrigado pela confiança! 🎉
            </p>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
