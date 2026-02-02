import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@/hooks/useNavigate';
import { format, startOfMonth, endOfMonth, differenceInBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
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

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AdminMetas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<MetaProgresso[]>([]);
  const [periodoVigente, setPeriodoVigente] = useState({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
  const [diasInfo, setDiasInfo] = useState({ trabalhados: 0, restantes: 0, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hoje = new Date();
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);

        // Buscar configurações
        const { data: configData } = await supabase
          .from('system_config')
          .select('key, value');

        const configMap: Record<string, unknown> = {};
        configData?.forEach(row => {
          configMap[row.key] = row.value;
        });

        // Período vigente
        const periodo = configMap.periodo_vigente as { mes: number; ano: number } | undefined;
        if (periodo) {
          setPeriodoVigente(periodo);
        }

        // Metas configuradas
        const metasConfig = (configMap.metas as Meta[]) || [];
        const metasAtivas = metasConfig.filter(m => m.ativo);

        // Calcular dias
        const diasTrabalhados = differenceInBusinessDays(hoje, inicioMes) + 1;
        const diasRestantes = differenceInBusinessDays(fimMes, hoje);
        const diasTotal = differenceInBusinessDays(fimMes, inicioMes) + 1;
        setDiasInfo({ trabalhados: diasTrabalhados, restantes: diasRestantes, total: diasTotal });

        // Buscar dados reais para cada meta
        const metasProgresso: MetaProgresso[] = [];

        for (const meta of metasAtivas) {
          let valorAtual = 0;
          let valorMeta = parseFloat(meta.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const historico: { dia: string; valor: number }[] = [];

          if (meta.tipo === 'financeira') {
            // Buscar faturamento do mês (OSs entregues)
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

            // Gerar histórico simulado (crescimento gradual)
            for (let i = 1; i <= diasTrabalhados; i++) {
              const diaValor = (valorAtual / diasTrabalhados) * i;
              historico.push({
                dia: `Dia ${i}`,
                valor: diaValor,
              });
            }
          } else if (meta.tipo === 'crescimento') {
            // Buscar novos clientes do mês
            const { count } = await supabase
              .from('clientes')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', inicioMes.toISOString())
              .lte('created_at', fimMes.toISOString());

            valorAtual = count || 0;

            // Histórico de crescimento
            for (let i = 1; i <= diasTrabalhados; i++) {
              historico.push({
                dia: `Dia ${i}`,
                valor: Math.round((valorAtual / diasTrabalhados) * i),
              });
            }
          } else if (meta.tipo === 'operacional') {
            // Buscar OSs entregues no mês
            const { count } = await supabase
              .from('ordens_servico')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'entregue')
              .gte('completed_at', inicioMes.toISOString())
              .lte('completed_at', fimMes.toISOString());

            valorAtual = count || 0;

            for (let i = 1; i <= diasTrabalhados; i++) {
              historico.push({
                dia: `Dia ${i}`,
                valor: Math.round((valorAtual / diasTrabalhados) * i),
              });
            }
          } else {
            // Para NPS e Produto, usar valor mock por enquanto
            valorAtual = valorMeta * (diasTrabalhados / diasTotal) * (0.8 + Math.random() * 0.4);
            for (let i = 1; i <= diasTrabalhados; i++) {
              historico.push({
                dia: `Dia ${i}`,
                valor: (valorAtual / diasTrabalhados) * i,
              });
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

    fetchData();
  }, []);

  const formatValue = (meta: Meta, valor: number) => {
    if (meta.tipo === 'financeira') {
      return formatCurrency(valor);
    } else if (meta.tipo === 'nps') {
      return valor.toFixed(1);
    }
    return Math.round(valor).toString();
  };

  const getStatusBadge = (percentual: number) => {
    if (percentual >= 100) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Meta Atingida</Badge>;
    } else if (percentual >= 80) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Quase lá</Badge>;
    } else if (percentual >= 50) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Em progresso</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Atenção</Badge>;
  };

  // Dados para o gráfico de pizza geral
  const pieData = metas.map((m, i) => ({
    name: m.meta.nome,
    value: m.percentual,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Acompanhamento de Metas
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(periodoVigente.ano, periodoVigente.mes - 1), 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {diasInfo.trabalhados} de {diasInfo.total} dias úteis
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/parametros')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {metas.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Nenhuma meta configurada</h3>
              <p className="text-muted-foreground">Configure suas metas em Parâmetros do Sistema</p>
              <Button onClick={() => navigate('/admin/parametros')}>
                <Settings className="h-4 w-4 mr-2" />
                Configurar Metas
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Progresso Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metas.map(m => ({
                        nome: m.meta.nome.length > 15 ? m.meta.nome.substring(0, 15) + '...' : m.meta.nome,
                        progresso: Math.min(m.percentual, 100),
                        restante: Math.max(100 - m.percentual, 0),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="nome" tick={{ fill: '#888', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#888' }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`]}
                        />
                        <Bar dataKey="progresso" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="restante" stackId="a" fill="#333" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metas.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-sm truncate max-w-[100px]">{m.meta.nome}</span>
                      </div>
                      {m.tendencia === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : m.tendencia === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Cards de cada meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metas.map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${tipoColors[item.meta.tipo]}20` }}
                        >
                          <span style={{ color: tipoColors[item.meta.tipo] }}>
                            {tipoIcons[item.meta.tipo]}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{item.meta.nome}</CardTitle>
                          <CardDescription className="capitalize">{item.meta.tipo}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(item.percentual)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{item.percentual.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={Math.min(item.percentual, 100)}
                        className="h-3"
                        style={{
                          ['--progress-foreground' as string]: tipoColors[item.meta.tipo],
                        }}
                      />
                    </div>

                    {/* Valores */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Realizado</p>
                        <p className="text-lg font-bold" style={{ color: tipoColors[item.meta.tipo] }}>
                          {formatValue(item.meta, item.valorAtual)}
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Meta</p>
                        <p className="text-lg font-bold">
                          {formatValue(item.meta, item.valorMeta)}
                        </p>
                      </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="h-[80px]">
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

                    {/* Indicadores */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
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
                            <span className="text-red-500">Abaixo do esperado</span>
                          </>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        Faltam {formatValue(item.meta, Math.max(0, item.valorMeta - item.valorAtual))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
