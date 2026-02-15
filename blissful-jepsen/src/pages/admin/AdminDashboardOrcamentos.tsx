import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TrendingUp, DollarSign, FileText, XCircle, Clock, AlertTriangle, Target, Percent, Calendar, Phone, MessageSquare, BarChart3, Activity, Zap, RefreshCw, Download, Filter, ChevronRight, Star } from 'lucide-react';

const METRICAS = { total: 156, aprovados: 98, parciais: 32, recusados: 26, taxa: 62.8, ticket: 2450, orcado: 382200, aprovado: 240100, tempo: '4.2h', margem: 38.5 };
const PRIORIDADES = [
  { id: 'vermelho', label: 'Urgente', taxa: 94.5, total: 89, ok: 84, cor: 'bg-red-500' },
  { id: 'amarelo', label: 'Atenção', taxa: 58.3, total: 120, ok: 70, cor: 'bg-yellow-500' },
  { id: 'verde', label: 'Preventivo', taxa: 28.7, total: 87, ok: 25, cor: 'bg-green-500' }
];
const RECUSADOS = [
  { desc: 'Alinhamento e Balanceamento', vezes: 23, valor: 180, motivo: 'Preço alto' },
  { desc: 'Troca de Filtro de Ar', vezes: 19, valor: 95, motivo: 'Não urgente' },
  { desc: 'Limpeza de Bicos', vezes: 15, valor: 350, motivo: 'Muito caro' },
  { desc: 'Higienização do Ar', vezes: 12, valor: 150, motivo: 'Não necessário' },
  { desc: 'Troca de Palhetas', vezes: 10, valor: 120, motivo: 'Faço depois' }
];
const RETORNO = [
  { cliente: 'João Silva', tel: '11999887766', item: 'Troca de Amortecedores', valor: 1800, data: '2026-01-28', prio: 'amarelo' },
  { cliente: 'Maria Santos', tel: '11988776655', item: 'Revisão de Freios', valor: 650, data: '2026-01-30', prio: 'amarelo' },
  { cliente: 'Pedro Costa', tel: '11977665544', item: 'Troca de Correia', valor: 1200, data: '2026-02-05', prio: 'amarelo' },
  { cliente: 'Ana Oliveira', tel: '11966554433', item: 'Alinhamento', valor: 180, data: '2026-02-10', prio: 'verde' }
];
const CLIENTES = { vip: { qtd: 45, ticket: 3200, taxa: 95.2 }, eco: { qtd: 78, ticket: 1100, taxa: 45.8 }, prev: { qtd: 33, ticket: 2800, taxa: 72.4 } };
const MARGENS = [{ tipo: 'Peças', media: 35.2, min: 15, max: 55, qtd: 234 }, { tipo: 'Mão de Obra', media: 100, min: 100, max: 100, qtd: 156 }];
const MESES = [{ m: 'Ago', t: 57.1 }, { m: 'Set', t: 59.4 }, { m: 'Out', t: 62.9 }, { m: 'Nov', t: 65.8 }, { m: 'Dez', t: 66.7 }, { m: 'Jan', t: 66.7 }];

