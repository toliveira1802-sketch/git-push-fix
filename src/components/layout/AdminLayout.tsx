import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Car, 
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Plus,
  Bot,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Plus, label: 'Nova OS', path: '/admin/nova-os', highlight: true },
  { icon: ClipboardList, label: 'Ordens de Serviço', path: '/admin/ordens-servico' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: Car, label: 'Veículos', path: '/admin/veiculos' },
  { icon: Calendar, label: 'Agendamentos', path: '/admin/agendamentos' },
  { icon: BarChart3, label: 'Gestão', path: '/gestao' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <span className="font-bold text-lg text-foreground">Doctor Auto</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const isHighlight = 'highlight' in item && item.highlight;
            
            return (
              <Button
                key={item.path}
                variant={isHighlight ? "default" : isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "justify-center px-2",
                  isHighlight && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
              collapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <span className="font-bold text-lg text-foreground">Doctor Auto</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="p-2 space-y-1 border-t border-border bg-card">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const isHighlight = 'highlight' in item && item.highlight;
              
              return (
                <Button
                  key={item.path}
                  variant={isHighlight ? "default" : isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isHighlight && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-auto">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
}
