import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Laptop, Users, Database, Activity, ArrowLeft, Brain, Lock, ArrowRight, Receipt } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// Senha para acessar o painel de IA (em produção, isso seria validado no backend)
const IA_ACCESS_PASSWORD = "doctor2024";

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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAccessIA = () => {
    // Verificar se já está autenticado nesta sessão
    const storedAuth = sessionStorage.getItem("ia_access_granted");
    if (storedAuth === "true") {
      navigate("/admin/ias");
      return;
    }
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    if (password === IA_ACCESS_PASSWORD) {
      sessionStorage.setItem("ia_access_granted", "true");
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      setPassword("");
      toast.success("Acesso liberado!");
      navigate("/admin/ias");
    } else {
      toast.error("Senha incorreta");
      setPassword("");
    }
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
              Métricas do sistema e usuários
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

        {/* Card de Acesso aos Assistentes IA */}
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Assistentes IA
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dr. Auto, Anna Laura e Orça Pro - Acesso restrito
                  </p>
                </div>
              </div>
              <Button onClick={handleAccessIA} className="gap-2">
                Acessar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Dialog de Senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Acesso Restrito
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Digite a senha para acessar o painel de Assistentes IA.
            </p>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Entrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
