import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/hooks/useNavigate";
import { Users, Car, ClipboardList, ArrowRight } from "lucide-react";

const cadastroItems = [
  {
    icon: Users,
    title: "Clientes",
    description: "Gerencie o cadastro de clientes",
    path: "/admin/clientes",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    icon: ClipboardList,
    title: "Ordens de Serviço",
    description: "Visualize e gerencie as ordens de serviço",
    path: "/admin/ordens-servico",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    icon: Car,
    title: "Veículos",
    description: "Cadastro e histórico de veículos",
    path: "/admin/veiculos",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
];

export default function Cadastros() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cadastros</h1>
          <p className="text-muted-foreground">
            Gerencie clientes, veículos e ordens de serviço
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cadastroItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="cursor-pointer hover:shadow-lg transition-shadow border"
                onClick={() => navigate(item.path)}
              >
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
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
