import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@/hooks/useNavigate";
import { Users, Car, ClipboardList, Wrench, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const cadastroItems = [
  {
    icon: Users,
    title: "Clientes",
    description: "Gerencie o cadastro de clientes",
    path: "/admin/clientes",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    countKey: "clientes" as const,
  },
  {
    icon: ClipboardList,
    title: "Ordens de Serviço",
    description: "Visualize e gerencie as ordens de serviço",
    path: "/admin/ordens-servico",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    countKey: "ordens_servico" as const,
  },
  {
    icon: Car,
    title: "Veículos",
    description: "Cadastro e histórico de veículos",
    path: "/admin/veiculos",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    countKey: "veiculos" as const,
  },
  {
    icon: Wrench,
    title: "Catálogo de Serviços",
    description: "Tipos de serviço, valores e tempos estimados",
    path: "/admin/servicos",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    countKey: "catalogo_servicos" as const,
  },
];

export default function Cadastros() {
  const navigate = useNavigate();

  const { data: counts } = useQuery({
    queryKey: ["cadastros-counts"],
    queryFn: async () => {
      const [clientes, os, veiculos, servicos] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("ordens_servico").select("id", { count: "exact", head: true }),
        supabase.from("veiculos").select("id", { count: "exact", head: true }),
        supabase.from("catalogo_servicos").select("id", { count: "exact", head: true }),
      ]);
      return {
        clientes: clientes.count ?? 0,
        ordens_servico: os.count ?? 0,
        veiculos: veiculos.count ?? 0,
        catalogo_servicos: servicos.count ?? 0,
      };
    },
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cadastros</h1>
          <p className="text-muted-foreground">
            Gerencie clientes, veículos, ordens de serviço e serviços
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cadastroItems.map((item) => {
            const Icon = item.icon;
            const count = counts?.[item.countKey];
            return (
              <Card
                key={item.path}
                className="cursor-pointer hover:shadow-lg transition-shadow border group"
                onClick={() => navigate(item.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {count !== undefined && (
                      <Badge variant="secondary" className="text-lg font-bold px-3">
                        {count}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto group-hover:text-primary transition-colors">
                    Acessar <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
