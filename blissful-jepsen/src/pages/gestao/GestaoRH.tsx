import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCog, Users, Award, TrendingUp, ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Mechanic {
  id: string;
  name: string;
  specialty: string | null;
  is_active: boolean;
}

export default function GestaoRH() {
  const navigate = useNavigate();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMechanics = async () => {
      const { data, error } = await supabase
        .from('mecanicos')
        .select('id, name, specialty, is_active')
        .order('name');
      
      if (!error && data) {
        setMechanics(data as Mechanic[]);
      }
      setLoading(false);
    };

    fetchMechanics();
  }, []);

  const activeMechanics = mechanics.filter(m => m.is_active);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gestao")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

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
                  <p className="text-2xl font-bold">-</p>
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
                  <p className="text-2xl font-bold">-</p>
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
            {mechanics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum mecânico cadastrado</p>
              </div>
            ) : (
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
                        <p className="text-sm text-muted-foreground">{mechanic.specialty || "Geral"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant={mechanic.is_active ? "default" : "secondary"}>
                        {mechanic.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
