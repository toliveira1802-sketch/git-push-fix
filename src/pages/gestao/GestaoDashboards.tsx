import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
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
    description: "Promoções, campanhas e aquisição de clientes",
    url: "/gestao/comercial",
    icon: Megaphone,
    color: "from-rose-500 to-rose-600"
  },
  {
    title: "Melhorias",
    description: "Sugestões e ideias para evolução do sistema",
    url: "/gestao/melhorias",
    icon: Lightbulb,
    color: "from-cyan-500 to-cyan-600"
  },
];

export default function GestaoDashboards() {
  const navigate = useNavigate();

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
            return (
              <Card
                key={module.url}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                onClick={() => navigate(module.url)}
              >
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
