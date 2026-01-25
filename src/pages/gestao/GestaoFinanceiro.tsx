import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Receipt, ArrowLeft, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

// Mock data
const mockKpis = {
  totalRevenue: 85000,
  avgTicket: 1890,
  totalAppointments: 45,
  monthGoal: 100000,
  goalProgress: 85,
};

const dailyRevenue = [
  { date: "01/01", value: 3500 },
  { date: "05/01", value: 5200 },
  { date: "10/01", value: 8900 },
  { date: "15/01", value: 12000 },
  { date: "20/01", value: 18500 },
  { date: "25/01", value: 25000 },
  { date: "Hoje", value: 85000 },
];

export default function GestaoFinanceiro() {
  const navigate = useNavigate();
  const [kpis] = useState(mockKpis);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gestao")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-amber-500" />
              Financeiro
            </h1>
            <p className="text-muted-foreground">
              Faturamento e metas
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Faturamento do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.avgTicket)}</p>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">Serviços Realizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.monthGoal)}</p>
                  <p className="text-xs text-muted-foreground">Meta do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso da Meta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progresso da Meta</span>
              <span className="text-lg font-bold text-primary">{kpis.goalProgress}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={kpis.goalProgress} className="h-4" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Atual: {formatCurrency(kpis.totalRevenue)}</span>
              <span>Meta: {formatCurrency(kpis.monthGoal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Faturamento */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
