import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, ClipboardList, Car, Calendar, Users, 
  Wrench, DollarSign, BarChart3, Settings, Menu, X,
  ChevronLeft, LogOut, Sun, Moon, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Operacional",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/admin/overview", icon: BarChart3, label: "Visão Geral" },
      { to: "/admin/ordens-servico", icon: ClipboardList, label: "Ordens de Serviço" },
      { to: "/admin/patio", icon: Car, label: "Pátio" },
      { to: "/admin/agendamentos", icon: Calendar, label: "Agendamentos" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { to: "/admin/clientes", icon: Users, label: "Clientes" },
      { to: "/admin/servicos", icon: Wrench, label: "Serviços" },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { to: "/admin/financeiro", icon: DollarSign, label: "Financeiro" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { to: "/admin/configuracoes", icon: Settings, label: "Configurações" },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [colaborador, setColaborador] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("colaborador");
    if (stored) {
      setColaborador(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("colaborador");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex gradient-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-foreground">Doctor Auto</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-4">
                {sidebarOpen && (
                  <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
                    {section.title}
                  </h3>
                )}
                <nav className="space-y-1 px-2">
                  {section.items.map((item) => {
                    const isActive = location === item.to;
                    return (
                      <Link key={item.to} href={item.to}>
                        <a
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            !sidebarOpen && "justify-center px-2"
                          )}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {sidebarOpen && <span>{item.label}</span>}
                        </a>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="border-t border-border/50 p-4">
            {colaborador && sidebarOpen && (
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground">{colaborador.nome}</p>
                <p className="text-xs text-muted-foreground">{colaborador.cargo}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size={sidebarOpen ? "default" : "icon"}
              onClick={handleLogout}
              className={cn(
                "text-muted-foreground hover:text-foreground",
                sidebarOpen && "w-full justify-start gap-2"
              )}
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}
