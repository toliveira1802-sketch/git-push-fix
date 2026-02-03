import { useState, useEffect } from "react";
import { 
  Loader2, 
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Activity,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
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
import { useNavigate } from "@/hooks/useNavigate";

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
  const navigate = useNavigate();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMechanic, setSelectedMechanic] = useState<string>("all");
  const [period, setPeriod] = useState<string>("30");
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    evolution: true,
    ranking: true,
    details: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = format(subDays(new Date(), parseInt(period)), "yyyy-MM-dd");

      const [mechanicsRes, feedbacksRes] = await Promise.all([
        supabase
          .from("mecanicos")
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
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin')} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Analytics Mecânicos
                  </h1>
                  <p className="text-sm text-muted-foreground">Desempenho ao longo do tempo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[120px] bg-secondary border-none">
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
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Filtro de Mecânico */}
        <div className="container py-3">
          <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
            <SelectTrigger className="w-full sm:w-[200px] bg-secondary border-none">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Todos os mecânicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os mecânicos</SelectItem>
              {mechanics.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="container pb-6 space-y-4">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-lovable"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('stats')}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Resumo</h2>
              </div>
              {expandedSections.stats ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.stats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Média Geral</span>
                      </div>
                      <p className="text-2xl font-bold">{isNaN(overallAvg) ? "—" : overallAvg.toFixed(1)}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-muted-foreground">Mecânicos</span>
                      </div>
                      <p className="text-2xl font-bold">{mechanics.length}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Feedbacks</span>
                      </div>
                      <p className="text-2xl font-bold">{feedbacks.length}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-muted-foreground">Período</span>
                      </div>
                      <p className="text-2xl font-bold">{period}d</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Evolution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-lovable"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('evolution')}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Evolução ao Longo do Tempo</h2>
              </div>
              {expandedSections.evolution ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.evolution && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4">
                    {chartData.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">
                        Nenhum dado disponível para o período selecionado
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="performance" name="Performance" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                          <Line type="monotone" dataKey="punctuality" name="Pontualidade" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                          <Line type="monotone" dataKey="quality" name="Qualidade" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Ranking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-lovable"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('ranking')}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Ranking por Média</h2>
              </div>
              {expandedSections.ranking ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.ranking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4">
                    {barData.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">Nenhum dado disponível</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Bar dataKey="média" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Details Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-lovable"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('details')}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Detalhamento por Mecânico</h2>
                <Badge variant="outline">{mechanicStats.length}</Badge>
              </div>
              {expandedSections.details ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.details && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 overflow-x-auto">
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
                                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <span className="font-medium">{stat.name}</span>
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
                                <Badge variant={avg >= 4 ? "default" : avg >= 3 ? "secondary" : "destructive"}>
                                  {stat.totalFeedbacks > 0 ? avg.toFixed(1) : "—"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {stat.trend === "up" ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                                ) : stat.trend === "down" ? (
                                  <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMechanicAnalytics;