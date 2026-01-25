import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, Clock, Award, Target, Sparkles } from "lucide-react";
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

// Mock data para gráficos
const servicosData = [
  { mes: "Jan", servicos: 2 },
  { mes: "Fev", servicos: 1 },
  { mes: "Mar", servicos: 3 },
  { mes: "Abr", servicos: 2 },
  { mes: "Mai", servicos: 4 },
  { mes: "Jun", servicos: 2 },
];

const economiaData = [
  { mes: "Jan", economia: 80 },
  { mes: "Fev", economia: 40 },
  { mes: "Mar", economia: 120 },
  { mes: "Abr", economia: 80 },
  { mes: "Mai", economia: 160 },
  { mes: "Jun", economia: 80 },
];

const tiposServico = [
  { name: "Lavagem", value: 8, color: "#dc2626" },
  { name: "Polimento", value: 3, color: "#f59e0b" },
  { name: "Detalhamento", value: 2, color: "#10b981" },
  { name: "Outros", value: 1, color: "#6b7280" },
];

const ultimosServicos = [
  { id: 1, tipo: "Lavagem Completa", data: "20/01/2026", valor: "R$ 89,90", veiculo: "Honda Civic" },
  { id: 2, tipo: "Polimento", data: "15/01/2026", valor: "R$ 199,90", veiculo: "Honda Civic" },
  { id: 3, tipo: "Lavagem Simples", data: "08/01/2026", valor: "R$ 49,90", veiculo: "Toyota Corolla" },
];

const conquistas = [
  { id: 1, nome: "Primeiro Serviço", descricao: "Realizou seu primeiro serviço", icon: "🎉", conquistado: true },
  { id: 2, nome: "Cliente Frequente", descricao: "5 serviços realizados", icon: "⭐", conquistado: true },
  { id: 3, nome: "Cliente Fiel", descricao: "10 serviços realizados", icon: "🏆", conquistado: true },
  { id: 4, nome: "Economizador", descricao: "Economizou R$ 200+", icon: "💰", conquistado: true },
  { id: 5, nome: "VIP", descricao: "Alcançou nível Prata", icon: "👑", conquistado: false },
];

export default function VisaoGeral() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Visão Geral</h1>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-white/70 text-xs">Serviços</p>
              <p className="text-2xl font-bold text-white">14</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-white/70 text-xs">Economia</p>
              <p className="text-2xl font-bold text-white">R$560</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-white/70 text-xs">Pontos</p>
              <p className="text-2xl font-bold text-white">350</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Gráfico de Serviços */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
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
                  <Bar dataKey="servicos" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Economia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Economia Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={economiaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value) => [`R$ ${value}`, "Economia"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="economia" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Serviço */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Tipos de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tiposServico}
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tiposServico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {tiposServico.map((tipo) => (
                  <div key={tipo.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tipo.color }}
                      />
                      <span className="text-sm">{tipo.name}</span>
                    </div>
                    <span className="text-sm font-medium">{tipo.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programa de Fidelidade */}
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-red-600" />
              Programa de Fidelidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
                <Badge className="bg-amber-700 text-white mt-1">Bronze</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próximo Nível</p>
                <Badge variant="outline" className="border-slate-400 text-slate-400 mt-1">Prata</Badge>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>350 pontos</span>
                <span className="text-muted-foreground">500 pontos</span>
              </div>
              <Progress value={70} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Faltam 150 pontos para o próximo nível
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">Benefícios do nível Prata:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• 10% de cashback em todos os serviços</li>
                <li>• Agendamento prioritário</li>
                <li>• Brinde exclusivo no aniversário</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              🏆 Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {conquistas.map((conquista) => (
                <div 
                  key={conquista.id}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    conquista.conquistado 
                      ? "bg-amber-500/10" 
                      : "bg-muted/50 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{conquista.icon}</span>
                  <span className="text-[10px] text-center mt-1 line-clamp-2">
                    {conquista.nome}
                  </span>
                </div>
              ))}
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
            {ultimosServicos.map((servico) => (
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
            ))}
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
        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 text-white">
          <CardContent className="p-6 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <p className="text-white/80 text-sm">Você é nosso cliente há</p>
            <p className="text-3xl font-bold mt-1">8 meses</p>
            <p className="text-white/70 text-sm mt-2">
              Obrigado pela confiança! 🎉
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
