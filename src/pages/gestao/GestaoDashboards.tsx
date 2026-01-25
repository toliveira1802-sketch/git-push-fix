import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  UserCog,
  Cog,
  DollarSign,
  Laptop,
  Megaphone,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    title: "Recursos Humanos",
    description: "Gerencie mecânicos, performance e feedbacks da equipe",
    url: "/gestao/rh",
    icon: UserCog,
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Operações",
    description: "Acompanhe agendamentos, status e fluxo operacional",
    url: "/gestao/operacoes",
    icon: Cog,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    title: "Financeiro",
    description: "Monitore faturamento, metas e indicadores financeiros",
    url: "/gestao/financeiro",
    icon: DollarSign,
    color: "from-amber-500 to-amber-600"
  },
  {
    title: "Tecnologia",
    description: "Dados do sistema, usuários e Assistentes IA",
    url: "/gestao/tecnologia",
    icon: Laptop,
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Comercial e Marketing",
    description: "Promoções, campanhas e novos cadastros de clientes",
    url: "/gestao/comercial",
    icon: Megaphone,
    color: "from-pink-500 to-pink-600",
    showBadge: true
  },
  {
    title: "Melhorias",
    description: "Sugestões e ideias para evolução do sistema",
    url: "/admin/melhorias",
    icon: Lightbulb,
    color: "from-cyan-500 to-cyan-600"
  },
];

export default function GestaoDashboards() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('pending_review', true);
      
      setPendingCount(count || 0);
    };

    fetchPendingCount();

    // Realtime updates
    const channel = supabase
      .channel('pending-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestão</h1>
          <p className="text-muted-foreground">
            Dashboards e relatórios gerenciais
          </p>
        </div>

        {/* Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            const showBadge = 'showBadge' in module && module.showBadge && pendingCount > 0;
            
            return (
              <Card
                key={module.url}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden relative"
                onClick={() => navigate(module.url)}
              >
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute top-3 right-3 z-10 animate-pulse"
                  >
                    {pendingCount}
                  </Badge>
                )}
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${module.color} p-4`}>
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{module.title}</h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
