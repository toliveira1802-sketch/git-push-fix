import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const routes = {
  "🏠 Cliente": [
    { path: "/", label: "Dashboard (Index)" },
    { path: "/login", label: "Login Funcionários" },
    { path: "/cliente/login", label: "Login Clientes" },
    { path: "/register", label: "Registro" },
    { path: "/perfil", label: "Perfil" },
    { path: "/agenda", label: "Agenda" },
    { path: "/historico", label: "Histórico" },
    { path: "/novo-agendamento", label: "Novo Agendamento" },
    { path: "/agendamento-sucesso", label: "Agendamento Sucesso" },
    { path: "/configuracoes", label: "Configurações" },
    { path: "/performance", label: "Performance" },
    { path: "/avisos", label: "Avisos" },
    { path: "/veiculos", label: "Veículos" },
    { path: "/visao-geral", label: "Visão Geral" },
  ],
  "📄 OS Cliente": [
    { path: "/os/123", label: "OS Acompanhamento" },
    { path: "/os/123/acompanhamento", label: "OS Detalhes" },
    { path: "/os/123/orcamento", label: "OS Orçamento" },
  ],
  "🏢 Admin": [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/pendencias", label: "Pendências" },
    { path: "/admin/ordens-servico", label: "Ordens de Serviço" },
    { path: "/admin/os-ultimate", label: "OS Ultimate" },
    { path: "/admin/clientes", label: "Clientes" },
    { path: "/admin/veiculos", label: "Veículos" },
    { path: "/admin/agendamentos", label: "Agendamentos" },
    { path: "/admin/cadastros", label: "Hub Cadastros" },
    { path: "/admin/patio", label: "Monitoramento Pátio" },
    { path: "/admin/patio/123", label: "Detalhes Pátio" },
    { path: "/admin/operacional", label: "Operacional" },
    { path: "/admin/documentacao", label: "Documentação" },
    { path: "/admin/agenda-mecanicos", label: "Agenda Mecânicos" },
    { path: "/admin/feedback-mecanicos", label: "Feedback Mecânicos" },
    { path: "/admin/analytics-mecanicos", label: "Analytics Mecânicos" },
    { path: "/admin/financeiro", label: "Financeiro" },
    { path: "/admin/configuracoes", label: "Configurações" },
    { path: "/admin/produtividade", label: "Produtividade" },
    { path: "/admin/melhorias", label: "Melhorias" },
    { path: "/admin/parametros", label: "Parâmetros" },
    { path: "/admin/metas", label: "Metas" },
    { path: "/admin/monitoramento-kommo", label: "Monitoramento Kommo" },
    { path: "/admin/orcamentos", label: "Dashboard Orçamentos" },
    { path: "/admin/checklist", label: "Checklist Entrada" },
    { path: "/admin/importar", label: "Importar Dados" },
    { path: "/admin/nova-os", label: "Nova OS" },
    { path: "/admin/os/123", label: "OS Detalhes Admin" },
    { path: "/admin/dashboard-ias", label: "Dashboard IAs" },
  ],
  "📈 Gestão": [
    { path: "/gestao", label: "Hub Dashboards" },
    { path: "/gestao/rh", label: "RH" },
    { path: "/gestao/operacoes", label: "Operações" },
    { path: "/gestao/financeiro", label: "Financeiro" },
    { path: "/gestao/tecnologia", label: "Tecnologia" },
    { path: "/gestao/comercial", label: "Comercial e Marketing" },
    { path: "/gestao/melhorias", label: "Melhorias" },
    { path: "/gestao/kommo-v2", label: "Kommo v2" },
  ],
  "⚙️ Sistema": [
    { path: "/__dev", label: "Dev Screens (você está aqui)" },
    { path: "/404-test", label: "404 Not Found" },
  ],
};

export default function DevScreens() {
  const totalRoutes = Object.values(routes).flat().length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">📐 Screen Gallery</h1>
          <Badge variant="secondary">{totalRoutes} rotas</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Navegue por todas as telas do sistema para desenvolvimento e testes
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(routes).map(([category, items]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-base flex items-center justify-between">
                {category}
                <Badge variant="outline" className="text-xs">
                  {items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 text-sm hover:text-primary hover:underline transition-colors py-1"
                    >
                      <span className="text-muted-foreground text-xs font-mono truncate max-w-[120px]">
                        {item.path}
                      </span>
                      <span className="text-foreground">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
