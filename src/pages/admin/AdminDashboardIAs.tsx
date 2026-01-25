import { useState } from "react";
import { 
  Eye, MessageSquare, BarChart3, Users, RefreshCw,
  AlertTriangle, Clock, CheckCircle, TrendingUp, TrendingDown,
  Phone, Mail, Car, Zap, Target, Calendar, Send,
  ThumbsUp, ThumbsDown, Flame, Snowflake, Sun, CloudSun
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { cn } from "@/lib/utils";

// Configuração das IAs
const iasConfig = {
  zoraide: {
    nome: "Zoraide",
    funcao: "Monitor de Leads",
    emoji: "🔍",
    cor: "purple",
    descricao: "Monitora leads >5min sem resposta, evita estouro 24h, extrai dados do CRM",
  },
  anna: {
    nome: "Anna",
    funcao: "Vendedora IA",
    emoji: "💰",
    cor: "green",
    descricao: "Atende leads, qualifica, agenda e faz pós-venda",
  },
  joao: {
    nome: "João",
    funcao: "Analisador de Qualidade",
    emoji: "📊",
    cor: "blue",
    descricao: "Mede qualidade do lead em tempo real com métricas de mercado",
  },
  luiz: {
    nome: "Luiz",
    funcao: "Freelancer - Mapeador",
    emoji: "📋",
    cor: "orange",
    descricao: "Mapeia leads antigos e cria base por ondas para reativação",
  },
  pedro: {
    nome: "Pedro",
    funcao: "Reativador",
    emoji: "🔄",
    cor: "red",
    descricao: "Reativa leads das bases filtradas pelo João",
  },
};

// Dados mock para demonstração
const mockData = {
  zoraide: {
    status: "online",
    alertasHoje: 12,
    alertasResolvidos: 10,
    camposPreenchidos: 45,
    tempoMedioResolucao: 8,
    alertasAtivos: [
      { lead: "João Silva", tempo: 15, tipo: "urgente", telefone: "11999887766" },
      { lead: "Maria Santos", tempo: 7, tipo: "atencao", telefone: "11988776655" },
    ],
    ultimasExtracoes: [
      { lead: "Carlos Oliveira", campos: ["email", "carro"], hora: "14:32" },
      { lead: "Ana Paula", campos: ["carro"], hora: "14:28" },
      { lead: "Roberto Lima", campos: ["email", "carro"], hora: "14:15" },
    ],
  },
  anna: {
    status: "online",
    leadsHoje: 28,
    emAtendimento: 3,
    bocaDoGol: 5,
    agendados: 8,
    transferidos: 2,
    posVenda: 4,
    tempoMedioResposta: 45,
    taxaAgendamento: 28.5,
    atendimentosAtivos: [
      { lead: "Fernando Costa", status: "em_andamento", tempo: 12, score: 72 },
      { lead: "Lucia Mendes", status: "boca_do_gol", tempo: 25, score: 85 },
      { lead: "Paulo Souza", status: "em_andamento", tempo: 5, score: 45 },
    ],
  },
  joao: {
    status: "online",
    analisadosHoje: 28,
    scoreMedio: 58,
    distribuicao: {
      quentes: 5,
      mornos: 12,
      frios: 8,
      gelados: 3,
    },
    ultimasAnalises: [
      { lead: "Fernando Costa", score: 72, temperatura: "quente", sinais: ["perguntou_preco", "urgencia"] },
      { lead: "Lucia Mendes", score: 85, temperatura: "quente", sinais: ["agendamento", "enviou_midia"] },
      { lead: "Paulo Souza", score: 45, temperatura: "morno", sinais: ["engajamento"] },
      { lead: "Carla Dias", score: 28, temperatura: "frio", sinais: [] },
    ],
  },
  luiz: {
    status: "online",
    totalMapeados: 1250,
    prontoReativacao: 380,
    enviadosPedro: 120,
    ondas: {
      onda1: 85,
      onda2: 145,
      onda3: 98,
      onda4: 52,
    },
    ultimosMapeados: [
      { nome: "Ricardo Alves", onda: 1, score: 65, dias: 35 },
      { nome: "Sandra Lima", onda: 2, score: 42, dias: 68 },
      { nome: "Marcos Pereira", onda: 1, score: 58, dias: 42 },
    ],
  },
  pedro: {
    status: "standby",
    enviadasHoje: 45,
    respostasHoje: 12,
    reativadosHoje: 4,
    taxaResposta: 26.7,
    taxaReativacao: 8.9,
    ultimasReativacoes: [
      { nome: "José Santos", onda: 1, respondeu: true, reativou: true },
      { nome: "Paula Costa", onda: 2, respondeu: true, reativou: false },
      { nome: "André Silva", onda: 1, respondeu: false, reativou: false },
    ],
  },
};

// Componente de Status da IA
const IAStatus = ({ status }: { status: string }) => {
  const config = {
    online: { label: "Online", color: "bg-green-500", pulse: true },
    standby: { label: "Standby", color: "bg-yellow-500", pulse: false },
    offline: { label: "Offline", color: "bg-red-500", pulse: false },
  };
  const s = config[status as keyof typeof config] || config.offline;
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-3 h-3 rounded-full", s.color, s.pulse && "animate-pulse")} />
      <span className="text-sm font-medium">{s.label}</span>
    </div>
  );
};

