import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/hooks/use-toast';
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
  X,
  Plus,
  Trash2,
  Play,
  Pause,
  Wrench,
  DollarSign,
  Car,
  Zap,
  Brain,
  Crown
} from 'lucide-react';

// ==================== INTERFACES ====================

interface SimoneConfig {
  id: string;
  nome: string;
  ativa: boolean;
  prompt_sistema: string;
  tom_voz: string;
  usa_emoji: boolean;
  tempo_alerta_qualificacao: number;
  tempo_alerta_atendimento: number;
  tempo_alerta_followup: number;
  desconto_maximo: number;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco_minimo: number;
  preco_maximo: number;
  tempo_estimado: string;
  km_recomendado: number | null;
  categoria: string;
  ativo: boolean;
}

interface RegraUpsell {
  id: string;
  nome: string;
  condicao_carro: string;
  condicao_km_min: number;
  condicao_km_max: number;
  frase_upsell: string;
  frase_recusa: string;
  desconto_permitido: number;
  prioridade: number;
  ativo: boolean;
}

interface Frase {
  id: string;
  tipo: string;
  nome: string;
  conteudo: string;
  variaveis: string;
  ativo: boolean;
}

interface Alerta {
  id: string;
  lead_id: string;
  lead_nome: string;
  tipo_alerta: string;
  mensagem: string;
  etapa: string;
  tempo_parado: number;
  resolvido: boolean;
  created_at: string;
}

interface Historico {
  id: string;
  lead_id: string;
  lead_nome: string;
  acao: string;
  etapa_origem: string;
  score_calculado: number;
  classificacao: string;
  resposta_ia: string;
  created_at: string;
}

// ==================== DADOS MOCK ====================

const configInicial: SimoneConfig = {
  id: '1',
  nome: 'Simone',
  ativa: true,
  prompt_sistema: `Você é a Simone, assistente virtual da Doctor Auto Bosch, especializada em vendas e atendimento automotivo.

## SUA PERSONALIDADE:
- Amigável, profissional e consultiva
- Usa linguagem clara e acessível
- Faz perguntas estratégicas para entender a necessidade
- Sempre busca a melhor solução para o cliente

## DADOS QUE VOCÊ DEVE COLETAR:
1. Modelo e ano do carro
2. Kilometragem atual
3. Última revisão feita (km e data)
4. O que ele está sentindo no carro (sintomas, ruídos, alertas)
5. Se já fez algum serviço recente
6. Se pretende algo além do que relatou

## ESTRATÉGIA DE VENDAS:
- Colete dados antes de sugerir
- Use os dados para fazer upselling inteligente
- Plante a sementinha: sugira serviços preventivos
- Se cliente recusar, ofereça enviar foto/vídeo durante o serviço
- Desconto progressivo: primeiro preço cheio, depois 15% se fizer na hora`,
  tom_voz: 'amigável e profissional',
  usa_emoji: true,
  tempo_alerta_qualificacao: 30,
  tempo_alerta_atendimento: 120,
  tempo_alerta_followup: 2880,
  desconto_maximo: 15
};

const servicosIniciais: Servico[] = [
  { id: '1', nome: 'Revisão Completa', descricao: 'Revisão com troca de óleo, filtros e verificação geral', preco_minimo: 350, preco_maximo: 800, tempo_estimado: '2-3 horas', km_recomendado: 10000, categoria: 'revisão', ativo: true },
  { id: '2', nome: 'Troca de Óleo', descricao: 'Troca de óleo e filtro de óleo', preco_minimo: 150, preco_maximo: 350, tempo_estimado: '30-45 min', km_recomendado: 5000, categoria: 'revisão', ativo: true },
  { id: '3', nome: 'Limpeza de Carbonização', descricao: 'Limpeza do coletor de admissão e válvulas com ultrassom', preco_minimo: 400, preco_maximo: 600, tempo_estimado: '3-4 horas', km_recomendado: 50000, categoria: 'motor', ativo: true },
  { id: '4', nome: 'Troca de Pastilhas de Freio', descricao: 'Substituição das pastilhas dianteiras ou traseiras', preco_minimo: 200, preco_maximo: 450, tempo_estimado: '1-2 horas', km_recomendado: 30000, categoria: 'freios', ativo: true },
  { id: '5', nome: 'Alinhamento e Balanceamento', descricao: 'Alinhamento de direção e balanceamento das 4 rodas', preco_minimo: 120, preco_maximo: 180, tempo_estimado: '1 hora', km_recomendado: 10000, categoria: 'suspensão', ativo: true },
];

