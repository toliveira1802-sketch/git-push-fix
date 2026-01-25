import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
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
  Building2,
  Layers,
  FolderOpen,
  Lightbulb,
  SlidersHorizontal,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCompany } from '@/contexts/CompanyContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
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
import { Badge } from '@/components/ui/badge';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  highlight?: boolean;
  subItems?: MenuItem[];
}

interface AdminLayoutProps {
  children: ReactNode;
}

const companyMenuItems: MenuItem[] = [
  { icon: Home, label: 'Visão Geral', path: '/admin' },
  { icon: Plus, label: 'Nova OS', path: '/admin/nova-os', highlight: true },
  { icon: MapPin, label: 'Pátio', path: '/admin/patio' },
  { icon: CalendarClock, label: 'Agenda Mecânicos', path: '/admin/agenda-mecanicos' },
  { 
    icon: FolderOpen, 
    label: 'Cadastros', 
    path: '/admin/cadastros',
    subItems: [
      { icon: Users, label: 'Clientes', path: '/admin/clientes' },
      { icon: ClipboardList, label: 'Ordens de Serviço', path: '/admin/ordens-servico' },
      { icon: Car, label: 'Veículos', path: '/admin/veiculos' },
    ]
  },
];

const systemMenuItems: MenuItem[] = [
  { 
    icon: Settings, 
    label: 'Configurações', 
    path: '/admin/configuracoes',
    subItems: [
      { icon: Lightbulb, label: 'Melhorias', path: '/admin/melhorias' },
      { icon: SlidersHorizontal, label: 'Parâmetros', path: '/admin/configuracoes' },
    ]
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  const { companies, currentCompany, setCurrentCompany, canSelectCompany, isConsolidated, setConsolidated } = useCompany();
  const { isDev } = useUserRole();

  // Buscar nome do usuário logado
  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Tentar buscar do profile primeiro
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
    }
  };

  // Auto-expand parent menus when on child routes
  const isOnCadastrosSubRoute = ['/admin/clientes', '/admin/ordens-servico', '/admin/veiculos'].some(
    path => location.pathname.startsWith(path)
  );
  const isOnCadastrosRoute = location.pathname === '/admin/cadastros' || isOnCadastrosSubRoute;
  
  const isOnConfigSubRoute = ['/admin/melhorias', '/admin/configuracoes'].some(
    path => location.pathname === path
  );

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '/admin/cadastros': isOnCadastrosRoute,
    '/admin/configuracoes': isOnConfigSubRoute,
  });

  // Keep parent menus expanded when navigating to sub-routes
  useEffect(() => {
    if (isOnCadastrosRoute && !expandedItems['/admin/cadastros']) {
      setExpandedItems(prev => ({ ...prev, '/admin/cadastros': true }));
    }
    if (isOnConfigSubRoute && !expandedItems['/admin/configuracoes']) {
      setExpandedItems(prev => ({ ...prev, '/admin/configuracoes': true }));
    }
  }, [location.pathname, isOnCadastrosRoute, isOnConfigSubRoute]);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderMenuItem = (item: MenuItem, onClick?: () => void, level = 0) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || 
      (item.path !== '/admin' && location.pathname.startsWith(item.path));
    const isHighlight = item.highlight;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems[item.path];
    
    return (
      <div key={item.path}>
        <Button
          variant={isHighlight ? "default" : isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-2",
            isHighlight && "bg-primary text-primary-foreground hover:bg-primary/90",
            isActive && !isHighlight && "bg-secondary",
            level > 0 && "ml-4 w-[calc(100%-1rem)]",
            level > 1 && "ml-8 w-[calc(100%-2rem)]"
          )}
          onClick={() => {
            if (hasSubItems && !collapsed) {
              toggleExpanded(item.path);
            }
            navigate(item.path);
            onClick?.();
          }}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          {!collapsed && hasSubItems && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        {!collapsed && hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems!.map((subItem) => renderMenuItem(subItem, onClick, level + 1))}
          </div>
        )}
      </div>
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
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sidebar-foreground truncate">{userName || 'Usuário'}</span>
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

        {/* Company Selector - Only for dev/master */}
        {!collapsed && (
          <div className="p-2 border-b border-sidebar-border space-y-2">
            {canSelectCompany ? (
              <>
                <Select value={isConsolidated ? "all" : currentCompany?.id || ""} onValueChange={(value) => {
                  if (value === "all") {
                    setConsolidated(true);
                  } else {
                    handleCompanyChange(value);
                  }
                }}>
                  <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                      {isConsolidated ? <Layers className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      <SelectValue placeholder="Selecione a empresa" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>CONSOLIDADO</span>
                      </div>
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isDev && (
                  <Badge variant="outline" className="w-full justify-center text-xs bg-primary/10 text-primary border-primary/20">
                    Master
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{currentCompany?.code || 'Carregando...'}</span>
              </div>
            )}
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
                      <span className="text-xs font-medium uppercase tracking-wider">{currentCompany?.code || ''}</span>
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
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-sidebar-foreground">{userName || currentCompany?.code || ''}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="p-2 space-y-1 border-t border-sidebar-border bg-sidebar max-h-[70vh] overflow-y-auto">
            {/* Company Selector Mobile - Only for dev/master */}
            <div className="pb-2 mb-2 border-b border-sidebar-border">
              {canSelectCompany ? (
                <Select value={isConsolidated ? "all" : currentCompany?.id || ""} onValueChange={(value) => {
                  if (value === "all") {
                    setConsolidated(true);
                  } else {
                    handleCompanyChange(value);
                  }
                }}>
                  <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                      {isConsolidated ? <Layers className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      <SelectValue placeholder="Selecione a empresa" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>CONSOLIDADO</span>
                      </div>
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{currentCompany?.code || 'Carregando...'}</span>
                </div>
              )}
            </div>

            {/* Company Menu Items */}
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3 py-2">
                {currentCompany?.code || ''}
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
