import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEV_BYPASS } from "@/config/devBypass";
import {
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface RouteItem {
  path: string;
  label: string;
  status: "active" | "orphan";
}

const routes: Record<string, RouteItem[]> = {
  "🔓 Públicas": [
    { path: "/login", label: "Login", status: "active" },
    { path: "/trocar-senha", label: "Trocar Senha", status: "active" },
    { path: "/cliente/orcamento/123", label: "Orçamento Cliente", status: "active" },
  ],
  "🚗 Cliente": [
    { path: "/app/garagem", label: "Minha Garagem", status: "active" },
  ],
  "🏢 Admin": [
    { path: "/admin/dashboard", label: "Dashboard", status: "active" },
    { path: "/admin/ordens-servico", label: "Ordens de Serviço", status: "active" },
    { path: "/admin/nova-os", label: "Nova OS", status: "active" },
    { path: "/admin/os/123", label: "OS Detalhes", status: "active" },
    { path: "/admin/os-ultimate", label: "OS Ultimate", status: "active" },
    { path: "/admin/patio", label: "Pátio", status: "active" },
    { path: "/admin/patio/123", label: "Pátio Detalhes", status: "active" },
    { path: "/admin/agendamentos", label: "Agendamentos", status: "active" },
    { path: "/admin/agenda-mecanicos", label: "Agenda Mecânicos", status: "active" },
    { path: "/admin/clientes", label: "Clientes", status: "active" },
    { path: "/admin/servicos", label: "Serviços", status: "active" },
    { path: "/admin/financeiro", label: "Financeiro", status: "active" },
    { path: "/admin/produtividade", label: "Produtividade", status: "active" },
    { path: "/admin/analytics-mecanicos", label: "Analytics Mecânicos", status: "active" },
    { path: "/admin/feedback-mecanicos", label: "Feedback Mecânicos", status: "active" },
    { path: "/admin/metas", label: "Metas", status: "active" },
    { path: "/admin/relatorios", label: "Relatórios", status: "active" },
    { path: "/admin/documentacao", label: "Documentação", status: "active" },
    { path: "/admin/configuracoes", label: "Configurações", status: "active" },
    { path: "/admin/pendencias", label: "Pendências", status: "active" },
    { path: "/admin/checklist", label: "Checklist Entrada", status: "active" },
    { path: "/admin/importar-veiculos-antigos", label: "Importar Veículos", status: "active" },
  ],
  "📈 Gestão": [
    { path: "/gestao", label: "Hub Dashboards", status: "active" },
    { path: "/gestao/rh", label: "RH", status: "active" },
    { path: "/gestao/operacoes", label: "Operações", status: "active" },
    { path: "/gestao/financeiro", label: "Financeiro", status: "active" },
    { path: "/gestao/tecnologia", label: "Tecnologia", status: "active" },
    { path: "/gestao/comercial", label: "Comercial e Marketing", status: "active" },
    { path: "/gestao/melhorias", label: "Melhorias", status: "active" },
    { path: "/gestao/veiculos-orfaos", label: "Veículos Órfãos", status: "active" },
  ],
  "⚙️ Sistema": [
    { path: "/__dev", label: "Dev Screens (aqui)", status: "active" },
    { path: "/404", label: "404 Not Found", status: "active" },
  ],
};

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: string; label: string; icon: typeof Monitor }> = {
  desktop: { width: "100%", label: "Desktop", icon: Monitor },
  tablet: { width: "768px", label: "Tablet", icon: Tablet },
  mobile: { width: "375px", label: "Mobile", icon: Smartphone },
};

