import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, Target, TrendingUp, ArrowLeft, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

// Mock data
const mockKpis = {
  totalClients: 248,
  newClients: 23,
  promoClicks: 156,
  activePromos: 3,
  conversionRate: 12.5,
  averageTicket: 1890,
  monthlyRevenue: 85000,
  leadCount: 45,
};

const promoStats = [
  { title: "Troca de Óleo 20% OFF", clicks: 89 },
  { title: "Revisão Completa", clicks: 45 },
  { title: "Check-up Grátis", clicks: 22 },
];

const dailyClients = [
  { date: "Seg", count: 5 },
  { date: "Ter", count: 8 },
  { date: "Qua", count: 6 },
  { date: "Qui", count: 12 },
  { date: "Sex", count: 15 },
  { date: "Sáb", count: 10 },
  { date: "Dom", count: 3 },
];

export default function GestaoComercial() {
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
              <Megaphone className="h-6 w-6 text-rose-500" />
              Comercial e Marketing
            </h1>
            <p className="text-muted-foreground">
              Promoções e aquisição de clientes
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.totalClients}</p>
                  <p className="text-xs text-muted-foreground">Total Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{kpis.newClients}</p>
                  <p className="text-xs text-muted-foreground">Novos Este Mês</p>
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
                  <p className="text-2xl font-bold">{kpis.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.activePromos}</p>
                  <p className="text-xs text-muted-foreground">Promoções Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Novos Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Novos Clientes por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyClients}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance das Promoções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Performance das Promoções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {promoStats.map((promo, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="font-medium">{promo.title}</span>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{promo.clicks} cliques</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
