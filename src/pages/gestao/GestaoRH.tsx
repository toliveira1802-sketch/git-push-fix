import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Users, Award, TrendingUp, ArrowLeft, Star } from "lucide-react";

// Mock data para mecânicos
const mockMechanics = [
  { id: "1", name: "Thales", specialty: "Motor", is_active: true, performance: 92, quality: 95 },
  { id: "2", name: "Pedro", specialty: "Elétrica", is_active: true, performance: 88, quality: 90 },
  { id: "3", name: "João", specialty: "Suspensão", is_active: true, performance: 85, quality: 88 },
  { id: "4", name: "Lucas", specialty: "Freios", is_active: false, performance: 78, quality: 82 },
];

export default function GestaoRH() {
  const navigate = useNavigate();
  const [mechanics] = useState(mockMechanics);

  const activeMechanics = mechanics.filter(m => m.is_active);
  const avgPerformance = Math.round(
    activeMechanics.reduce((acc, m) => acc + m.performance, 0) / activeMechanics.length
  );
  const avgQuality = Math.round(
    activeMechanics.reduce((acc, m) => acc + m.quality, 0) / activeMechanics.length
  );

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
              <UserCog className="h-6 w-6 text-blue-500" />
              Recursos Humanos
            </h1>
            <p className="text-muted-foreground">
              Gestão da equipe técnica
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
                  <p className="text-2xl font-bold">{mechanics.length}</p>
                  <p className="text-xs text-muted-foreground">Total Mecânicos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeMechanics.length}</p>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgPerformance}%</p>
                  <p className="text-xs text-muted-foreground">Performance Média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgQuality}%</p>
                  <p className="text-xs text-muted-foreground">Qualidade Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Mecânicos */}
        <Card>
          <CardHeader>
            <CardTitle>Equipe Técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mechanics.map((mechanic) => (
                <div
                  key={mechanic.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {mechanic.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{mechanic.name}</p>
                      <p className="text-sm text-muted-foreground">{mechanic.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{mechanic.performance}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Performance</p>
                    </div>
                    <Badge variant={mechanic.is_active ? "default" : "secondary"}>
                      {mechanic.is_active ? "Ativo" : "Inativo"}
                    </Badge>
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