export default function AdminDashboardOrcamentos() {
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('mes');
  const refresh = async () => { setLoading(true); await new Promise(r => setTimeout(r, 1500)); setLoading(false); };
  const prioColor = (p: string) => p === 'vermelho' ? 'bg-red-500/20 text-red-700' : p === 'amarelo' ? 'bg-yellow-500/20 text-yellow-700' : 'bg-green-500/20 text-green-700';

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">📊 Dashboard de Orçamentos</h1>
            <p className="text-muted-foreground">Análise completa de conversão, margens e oportunidades</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filtros</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
            <Button onClick={refresh} disabled={loading}><RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Atualizando...' : 'Atualizar'}</Button>
          </div>
        </div>

        <div className="flex gap-2">
          {['semana', 'mes', 'trimestre', 'ano'].map(p => (
            <Button key={p} variant={periodo === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriodo(p)}>
              {p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : p === 'trimestre' ? 'Trimestre' : 'Ano'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Orçamentos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{METRICAS.total}</div><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />Taxa</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{METRICAS.taxa}%</div><div className="flex items-center text-xs text-green-600"><TrendingUp className="h-3 w-3 mr-1" />+3.2%</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Ticket</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {METRICAS.ticket}</div><p className="text-xs text-muted-foreground">Médio</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Percent className="h-4 w-4" />Margem</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{METRICAS.margem}%</div><p className="text-xs text-muted-foreground">Média</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Tempo</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{METRICAS.tempo}</div><p className="text-xs text-muted-foreground">Aprovação</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Aprovado</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">R$ {(METRICAS.aprovado/1000).toFixed(0)}k</div><p className="text-xs text-muted-foreground">de R$ {(METRICAS.orcado/1000).toFixed(0)}k</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" />Funil de Conversão</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center"><div className="bg-blue-500 text-white rounded-lg p-4"><div className="text-3xl font-bold">{METRICAS.total}</div><div className="text-sm">Orçados</div></div><div className="text-xs text-muted-foreground mt-1">100%</div></div>
              <ChevronRight className="h-6 w-6 text-muted-foreground hidden md:block" />
              <div className="flex-1 text-center"><div className="bg-green-500 text-white rounded-lg p-4"><div className="text-3xl font-bold">{METRICAS.aprovados}</div><div className="text-sm">Aprovados</div></div><div className="text-xs text-muted-foreground mt-1">{((METRICAS.aprovados/METRICAS.total)*100).toFixed(1)}%</div></div>
              <ChevronRight className="h-6 w-6 text-muted-foreground hidden md:block" />
              <div className="flex-1 text-center"><div className="bg-yellow-500 text-white rounded-lg p-4"><div className="text-3xl font-bold">{METRICAS.parciais}</div><div className="text-sm">Parciais</div></div><div className="text-xs text-muted-foreground mt-1">{((METRICAS.parciais/METRICAS.total)*100).toFixed(1)}%</div></div>
              <ChevronRight className="h-6 w-6 text-muted-foreground hidden md:block" />
              <div className="flex-1 text-center"><div className="bg-red-500 text-white rounded-lg p-4"><div className="text-3xl font-bold">{METRICAS.recusados}</div><div className="text-sm">Recusados</div></div><div className="text-xs text-muted-foreground mt-1">{((METRICAS.recusados/METRICAS.total)*100).toFixed(1)}%</div></div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="conversao" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="conversao">Conversão</TabsTrigger>
            <TabsTrigger value="margens">Margens</TabsTrigger>
            <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="conversao" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Taxa por Prioridade</CardTitle><CardDescription>Urgentes convertem mais</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {PRIORIDADES.map(p => (
                    <div key={p.id} className="space-y-2">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${p.cor}`} /><span className="font-medium">{p.label}</span></div><span className="font-bold">{p.taxa}%</span></div>
                      <Progress value={p.taxa} className="h-2" />
                      <p className="text-xs text-muted-foreground">{p.ok} de {p.total} aprovados</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Evolução Mensal</CardTitle><CardDescription>Últimos 6 meses</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {MESES.map((m, i) => (
                    <div key={m.m} className="flex items-center gap-3">
                      <span className="w-8 text-sm font-medium">{m.m}</span>
                      <div className="flex-1"><Progress value={m.t} className="h-4" /></div>
                      <span className="w-12 text-sm font-bold text-right">{m.t}%</span>
                      {i > 0 && m.t > MESES[i-1].t && <TrendingUp className="h-4 w-4 text-green-500" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Top 5 Recusados</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead><tr className="border-b"><th className="text-left py-2 text-sm">Item</th><th className="text-center py-2 text-sm">Recusas</th><th className="text-right py-2 text-sm">Valor</th><th className="text-left py-2 text-sm">Motivo</th></tr></thead>
                  <tbody>
                    {RECUSADOS.map((r, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 text-sm">{r.desc}</td>
                        <td className="py-3 text-center"><Badge variant="destructive">{r.vezes}x</Badge></td>
                        <td className="py-3 text-right text-sm font-medium">R$ {r.valor}</td>
                        <td className="py-3"><Badge variant="outline">{r.motivo}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="margens" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Margem por Tipo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {MARGENS.map(m => (
                    <div key={m.tipo} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2"><span className="font-medium">{m.tipo}</span><span className="text-2xl font-bold">{m.media}%</span></div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div><p className="text-muted-foreground">Mín</p><p className="font-medium">{m.min}%</p></div>
                        <div><p className="text-muted-foreground">Máx</p><p className="font-medium">{m.max}%</p></div>
                        <div><p className="text-muted-foreground">Qtd</p><p className="font-medium">{m.qtd}</p></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Alertas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"><div><p className="font-medium">Filtro de Óleo - Civic</p><p className="text-sm text-muted-foreground">OS-2024-089</p></div><Badge className="bg-yellow-100 text-yellow-700">18%</Badge></div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"><div><p className="font-medium">Pastilha - Corolla</p><p className="text-sm text-muted-foreground">OS-2024-092</p></div><Badge className="bg-yellow-100 text-yellow-700">22%</Badge></div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"><div><p className="font-medium">Amortecedor - HB20</p><p className="text-sm text-muted-foreground">OS-2024-095</p></div><Badge className="bg-red-100 text-red-700">12%</Badge></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="oportunidades" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" />Oportunidades de Retorno</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {RETORNO.map((r, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><p className="font-medium">{r.cliente}</p><Badge variant="outline" className={prioColor(r.prio)}>{r.prio === 'amarelo' ? 'Atenção' : 'Preventivo'}</Badge></div>
                        <p className="text-sm text-muted-foreground">{r.item}</p>
                        <p className="text-sm font-medium text-green-600">R$ {r.valor}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right"><p className="text-xs text-muted-foreground">Retorno</p><p className="text-sm font-medium">{new Date(r.data).toLocaleDateString('pt-BR')}</p></div>
                        <Button size="sm" variant="outline"><Phone className="h-3 w-3" /></Button>
                        <Button size="sm"><MessageSquare className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div><p className="font-medium">Total em oportunidades</p><p className="text-sm text-muted-foreground">{RETORNO.length} clientes</p></div>
                  <p className="text-2xl font-bold text-blue-600">R$ {RETORNO.reduce((a, r) => a + r.valor, 0).toLocaleString('pt-BR')}</p>
                </div>
                <Button className="w-full mt-4"><Zap className="h-4 w-4 mr-2" />Enviar Campanha de Retorno</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">💡 Gatilhos de Conversão</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500"><p className="font-medium text-red-700">🚨 Segurança</p><p className="text-sm text-muted-foreground">"Risco para você e sua família"</p></div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500"><p className="font-medium text-green-700">💰 Economia</p><p className="text-sm text-muted-foreground">"Evite um problema maior"</p></div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500"><p className="font-medium text-blue-700">⚡ Conveniência</p><p className="text-sm text-muted-foreground">"Já está aqui, aproveite"</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-yellow-500/30">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /><CardTitle className="text-lg">VIP</CardTitle></div></CardHeader>
                <CardContent><div className="text-3xl font-bold">{CLIENTES.vip.qtd}</div><div className="grid grid-cols-2 gap-2 text-sm mt-2"><div><p className="text-muted-foreground">Ticket</p><p className="font-medium">R$ {CLIENTES.vip.ticket}</p></div><div><p className="text-muted-foreground">Taxa</p><p className="font-medium text-green-600">{CLIENTES.vip.taxa}%</p></div></div></CardContent>
              </Card>
              <Card className="border-2 border-blue-500/30">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-blue-500" /><CardTitle className="text-lg">Econômicos</CardTitle></div></CardHeader>
                <CardContent><div className="text-3xl font-bold">{CLIENTES.eco.qtd}</div><div className="grid grid-cols-2 gap-2 text-sm mt-2"><div><p className="text-muted-foreground">Ticket</p><p className="font-medium">R$ {CLIENTES.eco.ticket}</p></div><div><p className="text-muted-foreground">Taxa</p><p className="font-medium text-yellow-600">{CLIENTES.eco.taxa}%</p></div></div></CardContent>
              </Card>
              <Card className="border-2 border-green-500/30">
                <CardHeader className="pb-2"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" /><CardTitle className="text-lg">Preventivos</CardTitle></div></CardHeader>
                <CardContent><div className="text-3xl font-bold">{CLIENTES.prev.qtd}</div><div className="grid grid-cols-2 gap-2 text-sm mt-2"><div><p className="text-muted-foreground">Ticket</p><p className="font-medium">R$ {CLIENTES.prev.ticket}</p></div><div><p className="text-muted-foreground">Taxa</p><p className="font-medium text-green-600">{CLIENTES.prev.taxa}%</p></div></div></CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-lg">🏆 Ranking Comercial</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"><div className="text-2xl">🥇</div><div className="flex-1"><p className="font-medium">Carlos - Gerente</p><p className="text-sm text-muted-foreground">45 aprovados</p></div><p className="text-lg font-bold text-green-600">78.5%</p></div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg"><div className="text-2xl">🥈</div><div className="flex-1"><p className="font-medium">Roberto - Consultor</p><p className="text-sm text-muted-foreground">38 aprovados</p></div><p className="text-lg font-bold text-green-600">72.3%</p></div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"><div className="text-2xl">🥉</div><div className="flex-1"><p className="font-medium">Marcos - Mecânico</p><p className="text-sm text-muted-foreground">28 aprovados</p></div><p className="text-lg font-bold text-green-600">65.1%</p></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
