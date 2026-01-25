import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Settings,
  Eye,
  Download,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Edit3,
  Save,
  X
} from 'lucide-react';

// Interface para IAs Externas (Kommo)
interface IAExterna {
  id: string;
  nome: string;
  emoji: string;
  funcao: string;
  historia: string;
  prioridade: 'maxima' | 'alta' | 'media';
  plataforma: 'kommo' | 'externa';
  status: 'online' | 'offline' | 'standby';
  performance: number;
  conversoes: number;
  conversasTotal: number;
  taxaSucesso: number;
  tempoMedioResposta: number;
  ultimaAtividade: string;
  feedback: number;
  aprendizados: string[];
}

// As 15 IAs do Exército - Doctor Prime 2026
const IAS_EXERCITO: IAExterna[] = [
  {
    id: 'simone',
    nome: 'Simone',
    emoji: '👑',
    funcao: 'Líder do Exército - Coordena todas as IAs com maestria',
    historia: '',
    prioridade: 'maxima',
    plataforma: 'kommo',
    status: 'online',
    performance: 98,
    conversoes: 312,
    conversasTotal: 450,
    taxaSucesso: 69.3,
    tempoMedioResposta: 1.2,
    ultimaAtividade: 'Agora mesmo',
    feedback: 96,
    aprendizados: [
      'Liderança firme aumenta eficiência do time em 50%',
      'Tomada de decisão rápida otimiza resultados',
      'Gestão estratégica do exército maximiza conversões'
    ]
  },
  {
    id: 'anna-laura',
    nome: 'Anna Laura',
    emoji: '💰',
    funcao: 'Especialista em Vendas++ - Análise de preços e estratégias',
    historia: '',
    prioridade: 'maxima',
    plataforma: 'kommo',
    status: 'online',
    performance: 94,
    conversoes: 189,
    conversasTotal: 267,
    taxaSucesso: 70.8,
    tempoMedioResposta: 2.1,
    ultimaAtividade: '1 minuto atrás',
    feedback: 92,
    aprendizados: [
      'Clientes de alto valor respondem melhor à abordagem consultiva',
      'Menção de benefício específico aumenta interesse em 35%',
      'Follow-up em 24h melhora conversão significativamente'
    ]
  },
  {
    id: 'vigilante',
    nome: 'Vigilante',
    emoji: '🚨',
    funcao: 'Monitor de Leads - Detecta leads sem resposta',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 91,
    conversoes: 67,
    conversasTotal: 189,
    taxaSucesso: 35.4,
    tempoMedioResposta: 1.8,
    ultimaAtividade: '30 segundos atrás',
    feedback: 88,
    aprendizados: [
      'Leads sem resposta por 2h+ precisam de alerta imediato',
      'Notificação em tempo real reduz perda de leads em 60%',
      'Priorização por valor do lead otimiza atendimento'
    ]
  },
  {
    id: 'reativador',
    nome: 'Reativador',
    emoji: '🔄',
    funcao: 'Especialista em Reativação - Recupera leads inativos',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 87,
    conversoes: 45,
    conversasTotal: 134,
    taxaSucesso: 33.6,
    tempoMedioResposta: 3.5,
    ultimaAtividade: '5 minutos atrás',
    feedback: 85,
    aprendizados: [
      'Desconto de 10% reativa 45% dos leads inativos',
      'Mensagem personalizada melhora taxa em 23%',
      'Leads inativos por 7+ dias precisam de abordagem diferente'
    ]
  },
  {
    id: 'marketeiro',
    nome: 'Marketeiro',
    emoji: '📱',
    funcao: 'Criador de Conteúdo - Gera posts e vídeos',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 89,
    conversoes: 78,
    conversasTotal: 156,
    taxaSucesso: 50.0,
    tempoMedioResposta: 4.2,
    ultimaAtividade: '10 minutos atrás',
    feedback: 90,
    aprendizados: [
      'Posts com vídeos têm 3x mais engajamento',
      'Horário das 19h-21h tem melhor alcance',
      'Conteúdo educativo gera mais confiança'
    ]
  },
  {
    id: 'competidor',
    nome: 'Competidor',
    emoji: '🔍',
    funcao: 'Analista de Concorrência - Monitora o mercado',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'standby',
    performance: 85,
    conversoes: 23,
    conversasTotal: 89,
    taxaSucesso: 25.8,
    tempoMedioResposta: 5.0,
    ultimaAtividade: '30 minutos atrás',
    feedback: 82,
    aprendizados: [
      'Concorrente X baixou preços em 15% esta semana',
      'Novo player entrando no mercado regional',
      'Tendência de serviços express está crescendo'
    ]
  },
  {
    id: 'analista-dados',
    nome: 'Analista de Dados',
    emoji: '📊',
    funcao: 'Análise de Leads - Métricas do Kommo (161 leads)',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 93,
    conversoes: 161,
    conversasTotal: 234,
    taxaSucesso: 68.8,
    tempoMedioResposta: 2.0,
    ultimaAtividade: '2 minutos atrás',
    feedback: 94,
    aprendizados: [
      'Leads com telefone têm 40% mais conversão',
      'Segunda-feira tem 25% mais leads novos',
      'Taxa de conversão média subiu para 68%'
    ]
  },
  {
    id: 'qualificador',
    nome: 'Qualificador',
    emoji: '🎯',
    funcao: 'Classificação de Leads - Categoriza em A/B/C',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 94,
    conversoes: 156,
    conversasTotal: 234,
    taxaSucesso: 66.7,
    tempoMedioResposta: 2.3,
    ultimaAtividade: '1 minuto atrás',
    feedback: 92,
    aprendizados: [
      'Leads classe A convertem 3x mais que classe C',
      'Resposta em menos de 3s melhora classificação',
      'Mensagens com emojis aumentam engajamento'
    ]
  },
  {
    id: 'fiscal-crm',
    nome: 'Fiscal do CRM',
    emoji: '📝',
    funcao: 'Qualidade de Dados - Garante dados limpos no CRM',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 96,
    conversoes: 89,
    conversasTotal: 112,
    taxaSucesso: 79.5,
    tempoMedioResposta: 1.5,
    ultimaAtividade: '3 minutos atrás',
    feedback: 95,
    aprendizados: [
      'Dados duplicados reduzidos em 80%',
      'Campos obrigatórios aumentam qualidade do lead',
      'Limpeza semanal mantém CRM organizado'
    ]
  },
  {
    id: 'organizador-patio',
    nome: 'Organizador de Pátio',
    emoji: '🏗️',
    funcao: 'Controle de Pátio - Máximo 30% de iscas',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 88,
    conversoes: 34,
    conversasTotal: 78,
    taxaSucesso: 43.6,
    tempoMedioResposta: 3.0,
    ultimaAtividade: '8 minutos atrás',
    feedback: 86,
    aprendizados: [
      'Pátio com 25% de iscas tem melhor conversão',
      'Rotação de veículos a cada 15 dias é ideal',
      'Veículos limpos vendem 2x mais rápido'
    ]
  },
  {
    id: 'estrategista-iscas',
    nome: 'Estrategista de Iscas',
    emoji: '📈',
    funcao: 'Monitor de Conversão - Mínimo 60% de conversão',
    historia: '',
    prioridade: 'alta',
    plataforma: 'kommo',
    status: 'online',
    performance: 90,
    conversoes: 67,
    conversasTotal: 98,
    taxaSucesso: 68.4,
    tempoMedioResposta: 2.8,
    ultimaAtividade: '4 minutos atrás',
    feedback: 89,
    aprendizados: [
      'Iscas com preço agressivo convertem 70%+',
      'Fotos profissionais aumentam interesse em 50%',
      'Descrição detalhada reduz perguntas repetitivas'
    ]
  },
  {
    id: 'dedo-duro',
    nome: 'Dedo Duro',
    emoji: '🕵️',
    funcao: 'Detector de Inconsistências - Encontra falhas no processo',
    historia: '',
    prioridade: 'media',
    plataforma: 'kommo',
    status: 'standby',
    performance: 84,
    conversoes: 12,
    conversasTotal: 45,
    taxaSucesso: 26.7,
    tempoMedioResposta: 4.5,
    ultimaAtividade: '20 minutos atrás',
    feedback: 80,
    aprendizados: [
      'Detectou 15 inconsistências esta semana',
      'Processo de orçamento tem gargalo identificado',
      'Tempo médio de resposta pode melhorar 30%'
    ]
  },
  {
    id: 'analista-preco',
    nome: 'Analista de Preço',
    emoji: '💵',
    funcao: 'Monitor de Mercado - Preços da concorrência',
    historia: '',
    prioridade: 'media',
    plataforma: 'kommo',
    status: 'online',
    performance: 86,
    conversoes: 28,
    conversasTotal: 67,
    taxaSucesso: 41.8,
    tempoMedioResposta: 3.8,
    ultimaAtividade: '12 minutos atrás',
    feedback: 83,
    aprendizados: [
      'Preços 5% abaixo do mercado otimizam conversão',
      'Promoções relâmpago geram urgência',
      'Pacotes de serviços têm margem melhor'
    ]
  },
  {
    id: 'analista-tecnico',
    nome: 'Analista Técnico',
    emoji: '🔧',
    funcao: 'Especialista em Diagnóstico - Fluxo técnico',
    historia: '',
    prioridade: 'media',
    plataforma: 'kommo',
    status: 'online',
    performance: 92,
    conversoes: 78,
    conversasTotal: 123,
    taxaSucesso: 63.4,
    tempoMedioResposta: 2.5,
    ultimaAtividade: '6 minutos atrás',
    feedback: 91,
    aprendizados: [
      'Diagnóstico preciso reduz retrabalho em 40%',
      'Checklist padronizado melhora qualidade',
      'Fotos do problema aumentam confiança do cliente'
    ]
  },
  {
    id: 'casanova',
    nome: 'Casanova',
    emoji: '💘',
    funcao: 'Recompensa de Meta - Arma secreta motivacional',
    historia: '',
    prioridade: 'media',
    plataforma: 'kommo',
    status: 'standby',
    performance: 95,
    conversoes: 15,
    conversasTotal: 20,
    taxaSucesso: 75.0,
    tempoMedioResposta: 1.0,
    ultimaAtividade: '1 hora atrás',
    feedback: 98,
    aprendizados: [
      'Reconhecimento aumenta motivação em 60%',
      'Metas alcançáveis mantêm engajamento',
      'Celebração de vitórias fortalece o time'
    ]
  }
];

