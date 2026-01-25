import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Wrench, 
  Users, 
  Target,
  BarChart3,
  RefreshCw,
  Award,
  Zap,
  LineChart as LineChartIcon
} from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface MechanicProductivity {
  id: string;
  name: string;
  osCompleted: number;
  avgTime: number;
  efficiency: number;
  trend: "up" | "down" | "stable";
}

interface DailyData {
  date: string;
  osTotal: number;
  avgTime: number;
}

type PeriodFilter = "hoje" | "semana" | "mes";

export default function AdminProdutividade() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>("semana");
  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<MechanicProductivity[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  // Mock data for demonstration
  const mockMechanics: MechanicProductivity[] = [
    { id: "1", name: "Carlos Silva", osCompleted: 28, avgTime: 2.5, efficiency: 92, trend: "up" },
    { id: "2", name: "João Santos", osCompleted: 24, avgTime: 3.1, efficiency: 85, trend: "stable" },
    { id: "3", name: "Pedro Oliveira", osCompleted: 22, avgTime: 2.8, efficiency: 88, trend: "up" },
    { id: "4", name: "Lucas Ferreira", osCompleted: 19, avgTime: 3.5, efficiency: 78, trend: "down" },
    { id: "5", name: "Marcos Lima", osCompleted: 26, avgTime: 2.3, efficiency: 95, trend: "up" },
  ];

  const mockDailyData: DailyData[] = [
    { date: "Seg", osTotal: 18, avgTime: 2.8 },
    { date: "Ter", osTotal: 22, avgTime: 2.5 },
    { date: "Qua", osTotal: 20, avgTime: 2.7 },
    { date: "Qui", osTotal: 25, avgTime: 2.4 },
    { date: "Sex", osTotal: 28, avgTime: 2.2 },
    { date: "Sáb", osTotal: 15, avgTime: 3.0 },
  ];

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real mechanics from database
      const { data: mechanicsData } = await supabase
        .from("mechanics")
        .select("*")
        .eq("is_active", true);

      if (mechanicsData && mechanicsData.length > 0) {
        // Map real mechanics with mock productivity data
        const mappedMechanics = mechanicsData.map((m, index) => ({
          id: m.id,
          name: m.name,
          osCompleted: mockMechanics[index % mockMechanics.length].osCompleted,
          avgTime: mockMechanics[index % mockMechanics.length].avgTime,
          efficiency: mockMechanics[index % mockMechanics.length].efficiency,
          trend: mockMechanics[index % mockMechanics.length].trend,
        }));
        setMechanics(mappedMechanics);
      } else {
        setMechanics(mockMechanics);
      }

      setDailyData(mockDailyData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMechanics(mockMechanics);
      setDailyData(mockDailyData);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const totalOS = mechanics.reduce((acc, m) => acc + m.osCompleted, 0);
  const avgEfficiency = mechanics.length > 0 
    ? Math.round(mechanics.reduce((acc, m) => acc + m.efficiency, 0) / mechanics.length)
    : 0;
  const avgTimeGlobal = mechanics.length > 0
    ? (mechanics.reduce((acc, m) => acc + m.avgTime, 0) / mechanics.length).toFixed(1)
    : "0";
  const topPerformer = mechanics.reduce((prev, current) => 
    (prev.efficiency > current.efficiency) ? prev : current, mechanics[0]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <span className="h-4 w-4 text-muted-foreground">—</span>;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-500";
    if (efficiency >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Produtividade
                </h1>
                <p className="text-muted-foreground">
                  Análise de performance da equipe
                </p>
              </div>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigate("/admin/analytics-mecanicos")}
                  >
                    <LineChartIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Analytics Detalhado</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalOS}</p>
                  <p className="text-sm text-muted-foreground">OS Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgEfficiency}%</p>
                  <p className="text-sm text-muted-foreground">Eficiência Média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgTimeGlobal}h</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio/OS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold truncate max-w-[120px]">{topPerformer?.name?.split(" ")[0]}</p>
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                OS por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="osTotal" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tempo Médio por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Mechanics Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ranking de Mecânicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mechanics
                .sort((a, b) => b.efficiency - a.efficiency)
                .map((mechanic, index) => (
                  <div key={mechanic.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{mechanic.name}</p>
                        {getTrendIcon(mechanic.trend)}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {mechanic.osCompleted} OS
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ~{mechanic.avgTime}h/OS
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress value={mechanic.efficiency} className="h-2" />
                      </div>
                      <Badge variant="outline" className={getEfficiencyColor(mechanic.efficiency)}>
                        {mechanic.efficiency}%
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