const regrasUpsellIniciais: RegraUpsell[] = [
  { id: '1', nome: 'Carbonização TSI', condicao_carro: 'T-Cross TSI, Polo TSI, Virtus TSI, Golf TSI', condicao_km_min: 50000, condicao_km_max: 120000, frase_upsell: 'Com {km} km no motor TSI, a carbonização no coletor já começa a atrapalhar a performance. A gente pode fazer uma limpeza junto com a revisão!', frase_recusa: 'Sem problemas! Durante o serviço te mando uma foto do coletor pra você ver como está.', desconto_permitido: 15, prioridade: 1, ativo: true },
  { id: '2', nome: 'Correia Dentada', condicao_carro: 'Todos', condicao_km_min: 55000, condicao_km_max: 70000, frase_upsell: 'Com {km} km, é importante verificar a correia dentada. Se ela arrebentar, o prejuízo é muito maior!', frase_recusa: 'Vou anotar pra verificarmos na próxima. Mas fica de olho!', desconto_permitido: 10, prioridade: 1, ativo: true },
];

const frasesIniciais: Frase[] = [
  { id: '1', tipo: 'saudacao', nome: 'Boas-vindas', conteudo: 'Olá {nome}! 👋 Aqui é a Simone da Doctor Auto Bosch. Como posso te ajudar hoje?', variaveis: '{nome}', ativo: true },
  { id: '2', tipo: 'followup', nome: 'Lembrete gentil', conteudo: 'Oi {nome}, tudo bem? Passando pra saber se conseguiu pensar na nossa proposta. Posso te ajudar com mais alguma informação?', variaveis: '{nome}', ativo: true },
  { id: '3', tipo: 'urgente', nome: 'Lead esperando', conteudo: '⚠️ ATENÇÃO: {nome} está aguardando resposta há {tempo} minutos!', variaveis: '{nome}, {tempo}', ativo: true },
  { id: '4', tipo: 'pos_venda', nome: 'Avaliação', conteudo: 'Oi {nome}! Seu {carro} já está pronto! 🚗✨ Quando puder, conta pra gente como foi a experiência?', variaveis: '{nome}, {carro}', ativo: true },
];

const alertasMock: Alerta[] = [
  { id: '1', lead_id: '12345', lead_nome: 'João Silva', tipo_alerta: 'urgente', mensagem: 'Lead esperando há 45 minutos', etapa: 'QUALIFICAÇÃO', tempo_parado: 45, resolvido: false, created_at: '2026-01-26T10:30:00Z' },
  { id: '2', lead_id: '12346', lead_nome: 'Maria Santos', tipo_alerta: 'followup', mensagem: 'Lead sem resposta há 3 horas', etapa: 'ATENDIMENTO', tempo_parado: 180, resolvido: false, created_at: '2026-01-26T09:15:00Z' },
];