export default function DevScreens() {
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showOrphans, setShowOrphans] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const allRoutes = Object.values(routes).flat();
  const totalRoutes = allRoutes.length;
  const activeRoutes = allRoutes.filter((r) => r.status === "active").length;
  const orphanRoutes = allRoutes.filter((r) => r.status === "orphan").length;

  // Flat list for prev/next navigation
  const filteredRoutes = allRoutes.filter((r) => {
    if (!showOrphans && r.status === "orphan") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q);
    }
    return true;
  });

  const currentIndex = selectedRoute
    ? filteredRoutes.findIndex((r) => r.path === selectedRoute.path)
    : -1;

  const goNext = () => {
    if (currentIndex < filteredRoutes.length - 1) {
      setSelectedRoute(filteredRoutes[currentIndex + 1]);
      setIframeKey((k) => k + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setSelectedRoute(filteredRoutes[currentIndex - 1]);
      setIframeKey((k) => k + 1);
    }
  };

  const selectRoute = (item: RouteItem) => {
    setSelectedRoute(item);
    setIframeKey((k) => k + 1);
  };

  const iframeUrl = selectedRoute
    ? `${window.location.origin}${selectedRoute.path}?dev=true`
    : null;

  // Fullscreen preview mode
  if (fullscreen && selectedRoute) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setFullscreen(false)}>
              <Minimize2 className="w-4 h-4 mr-1" />
              Sair
            </Button>
            <span className="font-semibold">{selectedRoute.label}</span>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {selectedRoute.path}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentIndex <= 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1}/{filteredRoutes.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={currentIndex >= filteredRoutes.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            {Object.entries(viewportSizes).map(([key, val]) => {
              const Icon = val.icon;
              return (
                <Button
                  key={key}
                  variant={viewport === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewport(key as ViewportSize)}
                  title={val.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIframeKey((k) => k + 1)} title="Recarregar">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <a href={iframeUrl || "#"} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" title="Abrir em nova aba">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
        {/* Iframe */}
        <div className="flex-1 flex items-start justify-center bg-muted/30 overflow-auto p-4">
          <div
            style={{ width: viewportSizes[viewport].width, maxWidth: "100%" }}
            className="h-full bg-background border rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
          >
            <iframe
              key={iframeKey}
              src={iframeUrl || ""}
              className="w-full h-full border-0"
              style={{ minHeight: "calc(100vh - 80px)", colorScheme: darkMode ? "dark" : "light" }}
              title={selectedRoute.label}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`border-r bg-card flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-12" : "w-80"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">📐 DevLab</h1>
              <Badge variant="secondary" className="text-xs">
                {totalRoutes}
              </Badge>
              {DEV_BYPASS && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                  🔓
                </Badge>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Stats */}
            <div className="px-3 py-2 border-b flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                ✅ {activeRoutes} ativas
              </Badge>
              {orphanRoutes > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                  ❌ {orphanRoutes} órfãs
                </Badge>
              )}
            </div>

            {/* Search + Filters */}
            <div className="px-3 py-2 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tela..."
                  className="pl-8 h-8 text-xs"
                />
              </div>
              {orphanRoutes > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrphans(!showOrphans)}
                  className="w-full justify-start text-xs h-7"
                >
                  {showOrphans ? <Eye className="w-3 h-3 mr-2" /> : <EyeOff className="w-3 h-3 mr-2" />}
                  {showOrphans ? "Esconder órfãs" : "Mostrar órfãs"}
                </Button>
              )}
            </div>

            {/* Route List */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(routes).map(([category, items]) => {
                const filteredItems = items.filter((r) => {
                  if (!showOrphans && r.status === "orphan") return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q);
                  }
                  return true;
                });

                if (filteredItems.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 sticky top-0">
                      {category}
                      <span className="ml-1 text-muted-foreground/50">({filteredItems.length})</span>
                    </div>
                    {filteredItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => selectRoute(item)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
                          selectedRoute?.path === item.path
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "border-l-2 border-transparent"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.status === "active" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        <code className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                          {item.path}
                        </code>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            {!DEV_BYPASS && (
              <div className="p-3 border-t">
                <p className="text-xs text-yellow-500 text-center">
                  💡 <code className="bg-muted px-1 rounded">?dev=true</code> para bypass auth
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-3">
            {selectedRoute ? (
              <>
                <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentIndex <= 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1}/{filteredRoutes.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goNext}
                  disabled={currentIndex >= filteredRoutes.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border" />
                <span className="font-semibold text-sm">{selectedRoute.label}</span>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {selectedRoute.path}
                </code>
                <Badge
                  variant="outline"
                  className={
                    selectedRoute.status === "active"
                      ? "bg-green-500/10 text-green-600 border-green-500/30 text-xs"
                      : "bg-red-500/10 text-red-500 border-red-500/30 text-xs"
                  }
                >
                  {selectedRoute.status === "active" ? "✅ Ativa" : "❌ Órfã"}
                </Badge>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">← Selecione uma tela para preview</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {Object.entries(viewportSizes).map(([key, val]) => {
              const Icon = val.icon;
              return (
                <Button
                  key={key}
                  variant={viewport === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewport(key as ViewportSize)}
                  title={val.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIframeKey((k) => k + 1)}
              title="Recarregar"
              disabled={!selectedRoute}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {selectedRoute && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreen(true)}
                  title="Tela cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <a href={iframeUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" title="Abrir em nova aba">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRoute(null)} title="Fechar preview">
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-start justify-center bg-muted/30 overflow-auto p-4">
          {selectedRoute ? (
            <div
              style={{ width: viewportSizes[viewport].width, maxWidth: "100%" }}
              className="bg-background border rounded-lg overflow-hidden shadow-xl transition-all duration-300"
            >
              {/* Device Frame Header */}
              <div className="bg-muted/50 px-3 py-1.5 flex items-center gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <code className="text-[10px] text-muted-foreground flex-1 text-center truncate">
                  {iframeUrl}
                </code>
              </div>
              <iframe
                key={iframeKey}
                src={iframeUrl || ""}
                className="w-full border-0"
                style={{
                  height: "calc(100vh - 160px)",
                  colorScheme: darkMode ? "dark" : "light",
                }}
                title={selectedRoute.label}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center">
                <Monitor className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">DevLab — Doctor Auto Prime</h2>
                <p className="text-muted-foreground text-sm">
                  Selecione uma tela na sidebar para visualizar e testar interações.
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  Use ◀ ▶ para navegar entre telas • 📱 💻 para mudar viewport • ☀️ 🌙 para tema
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{activeRoutes}</p>
                  <p className="text-muted-foreground text-xs">Rotas Ativas</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">{orphanRoutes}</p>
                  <p className="text-muted-foreground text-xs">Órfãs</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold">{totalRoutes}</p>
                  <p className="text-muted-foreground text-xs">Total</p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