export default function AdminMonitoramentoKommo() {
  const [ias, setIas] = useState<IAExterna[]>(IAS_EXERCITO);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'online' | 'offline' | 'standby'>('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todas' | 'maxima' | 'alta' | 'media'>('todas');
  const [buscaNome, setBuscaNome] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const [editandoHistoria, setEditandoHistoria] = useState<string | null>(null);
  const [historiaTemp, setHistoriaTemp] = useState('');

  const iasFiltradas = ias.filter(ia => {
    const matchStatus = filtroStatus === 'todas' || ia.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === 'todas' || ia.prioridade === filtroPrioridade;
    const matchNome = ia.nome.toLowerCase().includes(buscaNome.toLowerCase());
    return matchStatus && matchPrioridade && matchNome;
  });

  const stats = {
    totalIAs: ias.length,
    ativas: ias.filter(ia => ia.status === 'online').length,
    conversoesMes: ias.reduce((acc, ia) => acc + ia.conversoes, 0),
    conversasTotal: ias.reduce((acc, ia) => acc + ia.conversasTotal, 0),
    performanceMedia: Math.round(ias.reduce((acc, ia) => acc + ia.performance, 0) / ias.length),
    feedbackMedio: Math.round(ias.reduce((acc, ia) => acc + ia.feedback, 0) / ias.length)
  };

  const handleAtualizar = async () => {
    setAtualizando(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAtualizando(false);
  };

  const handleEditarHistoria = (iaId: string, historiaAtual: string) => {
    setEditandoHistoria(iaId);
    setHistoriaTemp(historiaAtual);
  };

  const handleSalvarHistoria = (iaId: string) => {
    setIas(ias.map(ia => ia.id === iaId ? { ...ia, historia: historiaTemp } : ia));
    setEditandoHistoria(null);
    setHistoriaTemp('');
  };

  const handleCancelarEdicao = () => {
    setEditandoHistoria(null);
    setHistoriaTemp('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'offline': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'standby': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'maxima': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'alta': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'media': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <AlertCircle className="h-4 w-4" />;
      case 'standby': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">🤖 Exército de IAs - Doctor Prime 2026</h1>
            <p className="text-muted-foreground">Monitoramento das 15 IAs especializadas em tempo real</p>
          </div>
          <Button onClick={handleAtualizar} disabled={atualizando} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${atualizando ? 'animate-spin' : ''}`} />
            {atualizando ? 'Atualizando...' : 'Atualizar Dados'}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2"><Bot className="h-4 w-4" />IAs Ativas</CardTitle></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{stats.ativas}/{stats.totalIAs}</div><p className="text-xs text-muted-foreground">{Math.round((stats.ativas / stats.totalIAs) * 100)}% online</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" />Conversões</CardTitle></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{stats.conversoesMes}</div><p className="text-xs text-muted-foreground">Este mês</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4" />Conversas</CardTitle></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{stats.conversasTotal}</div><p className="text-xs text-muted-foreground">Total processadas</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4" />Performance</CardTitle></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{stats.performanceMedia}%</div><p className="text-xs text-muted-foreground">Média geral</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" />Feedback</CardTitle></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{stats.feedbackMedio}%</div><p className="text-xs text-muted-foreground">Satisfação média</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2"><Activity className="h-4 w-4" />Taxa Média</CardTitle></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{(ias.reduce((acc, ia) => acc + ia.taxaSucesso, 0) / ias.length).toFixed(1)}%</div><p className="text-xs text-muted-foreground">Sucesso</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filtros</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nome</label>
                <Input placeholder="Digite o nome da IA..." value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(['todas', 'online', 'standby', 'offline'] as const).map(status => (
                    <Button key={status} variant={filtroStatus === status ? 'default' : 'outline'} size="sm" onClick={() => setFiltroStatus(status)} className="capitalize">
                      {status === 'todas' ? 'Todas' : status}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <div className="flex gap-2 flex-wrap">
                  {(['todas', 'maxima', 'alta', 'media'] as const).map(prio => (
                    <Button key={prio} variant={filtroPrioridade === prio ? 'default' : 'outline'} size="sm" onClick={() => setFiltroPrioridade(prio)} className="capitalize">
                      {prio === 'todas' ? 'Todas' : prio === 'maxima' ? 'Máxima' : prio}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Exército de IAs ({iasFiltradas.length})</h2>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Exportar Relatório</Button>
          </div>

          {iasFiltradas.map(ia => (
            <Card key={ia.id} className="border-2">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{ia.emoji}</span>
                      <div>
                        <CardTitle className="text-xl">{ia.nome}</CardTitle>
                        <CardDescription>{ia.funcao}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getStatusColor(ia.status)}>{getStatusIcon(ia.status)}<span className="ml-1 capitalize">{ia.status}</span></Badge>
                      <Badge variant="outline" className={getPrioridadeColor(ia.prioridade)}>Prioridade {ia.prioridade === 'maxima' ? 'Máxima' : ia.prioridade}</Badge>
                      <Badge variant="secondary">KOMMO</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Detalhes</Button>
                    <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Config</Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* História da IA */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">História da IA</span>
                    </div>
                    {editandoHistoria !== ia.id && (
                      <Button variant="ghost" size="sm" onClick={() => handleEditarHistoria(ia.id, ia.historia)}>
                        <Edit3 className="h-4 w-4 mr-1" />Editar
                      </Button>
                    )}
                  </div>
                  {editandoHistoria === ia.id ? (
                    <div className="space-y-2">
                      <Textarea placeholder="Conte a história desta IA... Como ela surgiu? Qual sua personalidade? Quais são suas conquistas?" value={historiaTemp} onChange={(e) => setHistoriaTemp(e.target.value)} rows={4} className="resize-none" />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={handleCancelarEdicao}><X className="h-4 w-4 mr-1" />Cancelar</Button>
                        <Button size="sm" onClick={() => handleSalvarHistoria(ia.id)}><Save className="h-4 w-4 mr-1" />Salvar</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{ia.historia || 'Clique em "Editar" para contar a história desta IA...'}</p>
                  )}
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Performance</p>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{ia.performance}%</div>
                      {ia.performance >= 90 ? <TrendingUp className="h-4 w-4 text-green-500" /> : ia.performance >= 75 ? <Activity className="h-4 w-4 text-yellow-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${ia.performance >= 90 ? 'bg-green-500' : ia.performance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${ia.performance}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-lg font-semibold">{ia.taxaSucesso.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{ia.conversoes} de {ia.conversasTotal}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tempo Médio</p>
                    <p className="text-lg font-semibold">{ia.tempoMedioResposta}s</p>
                    <p className="text-xs text-muted-foreground">Resposta</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Feedback</p>
                    <p className="text-lg font-semibold">{ia.feedback}%</p>
                    <p className="text-xs text-muted-foreground">{ia.ultimaAtividade}</p>
                  </div>
                </div>

                {/* Aprendizados */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">📚 Aprendizados Recentes</p>
                  <div className="space-y-2">
                    {ia.aprendizados.map((aprendizado, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{aprendizado}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-4 border-t flex-wrap">
                  <Button variant="outline" size="sm" className="flex-1 min-w-[120px]">📊 Ver Histórico</Button>
                  <Button variant="outline" size="sm" className="flex-1 min-w-[120px]">💬 Feedback</Button>
                  <Button variant="outline" size="sm" className="flex-1 min-w-[120px]">🔄 Sincronizar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insights Globais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🧠 Insights do Exército</CardTitle>
            <CardDescription>Padrões e aprendizados consolidados de todas as 15 IAs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="padroes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="padroes">Padrões</TabsTrigger>
                <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
                <TabsTrigger value="alertas">Alertas</TabsTrigger>
              </TabsList>
              <TabsContent value="padroes" className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Simone coordenando o exército aumentou eficiência em 50%</p><p className="text-xs text-muted-foreground">Delegação inteligente entre as IAs otimiza resultados</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Leads com telefone têm 40% mais conversão</p><p className="text-xs text-muted-foreground">Qualificador e Analista de Dados confirmam o padrão</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Taxa de conversão geral subiu para 68%</p><p className="text-xs text-muted-foreground">Acima da meta mínima de 60% do Estrategista de Iscas</p></div>
                </div>
              </TabsContent>
              <TabsContent value="oportunidades" className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Reativador pode recuperar mais 45% dos leads inativos</p><p className="text-xs text-muted-foreground">Desconto de 10% mostrou alta eficácia em reativações</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Marketeiro identificou horário ideal: 19h-21h</p><p className="text-xs text-muted-foreground">Posts nesse horário têm 3x mais engajamento</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Casanova pode aumentar motivação do time em 60%</p><p className="text-xs text-muted-foreground">Sistema de reconhecimento e metas está pronto para ativar</p></div>
                </div>
              </TabsContent>
              <TabsContent value="alertas" className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Competidor e Dedo Duro em standby</p><p className="text-xs text-muted-foreground">Verificar se há tarefas pendentes para essas IAs</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Concorrente X baixou preços em 15%</p><p className="text-xs text-muted-foreground">Competidor detectou movimento - avaliar resposta estratégica</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div><p className="text-sm font-medium">Dedo Duro encontrou 15 inconsistências esta semana</p><p className="text-xs text-muted-foreground">Processo de orçamento tem gargalo identificado</p></div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
