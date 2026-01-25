import { TrendingUp, Target, Zap, Award, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default function Performance() {
  // Mock performance data
  const stats = {
    totalServices: 12,
    totalSpent: 2450,
    cashbackEarned: 367.50,
    vehiclesManaged: 2,
    nextServiceIn: 45,
  };

  const achievements = [
    { id: 1, name: "Primeiro Serviço", icon: Car, unlocked: true },
    { id: 2, name: "Cliente Fiel", icon: Award, unlocked: true },
    { id: 3, name: "5 Serviços", icon: Target, unlocked: true },
    { id: 4, name: "10 Serviços", icon: TrendingUp, unlocked: true },
    { id: 5, name: "Cliente VIP", icon: Zap, unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Performance</h1>
        <p className="text-white/80 mt-1">Seu histórico de cuidados</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalServices}</p>
                  <p className="text-xs text-muted-foreground">Serviços realizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {stats.cashbackEarned.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Cashback ganho</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Spent */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Investimento em Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              R$ {stats.totalSpent.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total investido em cuidados com seu veículo
            </p>
          </CardContent>
        </Card>

        {/* Next Service */}
        <Card className="shadow-lg border-0 bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Próxima revisão em</p>
                <p className="text-2xl font-bold text-amber-600">{stats.nextServiceIn} dias</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Progress value={70} className="h-2 mt-3" />
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-red-500" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {achievements.map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      achievement.unlocked 
                        ? "bg-red-500/10" 
                        : "bg-muted/50 opacity-50"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${
                      achievement.unlocked ? "text-red-500" : "text-muted-foreground"
                    }`} />
                    <p className="text-[10px] text-center mt-1 text-muted-foreground">
                      {achievement.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Stats */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Seus Veículos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Honda Civic</p>
                  <p className="text-xs text-muted-foreground">ABC-1234</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">8 serviços</p>
                <p className="text-xs text-muted-foreground">R$ 1.650</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Toyota Corolla</p>
                  <p className="text-xs text-muted-foreground">XYZ-5678</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">4 serviços</p>
                <p className="text-xs text-muted-foreground">R$ 800</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-4" />
      </div>

      <BottomNavigation />
    </div>
  );
}
