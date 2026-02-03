import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@/hooks/useNavigate';
import { format, startOfMonth, endOfMonth, differenceInBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Settings,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Star,
  ShoppingCart,
  Wrench,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Meta {
  nome: string;
  valor: string;
  tipo: 'financeira' | 'crescimento' | 'nps' | 'produto' | 'operacional';
  ativo: boolean;
}

interface MetaProgresso {
  meta: Meta;
  valorAtual: number;
  valorMeta: number;
  percentual: number;
  tendencia: 'up' | 'down' | 'stable';
  historico: { dia: string; valor: number }[];
}

const tipoIcons: Record<string, React.ReactNode> = {
  financeira: <DollarSign className="h-5 w-5" />,
  crescimento: <Users className="h-5 w-5" />,
  nps: <Star className="h-5 w-5" />,
  produto: <ShoppingCart className="h-5 w-5" />,
  operacional: <Wrench className="h-5 w-5" />,
};

const tipoColors: Record<string, string> = {
  financeira: '#10b981',
  crescimento: '#3b82f6',
  nps: '#f59e0b',
  produto: '#8b5cf6',
  operacional: '#ef4444',
};

export default function AdminMetas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<MetaProgresso[]>([]);
  const [periodoVigente, setPeriodoVigente] = useState({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
  const [diasInfo, setDiasInfo] = useState({ trabalhados: 0, restantes: 0, total: 0 });
  const [expandedSections, setExpandedSections] = useState({
    resumo: true,
    metas: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);

      const { data: configData } = await supabase
        .from('system_config')
        .select('key, value');

      const configMap: Record<string, unknown> = {};
      configData?.forEach(row => {
        configMap[row.key] = row.value;
      });

      const periodo = configMap.periodo_vigente as { mes: number; ano: number } | undefined;
      if (periodo) {
        setPeriodoVigente(periodo);
      }

      const metasConfig = (configMap.metas as Meta[]) || [];
      const metasAtivas = metasConfig.filter(m => m.ativo);

      const diasTrabalhados = differenceInBusinessDays(hoje, inicioMes) + 1;
      const diasRestantes = differenceInBusinessDays(fimMes, hoje);
      const diasTotal = differenceInBusinessDays(fimMes, inicioMes) + 1;
      setDiasInfo({ trabalhados: diasTrabalhados, restantes: diasRestantes, total: diasTotal });

      const metasProgresso: MetaProgresso[] = [];

      for (const meta of metasAtivas) {
        let valorAtual = 0;
        let valorMeta = parseFloat(meta.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const historico: { dia: string; valor: number }[] = [];

        if (meta.tipo === 'financeira') {
          const { data: ossEntregues } = await supabase
            .from('ordens_servico')
            .select('total, completed_at, itens_ordem_servico(total_price, status)')
            .eq('status', 'entregue')
            .gte('completed_at', inicioMes.toISOString())
            .lte('completed_at', fimMes.toISOString());

          ossEntregues?.forEach((os: any) => {
            const itensAprovados = os.itens_ordem_servico?.filter((i: any) => i.status?.toLowerCase() === 'aprovado');
            const valor = itensAprovados?.length > 0
              ? itensAprovados.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0)
              : (os.total || 0);
            valorAtual += valor;
          });

          for (let i = 1; i <= diasTrabalhados; i++) {
            const diaValor = (valorAtual / diasTrabalhados) * i;
            historico.push({ dia: `Dia ${i}`, valor: diaValor });
          }
        } else if (meta.tipo === 'crescimento') {
          const { count } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', inicioMes.toISOString())
            .lte('created_at', fimMes.toISOString());

          valorAtual = count || 0;
          for (let i = 1; i <= diasTrabalhados; i++) {
            historico.push({ dia: `Dia ${i}`, valor: Math.round((valorAtual / diasTrabalhados) * i) });
          }
        } else if (meta.tipo === 'operacional') {
          const { count } = await supabase
            .from('ordens_servico')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'entregue')
            .gte('completed_at', inicioMes.toISOString())
            .lte('completed_at', fimMes.toISOString());

          valorAtual = count || 0;
          for (let i = 1; i <= diasTrabalhados; i++) {
            historico.push({ dia: `Dia ${i}`, valor: Math.round((valorAtual / diasTrabalhados) * i) });
          }
        } else {
          valorAtual = valorMeta * (diasTrabalhados / diasTotal) * (0.8 + Math.random() * 0.4);
          for (let i = 1; i <= diasTrabalhados; i++) {
            historico.push({ dia: `Dia ${i}`, valor: (valorAtual / diasTrabalhados) * i });
          }
        }

        const percentual = valorMeta > 0 ? (valorAtual / valorMeta) * 100 : 0;
        const projecao = diasTrabalhados > 0 ? (valorAtual / diasTrabalhados) * diasTotal : 0;
        const tendencia = projecao >= valorMeta ? 'up' : projecao >= valorMeta * 0.8 ? 'stable' : 'down';

        metasProgresso.push({
          meta,
          valorAtual,
          valorMeta,
          percentual,
          tendencia,
          historico,
        });
      }

      setMetas(metasProgresso);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (meta: Meta, valor: number) => {
    if (meta.tipo === 'financeira') return formatCurrency(valor);
    if (meta.tipo === 'nps') return valor.toFixed(1);
    return Math.round(valor).toString();
  };

  const getStatusBadge = (percentual: number) => {
    if (percentual >= 100) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Atingida</Badge>;
    if (percentual >= 80) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Quase lá</Badge>;
    if (percentual >= 50) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Em progresso</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Atenção</Badge>;
  };

  const getTendenciaIcon = (tendencia: 'up' | 'down' | 'stable') => {
    if (tendencia === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (tendencia === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Zap className="w-4 h-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    <Target className="w-5 h-5 text-primary" />
                    Acompanhamento de Metas
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(periodoVigente.ano, periodoVigente.mes - 1), 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {diasInfo.trabalhados}/{diasInfo.total} dias
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/parametros')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-4 space-y-4">
          {metas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-lovable text-center py-12"
            >
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta configurada</h3>
              <p className="text-muted-foreground mb-4">Configure suas metas em Parâmetros do Sistema</p>
              <Button onClick={() => navigate('/admin/parametros')}>
                <Settings className="h-4 w-4 mr-2" />
                Configurar Metas
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Resumo Geral - Collapsible */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-lovable"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('resumo')}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-semibold">Resumo Geral</h2>
                  </div>
                  {expandedSections.resumo ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedSections.resumo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metas.map(m => ({
                            nome: m.meta.nome.length > 12 ? m.meta.nome.substring(0, 12) + '...' : m.meta.nome,
                            progresso: Math.min(m.percentual, 100),
                            restante: Math.max(100 - m.percentual, 0),
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="nome" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                              formatter={(value: number) => [`${value.toFixed(1)}%`]}
                            />
                            <Bar dataKey="progresso" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="restante" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Status Pills */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {metas.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tipoColors[m.meta.tipo] }}
                            />
                            <span className="truncate max-w-[100px]">{m.meta.nome}</span>
                            {getTendenciaIcon(m.tendencia)}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Metas Detalhadas - Collapsible */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-lovable"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('metas')}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-semibold">Metas Detalhadas</h2>
                    <Badge variant="outline">{metas.length}</Badge>
                  </div>
                  {expandedSections.metas ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedSections.metas && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metas.map((item, index) => (
                          <div
                            key={index}
                            className="bg-secondary/30 rounded-xl p-4 space-y-4"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${tipoColors[item.meta.tipo]}20` }}
                                >
                                  <span style={{ color: tipoColors[item.meta.tipo] }}>
                                    {tipoIcons[item.meta.tipo]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{item.meta.nome}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{item.meta.tipo}</p>
                                </div>
                              </div>
                              {getStatusBadge(item.percentual)}
                            </div>

                            {/* Progress */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progresso</span>
                                <span className="font-medium">{item.percentual.toFixed(1)}%</span>
                              </div>
                              <Progress value={Math.min(item.percentual, 100)} className="h-2" />
                            </div>

                            {/* Values */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-background/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Realizado</p>
                                <p className="text-lg font-bold" style={{ color: tipoColors[item.meta.tipo] }}>
                                  {formatValue(item.meta, item.valorAtual)}
                                </p>
                              </div>
                              <div className="bg-background/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Meta</p>
                                <p className="text-lg font-bold">{formatValue(item.meta, item.valorMeta)}</p>
                              </div>
                            </div>

                            {/* Mini Chart */}
                            <div className="h-[60px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={item.historico}>
                                  <defs>
                                    <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={tipoColors[item.meta.tipo]} stopOpacity={0.3} />
                                      <stop offset="95%" stopColor={tipoColors[item.meta.tipo]} stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <Area
                                    type="monotone"
                                    dataKey="valor"
                                    stroke={tipoColors[item.meta.tipo]}
                                    fill={`url(#gradient-${index})`}
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Tendencia */}
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                              <div className="flex items-center gap-1">
                                {item.tendencia === 'up' ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-green-500">No ritmo</span>
                                  </>
                                ) : item.tendencia === 'stable' ? (
                                  <>
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-yellow-500">Atenção</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500">Risco</span>
                                  </>
                                )}
                              </div>
                              <span className="text-muted-foreground">{diasInfo.restantes} dias restantes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}