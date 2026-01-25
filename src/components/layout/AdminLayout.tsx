import { ReactNode, useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Menu,
  Plus,
  MapPin,
  Home,
  BarChart3,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCompany, Company } from '@/contexts/CompanyContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: ReactNode;
}

const companyMenuItems = [
  { icon: Home, label: 'Home', path: '/admin' },
  { icon: BarChart3, label: 'Visão Geral', path: '/admin/visao-geral' },
  { icon: Plus, label: 'Nova OS', path: '/admin/nova-os' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: ClipboardList, label: 'Ordens de Serviço', path: '/admin/ordens-servico' },
  { icon: MapPin, label: 'Pátio', path: '/admin/patio' },
  { icon: Calendar, label: 'Agendamentos', path: '/admin/agendamentos' },
];

const systemMenuItems = [
  { icon: Car, label: 'Veículos', path: '/admin/veiculos' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);
  
  const { companies, currentCompany, setCurrentCompany } = useCompany();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
    }
  };

  const renderMenuItem = (item: { icon: any; label: string; path: string; highlight?: boolean }, onClick?: () => void) => {
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
          isHighlight && "bg-primary text-primary-foreground hover:bg-primary/90",
          isActive && "bg-secondary"
        )}
        onClick={() => {
          navigate(item.path);
          onClick?.();
        }}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header with Avatar */}
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              AD
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sidebar-foreground truncate">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Company Selector */}
        {!collapsed && (
          <div className="p-2 border-b border-sidebar-border">
            <Select value={currentCompany.id} onValueChange={handleCompanyChange}>
              <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <SelectValue placeholder="Selecione a empresa" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* Company Section */}
          <Collapsible open={companyOpen} onOpenChange={setCompanyOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between gap-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed && "justify-center"
                )}
              >
                {!collapsed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">{currentCompany.name}</span>
                    </div>
                    {companyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </>
                )}
                {collapsed && <Building2 className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {companyMenuItems.map((item) => renderMenuItem(item))}
            </CollapsibleContent>
          </Collapsible>

          {/* System Section */}
          <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between gap-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent mt-4",
                  collapsed && "justify-center"
                )}
              >
                {!collapsed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Sistema</span>
                    </div>
                    {systemOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </>
                )}
                {collapsed && <Settings className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {systemMenuItems.map((item) => renderMenuItem(item))}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <ThemeToggle collapsed={collapsed} />
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
                AD
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-sidebar-foreground">{currentCompany.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="p-2 space-y-1 border-t border-sidebar-border bg-sidebar max-h-[70vh] overflow-y-auto">
            {/* Company Selector Mobile */}
            <div className="pb-2 mb-2 border-b border-sidebar-border">
              <Select value={currentCompany.id} onValueChange={handleCompanyChange}>
                <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <SelectValue placeholder="Selecione a empresa" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Menu Items */}
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3 py-2">
                {currentCompany.name}
              </span>
              {companyMenuItems.map((item) => renderMenuItem(item, () => setMobileOpen(false)))}
            </div>

            {/* System Menu Items */}
            <div className="space-y-1 pt-4 border-t border-sidebar-border mt-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3 py-2">
                Sistema
              </span>
              {systemMenuItems.map((item) => renderMenuItem(item, () => setMobileOpen(false)))}
            </div>

            <div className="pt-4 border-t border-sidebar-border mt-4 space-y-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Button>
            </div>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-auto bg-background">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
}