// Componente de Temperatura
const Temperatura = ({ temp }: { temp: string }) => {
  const config = {
    quente: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
    morno: { icon: Sun, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    frio: { icon: CloudSun, color: "text-blue-400", bg: "bg-blue-400/10" },
    gelado: { icon: Snowflake, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  };
  const t = config[temp as keyof typeof config] || config.frio;
  const Icon = t.icon;
  
  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", t.bg, t.color)}>
      <Icon className="w-3 h-3" />
      {temp}
    </div>
  );
};

export default function AdminDashboardIAs() {
  const [iaAtiva, setIaAtiva] = useState<keyof typeof iasConfig>("anna");

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">🤖 Central de IAs</h1>
            <p className="text-muted-foreground">Monitore o Exército de IAs em tempo real</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Cards das IAs - Visão Geral */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(iasConfig).map(([key, ia]) => {
            const data = mockData[key as keyof typeof mockData];
            const isActive = iaAtiva === key;
            
            return (
              <Card 
                key={key}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  isActive && "ring-2 ring-primary"
                )}
                onClick={() => setIaAtiva(key as keyof typeof iasConfig)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{ia.emoji}</div>
                  <h3 className="font-bold">{ia.nome}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{ia.funcao}</p>
                  <IAStatus status={data.status} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Painel da IA Selecionada */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{iasConfig[iaAtiva].emoji}</div>
                <div>
                  <CardTitle className="text-2xl">{iasConfig[iaAtiva].nome}</CardTitle>
                  <CardDescription>{iasConfig[iaAtiva].descricao}</CardDescription>
                </div>
              </div>
              <IAStatus status={mockData[iaAtiva].status} />
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* ZORAIDE - Monitor */}
            {iaAtiva === "zoraide" && (
              <div className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{mockData.zoraide.alertasHoje}</p>
                      <p className="text-sm text-muted-foreground">Alertas Hoje</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{mockData.zoraide.alertasResolvidos}</p>
                      <p className="text-sm text-muted-foreground">Resolvidos</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{mockData.zoraide.camposPreenchidos}</p>
                      <p className="text-sm text-muted-foreground">Campos Extraídos</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-500/10 border-orange-500/20">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{mockData.zoraide.tempoMedioResolucao}min</p>
                      <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Alertas Ativos */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Alertas Ativos
                    </h3>
                    <div className="space-y-2">
                      {mockData.zoraide.alertasAtivos.map((alerta, i) => (
                        <div key={i} className={cn(
                          "p-3 rounded-lg border flex items-center justify-between",
                          alerta.tipo === "urgente" ? "bg-red-500/10 border-red-500/30" : "bg-yellow-500/10 border-yellow-500/30"
                        )}>
                          <div>
                            <p className="font-medium">{alerta.lead}</p>
                            <p className="text-sm text-muted-foreground">{alerta.telefone}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={alerta.tipo === "urgente" ? "destructive" : "outline"}>
                              {alerta.tempo}min
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Últimas Extrações
                    </h3>
                    <div className="space-y-2">
                      {mockData.zoraide.ultimasExtracoes.map((ext, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                          <div>
                            <p className="font-medium">{ext.lead}</p>
                            <div className="flex gap-1 mt-1">
                              {ext.campos.map((campo, j) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {campo === "email" ? <Mail className="w-3 h-3 mr-1" /> : <Car className="w-3 h-3 mr-1" />}
                                  {campo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{ext.hora}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANNA - Vendedora */}
            {iaAtiva === "anna" && (
              <div className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{mockData.anna.leadsHoje}</p>
                      <p className="text-sm text-muted-foreground">Leads Hoje</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-500/10 border-yellow-500/20">
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{mockData.anna.bocaDoGol}</p>
                      <p className="text-sm text-muted-foreground">Boca do Gol</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{mockData.anna.agendados}</p>
                      <p className="text-sm text-muted-foreground">Agendados</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{mockData.anna.taxaAgendamento}%</p>
                      <p className="text-sm text-muted-foreground">Taxa Agendamento</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Atendimentos Ativos */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    Atendimentos em Andamento
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {mockData.anna.atendimentosAtivos.map((atend, i) => (
                      <Card key={i} className={cn(
                        "border-2",
                        atend.status === "boca_do_gol" ? "border-yellow-500 bg-yellow-500/5" : "border-border"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{atend.lead}</span>
                            {atend.status === "boca_do_gol" && (
                              <Badge className="bg-yellow-500">🎯 Boca do Gol!</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>{atend.tempo}min</span>
                            <span>Score: {atend.score}</span>
                          </div>
                          <Progress value={atend.score} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Stats Secundários */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-green-500">{mockData.anna.tempoMedioResposta}s</p>
                    <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-500">{mockData.anna.transferidos}</p>
                    <p className="text-sm text-muted-foreground">Transferidos Humano</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-500">{mockData.anna.posVenda}</p>
                    <p className="text-sm text-muted-foreground">Pós-Venda Hoje</p>
                  </div>
                </div>
              </div>
            )}

            {/* JOÃO - Analisador */}
            {iaAtiva === "joao" && (
              <div className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{mockData.joao.analisadosHoje}</p>
                      <p className="text-sm text-muted-foreground">Analisados Hoje</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{mockData.joao.scoreMedio}</p>
                      <p className="text-sm text-muted-foreground">Score Médio</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-500/10 border-red-500/20">
                    <CardContent className="p-4 text-center">
                      <Flame className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{mockData.joao.distribuicao.quentes}</p>
                      <p className="text-sm text-muted-foreground">Leads Quentes</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-cyan-500/10 border-cyan-500/20">
                    <CardContent className="p-4 text-center">
                      <Snowflake className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
                      <p className="text-2xl font-bold">{mockData.joao.distribuicao.gelados}</p>
                      <p className="text-sm text-muted-foreground">Leads Gelados</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Distribuição de Temperatura */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Distribuição de Temperatura</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-red-500" />
                        <span className="w-20">Quentes</span>
                        <Progress value={(mockData.joao.distribuicao.quentes / mockData.joao.analisadosHoje) * 100} className="flex-1 h-3" />
                        <span className="w-8 text-right font-bold">{mockData.joao.distribuicao.quentes}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sun className="w-5 h-5 text-yellow-500" />
                        <span className="w-20">Mornos</span>
                        <Progress value={(mockData.joao.distribuicao.mornos / mockData.joao.analisadosHoje) * 100} className="flex-1 h-3" />
                        <span className="w-8 text-right font-bold">{mockData.joao.distribuicao.mornos}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CloudSun className="w-5 h-5 text-blue-400" />
                        <span className="w-20">Frios</span>
                        <Progress value={(mockData.joao.distribuicao.frios / mockData.joao.analisadosHoje) * 100} className="flex-1 h-3" />
                        <span className="w-8 text-right font-bold">{mockData.joao.distribuicao.frios}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Snowflake className="w-5 h-5 text-cyan-500" />
                        <span className="w-20">Gelados</span>
                        <Progress value={(mockData.joao.distribuicao.gelados / mockData.joao.analisadosHoje) * 100} className="flex-1 h-3" />
                        <span className="w-8 text-right font-bold">{mockData.joao.distribuicao.gelados}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Últimas Análises</h3>
                    <div className="space-y-2">
                      {mockData.joao.ultimasAnalises.map((analise, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                          <div>
                            <p className="font-medium">{analise.lead}</p>
                            <div className="flex gap-1 mt-1">
                              {analise.sinais.map((sinal, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {sinal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{analise.score}</span>
                            <Temperatura temp={analise.temperatura} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LUIZ - Freelancer */}
            {iaAtiva === "luiz" && (
              <div className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-orange-500/10 border-orange-500/20">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{mockData.luiz.totalMapeados}</p>
                      <p className="text-sm text-muted-foreground">Total Mapeados</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{mockData.luiz.prontoReativacao}</p>
                      <p className="text-sm text-muted-foreground">Prontos Reativação</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <Send className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{mockData.luiz.enviadosPedro}</p>
                      <p className="text-sm text-muted-foreground">Enviados pro Pedro</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-sm text-muted-foreground">Ondas Ativas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Ondas */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Distribuição por Ondas</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">🌊 Onda 1 (30 dias)</span>
                          <span className="text-2xl font-bold">{mockData.luiz.ondas.onda1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Score &gt;40 - Alta prioridade</p>
                      </div>
                      <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">🌊 Onda 2 (30-90 dias)</span>
                          <span className="text-2xl font-bold">{mockData.luiz.ondas.onda2}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Score &gt;30 - Média prioridade</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">🌊 Onda 3 (90-180 dias)</span>
                          <span className="text-2xl font-bold">{mockData.luiz.ondas.onda3}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Score &gt;20 - Baixa prioridade</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">🌊 Onda 4 (&gt;180 dias)</span>
                          <span className="text-2xl font-bold">{mockData.luiz.ondas.onda4}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Qualquer score - Reativação fria</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Últimos Mapeados</h3>
                    <div className="space-y-2">
                      {mockData.luiz.ultimosMapeados.map((lead, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                          <div>
                            <p className="font-medium">{lead.nome}</p>
                            <p className="text-sm text-muted-foreground">{lead.dias} dias sem contato</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Onda {lead.onda}</Badge>
                            <span className="font-bold">{lead.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PEDRO - Reativador */}
            {iaAtiva === "pedro" && (
              <div className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-red-500/10 border-red-500/20">
                    <CardContent className="p-4 text-center">
                      <Send className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{mockData.pedro.enviadasHoje}</p>
                      <p className="text-sm text-muted-foreground">Enviadas Hoje</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{mockData.pedro.respostasHoje}</p>
                      <p className="text-sm text-muted-foreground">Respostas</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-4 text-center">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{mockData.pedro.reativadosHoje}</p>
                      <p className="text-sm text-muted-foreground">Reativados</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{mockData.pedro.taxaReativacao}%</p>
                      <p className="text-sm text-muted-foreground">Taxa Reativação</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Taxas */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Taxa de Resposta</span>
                          <span className="font-bold">{mockData.pedro.taxaResposta}%</span>
                        </div>
                        <Progress value={mockData.pedro.taxaResposta} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Taxa de Reativação</span>
                          <span className="font-bold">{mockData.pedro.taxaReativacao}%</span>
                        </div>
                        <Progress value={mockData.pedro.taxaReativacao} className="h-3" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Últimas Reativações</h3>
                    <div className="space-y-2">
                      {mockData.pedro.ultimasReativacoes.map((reativ, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {reativ.reativou ? (
                              <ThumbsUp className="w-5 h-5 text-green-500" />
                            ) : reativ.respondeu ? (
                              <MessageSquare className="w-5 h-5 text-blue-500" />
                            ) : (
                              <ThumbsDown className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium">{reativ.nome}</p>
                              <p className="text-sm text-muted-foreground">Onda {reativ.onda}</p>
                            </div>
                          </div>
                          <Badge variant={reativ.reativou ? "default" : reativ.respondeu ? "secondary" : "outline"}>
                            {reativ.reativou ? "Reativado!" : reativ.respondeu ? "Respondeu" : "Sem resposta"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
