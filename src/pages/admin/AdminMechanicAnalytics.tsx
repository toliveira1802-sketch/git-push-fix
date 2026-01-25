import { useState, useEffect } from "react";
import { 
  Loader2, 
  TrendingUp,
  User,
  Calendar,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Mechanic {
  id: string;
  name: string;
  specialty: string | null;
}

interface FeedbackData {
  id: string;
  mechanic_id: string;
  feedback_date: string;
  performance_score: number;
  punctuality_score: number;
  quality_score: number;
}

interface ChartData {
  date: string;
  performance: number;
  punctuality: number;
  quality: number;
  average: number;
}

interface MechanicStats {
  mechanicId: string;
  name: string;
  avgPerformance: number;
  avgPunctuality: number;
  avgQuality: number;
  totalFeedbacks: number;
  trend: "up" | "down" | "stable";
}

const AdminMechanicAnalytics = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMechanic, setSelectedMechanic] = useState<string>("all");
  const [period, setPeriod] = useState<string>("30");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = format(subDays(new Date(), parseInt(period)), "yyyy-MM-dd");

      const [mechanicsRes, feedbacksRes] = await Promise.all([
        supabase
          .from("mechanics")
          .select("id, name, specialty")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("mechanic_daily_feedback")
          .select("*")
          .gte("feedback_date", startDate)
          .order("feedback_date", { ascending: true }),
      ]);

      if (mechanicsRes.error) throw mechanicsRes.error;
      if (feedbacksRes.error) throw feedbacksRes.error;

      setMechanics(mechanicsRes.data || []);
      setFeedbacks(feedbacksRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (): ChartData[] => {
    const filtered = selectedMechanic === "all" 
      ? feedbacks 
      : feedbacks.filter(f => f.mechanic_id === selectedMechanic);

    const grouped: Record<string, { performance: number[]; punctuality: number[]; quality: number[] }> = {};

    filtered.forEach(f => {
      const date = f.feedback_date;
      if (!grouped[date]) {
        grouped[date] = { performance: [], punctuality: [], quality: [] };
      }
      grouped[date].performance.push(f.performance_score);
      grouped[date].punctuality.push(f.punctuality_score);
      grouped[date].quality.push(f.quality_score);
    });

    return Object.entries(grouped).map(([date, scores]) => {
      const avgPerf = scores.performance.reduce((a, b) => a + b, 0) / scores.performance.length;
      const avgPunct = scores.punctuality.reduce((a, b) => a + b, 0) / scores.punctuality.length;
      const avgQual = scores.quality.reduce((a, b) => a + b, 0) / scores.quality.length;
      
      return {
        date: format(new Date(date), "dd/MM", { locale: ptBR }),
        performance: Number(avgPerf.toFixed(1)),
        punctuality: Number(avgPunct.toFixed(1)),
        quality: Number(avgQual.toFixed(1)),
        average: Number(((avgPerf + avgPunct + avgQual) / 3).toFixed(1)),
      };
    });
  };

  const getMechanicStats = (): MechanicStats[] => {
    return mechanics.map(mechanic => {
      const mechanicFeedbacks = feedbacks.filter(f => f.mechanic_id === mechanic.id);
      
      if (mechanicFeedbacks.length === 0) {
        return {
          mechanicId: mechanic.id,
          name: mechanic.name,
          avgPerformance: 0,
          avgPunctuality: 0,
          avgQuality: 0,
          totalFeedbacks: 0,
          trend: "stable" as const,
        };
      }

      const avgPerformance = mechanicFeedbacks.reduce((a, b) => a + b.performance_score, 0) / mechanicFeedbacks.length;
      const avgPunctuality = mechanicFeedbacks.reduce((a, b) => a + b.punctuality_score, 0) / mechanicFeedbacks.length;
      const avgQuality = mechanicFeedbacks.reduce((a, b) => a + b.quality_score, 0) / mechanicFeedbacks.length;

      // Calculate trend based on last 7 days vs previous 7 days
      const recentFeedbacks = mechanicFeedbacks.slice(-7);
      const olderFeedbacks = mechanicFeedbacks.slice(-14, -7);

      let trend: "up" | "down" | "stable" = "stable";
      if (recentFeedbacks.length > 0 && olderFeedbacks.length > 0) {
        const recentAvg = recentFeedbacks.reduce((a, b) => a + (b.performance_score + b.punctuality_score + b.quality_score) / 3, 0) / recentFeedbacks.length;
        const olderAvg = olderFeedbacks.reduce((a, b) => a + (b.performance_score + b.punctuality_score + b.quality_score) / 3, 0) / olderFeedbacks.length;
        
        if (recentAvg > olderAvg + 0.3) trend = "up";
        else if (recentAvg < olderAvg - 0.3) trend = "down";
      }

      return {
        mechanicId: mechanic.id,
        name: mechanic.name,
        avgPerformance: Number(avgPerformance.toFixed(1)),
        avgPunctuality: Number(avgPunctuality.toFixed(1)),
        avgQuality: Number(avgQuality.toFixed(1)),
        totalFeedbacks: mechanicFeedbacks.length,
        trend,
      };
    }).sort((a, b) => {
      const avgA = (a.avgPerformance + a.avgPunctuality + a.avgQuality) / 3;
      const avgB = (b.avgPerformance + b.avgPunctuality + b.avgQuality) / 3;
      return avgB - avgA;
    });
  };

  const getBarData = () => {
    return getMechanicStats()
      .filter(s => s.totalFeedbacks > 0)
      .map(s => ({
        name: s.name.split(" ")[0],
        média: Number(((s.avgPerformance + s.avgPunctuality + s.avgQuality) / 3).toFixed(1)),
        feedbacks: s.totalFeedbacks,
      }));
  };

  const chartData = getChartData();
  const mechanicStats = getMechanicStats();
  const barData = getBarData();

  const overallAvg = mechanicStats.length > 0
    ? mechanicStats.reduce((a, b) => a + (b.avgPerformance + b.avgPunctuality + b.avgQuality) / 3, 0) / mechanicStats.filter(s => s.totalFeedbacks > 0).length
    : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Mecânicos</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <TrendingUp className="w-4 h-4" />
              Desempenho ao longo do tempo
            </p>
          </div>
          
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] bg-muted/50 border-none">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-none">
                <User className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os mecânicos</SelectItem>
                {mechanics.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isNaN(overallAvg) ? "—" : overallAvg.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Média Geral</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mechanics.length}</p>
                  <p className="text-xs text-muted-foreground">Mecânicos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{feedbacks.length}</p>
                  <p className="text-xs text-muted-foreground">Feedbacks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{period}d</p>
                  <p className="text-xs text-muted-foreground">Período</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Line Chart - Evolution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Evolução ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  Nenhum dado disponível para o período selecionado
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="performance" 
                      name="Performance"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="punctuality" 
                      name="Pontualidade"
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quality" 
                      name="Qualidade"
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Ranking */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Ranking por Média</CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  Nenhum dado disponível
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      domain={[0, 5]} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar 
                      dataKey="média" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mechanics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento por Mecânico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mecânico</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Performance</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Pontualidade</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Qualidade</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Média</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanicStats.map((stat) => {
                    const avg = (stat.avgPerformance + stat.avgPunctuality + stat.avgQuality) / 3;
                    return (
                      <tr key={stat.mechanicId} className="border-b border-border/30 last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-foreground">{stat.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${stat.avgPerformance >= 4 ? "text-emerald-500" : stat.avgPerformance >= 3 ? "text-amber-500" : "text-red-500"}`}>
                            {stat.totalFeedbacks > 0 ? stat.avgPerformance : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${stat.avgPunctuality >= 4 ? "text-emerald-500" : stat.avgPunctuality >= 3 ? "text-amber-500" : "text-red-500"}`}>
                            {stat.totalFeedbacks > 0 ? stat.avgPunctuality : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${stat.avgQuality >= 4 ? "text-emerald-500" : stat.avgQuality >= 3 ? "text-amber-500" : "text-red-500"}`}>
                            {stat.totalFeedbacks > 0 ? stat.avgQuality : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${avg >= 4 ? "text-emerald-500" : avg >= 3 ? "text-amber-500" : "text-red-500"}`}>
                            {stat.totalFeedbacks > 0 ? avg.toFixed(1) : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {stat.totalFeedbacks > 0 ? (
                            <span className={`text-lg ${stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                              {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMechanicAnalytics;
