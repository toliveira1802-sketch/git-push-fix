import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Settings, 
  Shield, 
  Database,
  Download,
  Copy,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AdminDocumentacao = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    const markdown = generateMarkdown();
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Documentação copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doctor-auto-prime-documentacao.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Arquivo baixado com sucesso!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documentação do Projeto</h1>
            <p className="text-muted-foreground">
              Visão completa do sistema Doctor Auto Prime
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyMarkdown}>
              {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copiado!" : "Copiar Markdown"}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar .md
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Visão Geral */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Visão Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Doctor Auto Prime</strong> é um CRM completo para oficinas mecânicas, 
                desenvolvido para gerenciar todo o ciclo de atendimento ao cliente, desde a 
                captação de leads até o acompanhamento pós-serviço.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>React 18</Badge>
                <Badge>TypeScript</Badge>
                <Badge>Tailwind CSS</Badge>
                <Badge>shadcn/ui</Badge>
                <Badge>Lovable Cloud</Badge>
                <Badge>PostgreSQL</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Perfis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sistema de Perfis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">admin</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Acesso completo: financeiro, analytics, configurações
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-primary">oficina</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Painel operacional sem financeiro/analytics
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-accent text-accent-foreground">user</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Área do cliente apenas
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Módulos do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Área do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {[
                    { name: "Home", route: "/" },
                    { name: "Meus Veículos", route: "/veiculos/:id" },
                    { name: "Novo Agendamento", route: "/novo-agendamento" },
                    { name: "Agenda", route: "/agenda" },
                    { name: "Histórico", route: "/historico" },
                    { name: "Perfil", route: "/perfil" },
                    { name: "Avisos", route: "/avisos" },
                  ].map((item) => (
                    <div key={item.route} className="flex justify-between items-center p-2 rounded bg-muted/50">
                      <span className="text-sm font-medium">{item.name}</span>
                      <code className="text-xs text-muted-foreground">{item.route}</code>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Módulos Admin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Painel Admin/Oficina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {[
                    { name: "Dashboard", route: "/admin", adminOnly: false },
                    { name: "Agendamentos", route: "/admin/agendamentos", adminOnly: false },
                    { name: "Clientes", route: "/admin/clientes", adminOnly: false },
                    { name: "Serviços", route: "/admin/servicos", adminOnly: false },
                    { name: "Pátio", route: "/admin/patio", adminOnly: false },
                    { name: "Agenda Mecânicos", route: "/admin/agenda-mecanicos", adminOnly: false },
                    { name: "Nova OS", route: "/admin/nova-os", adminOnly: false },
                    { name: "Operacional", route: "/admin/operacional", adminOnly: false },
                    { name: "Financeiro", route: "/admin/financeiro", adminOnly: true },
                    { name: "Analytics", route: "/admin/analytics-mecanicos", adminOnly: true },
                  ].map((item) => (
                    <div key={item.route} className="flex justify-between items-center p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.name}</span>
                        {item.adminOnly && <Badge variant="destructive" className="text-[10px] px-1">admin</Badge>}
                      </div>
                      <code className="text-xs text-muted-foreground">{item.route}</code>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Banco de Dados */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Estrutura do Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Gestão de Usuários</h4>
                  <div className="space-y-1">
                    <code className="block text-xs p-1 bg-muted rounded">profiles</code>
                    <code className="block text-xs p-1 bg-muted rounded">user_roles</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Veículos e Serviços</h4>
                  <div className="space-y-1">
                    <code className="block text-xs p-1 bg-muted rounded">vehicles</code>
                    <code className="block text-xs p-1 bg-muted rounded">services</code>
                    <code className="block text-xs p-1 bg-muted rounded">appointments</code>
                    <code className="block text-xs p-1 bg-muted rounded">service_history</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Operacional</h4>
                  <div className="space-y-1">
                    <code className="block text-xs p-1 bg-muted rounded">mechanics</code>
                    <code className="block text-xs p-1 bg-muted rounded">mechanic_schedules</code>
                    <code className="block text-xs p-1 bg-muted rounded">mechanic_assignments</code>
                    <code className="block text-xs p-1 bg-muted rounded">patio_vehicles</code>
                    <code className="block text-xs p-1 bg-muted rounded">service_orders</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Comunicação & Financeiro</h4>
                  <div className="space-y-1">
                    <code className="block text-xs p-1 bg-muted rounded">alerts</code>
                    <code className="block text-xs p-1 bg-muted rounded">promotions</code>
                    <code className="block text-xs p-1 bg-muted rounded">payments</code>
                    <code className="block text-xs p-1 bg-muted rounded">invoices</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança (RLS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-2 rounded bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent-foreground">✓ RLS Habilitado</p>
                  <p className="text-xs text-muted-foreground">Todas as tabelas protegidas</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p><strong>Funções:</strong></p>
                  <code className="block text-xs p-1 bg-muted rounded">has_role(user_id, role)</code>
                  <code className="block text-xs p-1 bg-muted rounded">has_any_role(user_id, roles[])</code>
                  <code className="block text-xs p-1 bg-muted rounded">has_admin_access(user_id)</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URLs do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>URLs do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-1">Preview</p>
                <code className="text-xs text-muted-foreground break-all">
                  https://id-preview--ad0c6e08-a053-4a31-ba05-c0434697e9f4.lovable.app
                </code>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Produção</p>
                <code className="text-xs text-muted-foreground break-all">
                  https://doctorautoprime.lovable.app
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const generateMarkdown = () => `# Doctor Auto Prime - Documentação do Projeto

## 📋 Visão Geral

**Doctor Auto Prime** é um CRM completo para oficinas mecânicas, desenvolvido para gerenciar todo o ciclo de atendimento ao cliente, desde a captação de leads até o acompanhamento pós-serviço.

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase)
- **Autenticação:** Supabase Auth (Email/Telefone + OTP)
- **Database:** PostgreSQL
- **State Management:** React Query (TanStack)

---

## 👥 Sistema de Perfis (Roles)

| Role | Descrição | Acesso |
|------|-----------|--------|
| admin | Administrador completo | Tudo, incluindo financeiro e analytics |
| oficina | Operacional da oficina | Painel admin sem financeiro/analytics |
| user | Cliente final | Área do cliente apenas |

---

## 📱 Módulos do Sistema

### Área do Cliente
- Home (/)
- Meus Veículos (/veiculos/:id)
- Novo Agendamento (/novo-agendamento)
- Agenda (/agenda)
- Histórico (/historico)
- Perfil (/perfil)
- Avisos (/avisos)

### Painel Admin/Oficina
- Dashboard (/admin)
- Agendamentos (/admin/agendamentos)
- Clientes (/admin/clientes)
- Serviços (/admin/servicos)
- Pátio (/admin/patio)
- Agenda Mecânicos (/admin/agenda-mecanicos)
- Nova OS (/admin/nova-os)
- Operacional (/admin/operacional)
- **Financeiro** (/admin/financeiro) - admin only
- **Analytics** (/admin/analytics-mecanicos) - admin only

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- profiles, user_roles
- vehicles, services, appointments, service_history
- mechanics, mechanic_schedules, mechanic_assignments
- patio_vehicles, service_orders, service_order_items
- alerts, promotions, payments, invoices

---

## 🔐 Segurança (RLS)

Todas as tabelas possuem Row Level Security habilitado.

**Funções de segurança:**
- has_role(user_id, role)
- has_any_role(user_id, roles[])
- has_admin_access(user_id)

---

## 📞 Informações do Projeto

- **URL Publicada:** https://doctorautoprime.lovable.app
- **Data:** Janeiro 2026
`;

export default AdminDocumentacao;