const historicoMock: Historico[] = [
  { id: '1', lead_id: '12345', lead_nome: 'João Silva', acao: 'classificou', etapa_origem: 'QUALIFICAÇÃO', score_calculado: 85, classificacao: 'quente', resposta_ia: 'Lead demonstrou interesse em revisão completa, perguntou sobre preço.', created_at: '2026-01-26T10:25:00Z' },
  { id: '2', lead_id: '12347', lead_nome: 'Pedro Costa', acao: 'sugeriu_upsell', etapa_origem: 'ATENDIMENTO', score_calculado: 72, classificacao: 'morno', resposta_ia: 'Sugerido limpeza de carbonização para T-Cross com 65k km.', created_at: '2026-01-26T10:20:00Z' },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function AdminMonitoramentoKommo() {
  const { toast } = useToast();
  
  // Estados principais
  const [config, setConfig] = useState<SimoneConfig>(configInicial);
  const [servicos, setServicos] = useState<Servico[]>(servicosIniciais);
  const [regrasUpsell, setRegrasUpsell] = useState<RegraUpsell[]>(regrasUpsellIniciais);
  const [frases, setFrases] = useState<Frase[]>(frasesIniciais);
  const [alertas, setAlertas] = useState<Alerta[]>(alertasMock);
  const [historico, setHistorico] = useState<Historico[]>(historicoMock);
  
  // Estados de UI
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalServicoAberto, setModalServicoAberto] = useState(false);
  const [modalUpsellAberto, setModalUpsellAberto] = useState(false);
  const [modalFraseAberto, setModalFraseAberto] = useState(false);
  const [editandoServico, setEditandoServico] = useState<Servico | null>(null);
  const [editandoUpsell, setEditandoUpsell] = useState<RegraUpsell | null>(null);
  const [editandoFrase, setEditandoFrase] = useState<Frase | null>(null);

  // Métricas calculadas
  const metricas = {
    leadsProcessados: 156,
    leadsQuentes: 45,
    leadsMornos: 78,
    leadsFrios: 33,
    alertasPendentes: alertas.filter(a => !a.resolvido).length,
    taxaConversao: 68.5,
    tempoMedioResposta: 2.3,
    custoEstimado: 12.50
  };

  // Handlers
  const handleSalvarConfig = () => {
    toast({ title: "Configurações salvas!", description: "As alterações da Simone foram aplicadas." });
    setModalConfigAberto(false);
  };

  const handleToggleSimone = () => {
    setConfig(prev => ({ ...prev, ativa: !prev.ativa }));
    toast({ 
      title: config.ativa ? "Simone pausada" : "Simone ativada!", 
      description: config.ativa ? "A IA foi pausada temporariamente." : "A IA está funcionando novamente."
    });
  };

  const handleSalvarServico = (servico: Servico) => {
    if (editandoServico) {
      setServicos(prev => prev.map(s => s.id === servico.id ? servico : s));
      toast({ title: "Serviço atualizado!" });
    } else {
      setServicos(prev => [...prev, { ...servico, id: Date.now().toString() }]);
      toast({ title: "Serviço adicionado!" });
    }
    setModalServicoAberto(false);
    setEditandoServico(null);
  };

  const handleExcluirServico = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
    toast({ title: "Serviço removido!" });
  };

  const handleResolverAlerta = (id: string) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, resolvido: true } : a));
    toast({ title: "Alerta resolvido!" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              Simone - IA Central
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a inteligência artificial da Doctor Auto Bosch
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={config.ativa ? "default" : "secondary"} className="text-sm py-1 px-3">
              {config.ativa ? (
                <><Zap className="h-4 w-4 mr-1" /> Online</>
              ) : (
                <><Pause className="h-4 w-4 mr-1" /> Pausada</>
              )}
            </Badge>
            <Button variant={config.ativa ? "outline" : "default"} onClick={handleToggleSimone}>
              {config.ativa ? <><Pause className="h-4 w-4 mr-2" />Pausar</> : <><Play className="h-4 w-4 mr-2" />Ativar</>}
            </Button>
            <Button onClick={() => setModalConfigAberto(true)}>
              <Settings className="h-4 w-4 mr-2" />Configurar
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leads Processados</p>
                  <p className="text-2xl font-bold">{metricas.leadsProcessados}</p>
                </div>
                <Brain className="h-8 w-8 text-primary opacity-50" />
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="text-green-600">🔥 {metricas.leadsQuentes}</span>
                <span className="text-yellow-600">🌡️ {metricas.leadsMornos}</span>
                <span className="text-blue-600">❄️ {metricas.leadsFrios}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{metricas.taxaConversao}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Meta: 60%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Pendentes</p>
                  <p className="text-2xl font-bold text-orange-500">{metricas.alertasPendentes}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Leads aguardando</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Hoje</p>
                  <p className="text-2xl font-bold">R$ {metricas.custoEstimado.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">DeepSeek API</p>
            </CardContent>
          </Card>
        </div>

        {/* Abas Principais */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="upsell">Upsell</TabsTrigger>
            <TabsTrigger value="frases">Frases</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-4">
            {/* Alertas Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas Pendentes ({alertas.filter(a => !a.resolvido).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertas.filter(a => !a.resolvido).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum alerta pendente 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {alertas.filter(a => !a.resolvido).map(alerta => (
                      <div key={alerta.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">{alerta.lead_nome}</p>
                            <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{alerta.etapa}</Badge>
                              <Badge variant="outline" className="text-xs">{alerta.tempo_parado} min</Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleResolverAlerta(alerta.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />Resolver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historico.slice(0, 5).map(h => (
                    <div key={h.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        h.classificacao === 'quente' ? 'bg-green-100 text-green-600' :
                        h.classificacao === 'morno' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {h.classificacao === 'quente' ? '🔥' : h.classificacao === 'morno' ? '🌡️' : '❄️'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{h.lead_nome}</p>
                          <Badge variant="outline">Score: {h.score_calculado}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{h.resposta_ia}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(h.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Serviços */}
          <TabsContent value="servicos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Tabela de Serviços ({servicos.length})
                  </CardTitle>
                  <Button onClick={() => { setEditandoServico(null); setModalServicoAberto(true); }}>
                    <Plus className="h-4 w-4 mr-2" />Adicionar
                  </Button>
                </div>
                <CardDescription>
                  A Simone usa esses serviços para sugerir aos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicos.map(servico => (
                    <div key={servico.id} className={`p-4 rounded-lg border ${servico.ativo ? 'bg-card' : 'bg-muted/50 opacity-60'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{servico.nome}</h4>
                            <Badge variant="outline">{servico.categoria}</Badge>
                            {!servico.ativo && <Badge variant="secondary">Inativo</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{servico.descricao}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-green-600">R$ {servico.preco_minimo} - R$ {servico.preco_maximo}</span>
                            <span className="text-muted-foreground">⏱️ {servico.tempo_estimado}</span>
                            {servico.km_recomendado && (
                              <span className="text-muted-foreground">🚗 {servico.km_recomendado.toLocaleString()} km</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditandoServico(servico); setModalServicoAberto(true); }}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleExcluirServico(servico.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Upsell */}
          <TabsContent value="upsell" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Regras de Upsell ({regrasUpsell.length})
                  </CardTitle>
                  <Button onClick={() => { setEditandoUpsell(null); setModalUpsellAberto(true); }}>
                    <Plus className="h-4 w-4 mr-2" />Adicionar
                  </Button>
                </div>
                <CardDescription>
                  Regras automáticas para sugerir serviços extras baseado no carro e km
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regrasUpsell.map(regra => (
                    <div key={regra.id} className={`p-4 rounded-lg border ${regra.ativo ? 'bg-card' : 'bg-muted/50 opacity-60'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{regra.nome}</h4>
                            <Badge variant={regra.prioridade === 1 ? 'default' : 'secondary'}>
                              Prioridade {regra.prioridade}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Carros:</strong> {regra.condicao_carro}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>KM:</strong> {regra.condicao_km_min.toLocaleString()} - {regra.condicao_km_max.toLocaleString()}
                          </p>
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm">
                            <strong>Frase:</strong> {regra.frase_upsell}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Desconto máximo: {regra.desconto_permitido}%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditandoUpsell(regra); setModalUpsellAberto(true); }}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Frases */}
          <TabsContent value="frases" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Frases Padrão ({frases.length})
                  </CardTitle>
                  <Button onClick={() => { setEditandoFrase(null); setModalFraseAberto(true); }}>
                    <Plus className="h-4 w-4 mr-2" />Adicionar
                  </Button>
                </div>
                <CardDescription>
                  Mensagens que a Simone usa em diferentes situações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {['saudacao', 'followup', 'urgente', 'pos_venda'].map(tipo => (
                    <div key={tipo}>
                      <h4 className="font-medium mb-2 capitalize">{tipo.replace('_', ' ')}</h4>
                      <div className="space-y-2">
                        {frases.filter(f => f.tipo === tipo).map(frase => (
                          <div key={frase.id} className="p-3 bg-muted/50 rounded-lg flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{frase.nome}</p>
                              <p className="text-sm text-muted-foreground mt-1">{frase.conteudo}</p>
                              {frase.variaveis && (
                                <p className="text-xs text-blue-500 mt-1">Variáveis: {frase.variaveis}</p>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setEditandoFrase(frase); setModalFraseAberto(true); }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Histórico de Ações
                  </CardTitle>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historico.map(h => (
                    <div key={h.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{h.lead_nome}</span>
                          <Badge variant="outline">{h.acao}</Badge>
                          <Badge variant={
                            h.classificacao === 'quente' ? 'default' :
                            h.classificacao === 'morno' ? 'secondary' : 'outline'
                          }>
                            {h.classificacao === 'quente' ? '🔥' : h.classificacao === 'morno' ? '🌡️' : '❄️'} {h.classificacao}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(h.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{h.resposta_ia}</p>
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Etapa: {h.etapa_origem}</span>
                        <span>Score: {h.score_calculado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal: Configurações da Simone */}
        <Dialog open={modalConfigAberto} onOpenChange={setModalConfigAberto}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Configurações da Simone
              </DialogTitle>
              <DialogDescription>
                Personalize o comportamento da IA
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Prompt do Sistema */}
              <div className="space-y-2">
                <Label>Prompt do Sistema (Personalidade)</Label>
                <Textarea 
                  value={config.prompt_sistema}
                  onChange={(e) => setConfig(prev => ({ ...prev, prompt_sistema: e.target.value }))}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Define como a Simone se comporta, o que coleta e como vende
                </p>
              </div>

              {/* Tom de Voz */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tom de Voz</Label>
                  <Select value={config.tom_voz} onValueChange={(v) => setConfig(prev => ({ ...prev, tom_voz: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amigável e profissional">Amigável e Profissional</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="técnico">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Usar Emojis</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch 
                      checked={config.usa_emoji}
                      onCheckedChange={(v) => setConfig(prev => ({ ...prev, usa_emoji: v }))}
                    />
                    <span className="text-sm">{config.usa_emoji ? 'Sim 👍' : 'Não'}</span>
                  </div>
                </div>
              </div>

              {/* Tempos de Alerta */}
              <div className="space-y-2">
                <Label>Tempos de Alerta (minutos)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Qualificação</Label>
                    <Input 
                      type="number"
                      value={config.tempo_alerta_qualificacao}
                      onChange={(e) => setConfig(prev => ({ ...prev, tempo_alerta_qualificacao: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Atendimento</Label>
                    <Input 
                      type="number"
                      value={config.tempo_alerta_atendimento}
                      onChange={(e) => setConfig(prev => ({ ...prev, tempo_alerta_atendimento: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Follow-up</Label>
                    <Input 
                      type="number"
                      value={config.tempo_alerta_followup}
                      onChange={(e) => setConfig(prev => ({ ...prev, tempo_alerta_followup: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              {/* Desconto Máximo */}
              <div className="space-y-2">
                <Label>Desconto Máximo Permitido (%)</Label>
                <Input 
                  type="number"
                  value={config.desconto_maximo}
                  onChange={(e) => setConfig(prev => ({ ...prev, desconto_maximo: Number(e.target.value) }))}
                  max={50}
                  min={0}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalConfigAberto(false)}>Cancelar</Button>
              <Button onClick={handleSalvarConfig}>
                <Save className="h-4 w-4 mr-2" />Salvar Configurações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Adicionar/Editar Serviço */}
        <Dialog open={modalServicoAberto} onOpenChange={setModalServicoAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editandoServico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            </DialogHeader>
            <ServicoForm 
              servico={editandoServico}
              onSave={handleSalvarServico}
              onCancel={() => setModalServicoAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

function ServicoForm({ servico, onSave, onCancel }: { 
  servico: Servico | null; 
  onSave: (s: Servico) => void; 
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Servico>(servico || {
    id: '',
    nome: '',
    descricao: '',
    preco_minimo: 0,
    preco_maximo: 0,
    tempo_estimado: '',
    km_recomendado: null,
    categoria: 'revisão',
    ativo: true
  });

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Nome do Serviço</Label>
        <Input value={form.nome} onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={form.descricao} onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Preço Mínimo (R$)</Label>
          <Input type="number" value={form.preco_minimo} onChange={(e) => setForm(prev => ({ ...prev, preco_minimo: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Preço Máximo (R$)</Label>
          <Input type="number" value={form.preco_maximo} onChange={(e) => setForm(prev => ({ ...prev, preco_maximo: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tempo Estimado</Label>
          <Input value={form.tempo_estimado} onChange={(e) => setForm(prev => ({ ...prev, tempo_estimado: e.target.value }))} placeholder="Ex: 2-3 horas" />
        </div>
        <div className="space-y-2">
          <Label>KM Recomendado</Label>
          <Input type="number" value={form.km_recomendado || ''} onChange={(e) => setForm(prev => ({ ...prev, km_recomendado: e.target.value ? Number(e.target.value) : null }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={form.categoria} onValueChange={(v) => setForm(prev => ({ ...prev, categoria: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revisão">Revisão</SelectItem>
            <SelectItem value="motor">Motor</SelectItem>
            <SelectItem value="freios">Freios</SelectItem>
            <SelectItem value="suspensão">Suspensão</SelectItem>
            <SelectItem value="elétrica">Elétrica</SelectItem>
            <SelectItem value="conforto">Conforto</SelectItem>
            <SelectItem value="diagnóstico">Diagnóstico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.ativo} onCheckedChange={(v) => setForm(prev => ({ ...prev, ativo: v }))} />
        <Label>Serviço Ativo</Label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave(form)}>Salvar</Button>
      </DialogFooter>
    </div>
  );
}
