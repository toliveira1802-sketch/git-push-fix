import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop, Users, Database, Activity, ArrowLeft, Brain, ArrowRight, Receipt } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useUserRole } from "@/hooks/useUserRole";
import { IAPanel } from "@/components/ia/IAPanel";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// Mock data
const mockKpis = {
  totalUsers: 248,
  activeToday: 37,
  totalVehicles: 312,
  totalAppointments: 1250,
};

const funnelData = [
  { name: "Visitantes", value: 1200 },
  { name: "Cadastros", value: 248 },
  { name: "Agendamentos", value: 156 },
  { name: "Concluídos", value: 120 },
];

export default function GestaoTecnologia() {
  const navigate = useNavigate();
  const [kpis] = useState(mockKpis);
  const [activeTab, setActiveTab] = useState("overview");
  const { canAccessAdmin, canAccessGestao } = useUserRole();

  const canAccessIA = canAccessAdmin || canAccessGestao;

  const handleTabChange = (value: string) => {
    if (value === "ias" && !canAccessIA) {
      toast.error("Acesso negado. Apenas admin/gestao/dev podem acessar.");
      return;
    }
    setActiveTab(value);
  };

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
              <Laptop className="h-6 w-6 text-purple-500" />
              Tecnologia
            </h1>
            <p className="text-muted-foreground">
              Métricas do sistema, usuários e IAs
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="ias">Assistentes IA</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.totalUsers}</p>
                      <p className="text-xs text-muted-foreground">Usuários Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.activeToday}</p>
                      <p className="text-xs text-muted-foreground">Ativos Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.totalVehicles}</p>
                      <p className="text-xs text-muted-foreground">Veículos Cadastrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.totalAppointments}</p>
                      <p className="text-xs text-muted-foreground">Agendamentos Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card de Acesso ao Dashboard de Orçamentos */}
            <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <Receipt className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dashboard de Orçamentos</h3>
                      <p className="text-sm text-muted-foreground">
                        Análise de conversão, margens e oportunidades
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/admin/orcamentos")} className="gap-2">
                    Acessar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={funnelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {funnelData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium">API Principal</span>
                    </div>
                    <span className="text-sm text-emerald-600">Operacional</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium">Banco de Dados</span>
                    </div>
                    <span className="text-sm text-emerald-600">Operacional</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium">Assistentes IA</span>
                    </div>
                    <span className="text-sm text-emerald-600">Operacional</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Assistentes IA */}
          <TabsContent value="ias" className="mt-6">
            <IAPanel onNavigateKommo={() => navigate('/admin/monitoramento-kommo')} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
