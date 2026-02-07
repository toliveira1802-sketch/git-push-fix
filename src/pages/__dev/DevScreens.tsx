import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEV_BYPASS } from "@/config/devBypass";

const routes = {
  "🔓 Públicas": [
    { path: "/login", label: "Login" },
    { path: "/trocar-senha", label: "Trocar Senha" },
    { path: "/cliente/orcamento/123", label: "Orçamento Cliente (público)" },
  ],
  "🚗 Cliente (Garagem)": [
    { path: "/app/garagem", label: "Minha Garagem" },
  ],
  "🏢 Admin": [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/ordens-servico", label: "Ordens de Serviço" },
    { path: "/admin/nova-os", label: "Nova OS" },
    { path: "/admin/os/123", label: "OS Detalhes" },
    { path: "/admin/os-ultimate", label: "OS Ultimate" },
    { path: "/admin/os-ultimate/123", label: "OS Ultimate (detalhe)" },
    { path: "/admin/patio", label: "Pátio" },
    { path: "/admin/patio/123", label: "Pátio Detalhes" },
    { path: "/admin/agendamentos", label: "Agendamentos" },
    { path: "/admin/agenda-mecanicos", label: "Agenda Mecânicos" },
    { path: "/admin/clientes", label: "Clientes" },
    { path: "/admin/servicos", label: "Serviços" },
    { path: "/admin/financeiro", label: "Financeiro" },
    { path: "/admin/produtividade", label: "Produtividade" },
    { path: "/admin/analytics-mecanicos", label: "Analytics Mecânicos" },
    { path: "/admin/feedback-mecanicos", label: "Feedback Mecânicos" },
    { path: "/admin/metas", label: "Metas" },
    { path: "/admin/relatorios", label: "Relatórios" },
    { path: "/admin/documentacao", label: "Documentação" },
    { path: "/admin/configuracoes", label: "Configurações" },
    { path: "/admin/pendencias", label: "Pendências" },
    { path: "/admin/checklist", label: "Checklist Entrada" },
    { path: "/admin/importar-veiculos-antigos", label: "Importar Veículos" },
  ],
  "📈 Gestão": [
    { path: "/gestao", label: "Hub Dashboards" },
    { path: "/gestao/rh", label: "RH" },
    { path: "/gestao/operacoes", label: "Operações" },
    { path: "/gestao/financeiro", label: "Financeiro" },
    { path: "/gestao/tecnologia", label: "Tecnologia" },
    { path: "/gestao/comercial", label: "Comercial e Marketing" },
    { path: "/gestao/melhorias", label: "Melhorias" },
    { path: "/gestao/veiculos-orfaos", label: "Veículos Órfãos" },
  ],
  "⚙️ Sistema": [
    { path: "/__dev", label: "Dev Screens (você está aqui)" },
    { path: "/404", label: "404 Not Found" },
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
          {DEV_BYPASS && (
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
              🔧 DEV BYPASS ATIVO
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Navegue por todas as telas do sistema para desenvolvimento e testes.
          {!DEV_BYPASS && (
            <span className="text-yellow-500 ml-2">
              💡 Dica: acesse com <code className="bg-muted px-1 rounded">?dev=true</code> para bypass de auth
            </span>
          )}
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
                      <span className="text-muted-foreground text-xs font-mono truncate max-w-[160px]">
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
