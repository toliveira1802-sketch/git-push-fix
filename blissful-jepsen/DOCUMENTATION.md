# Doctor Auto Prime - Documentação do Sistema

## 📋 Visão Geral

**Doctor Auto Prime** é um sistema de gestão para oficinas mecânicas, dividido em:
- **App Cliente**: Interface mobile-first para clientes agendarem serviços
- **Painel Administrativo**: Interface desktop para gestão da oficina
- **Módulo Gestão**: Dashboards executivos para gerentes

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| React 18 | Framework frontend |
| TypeScript | Tipagem estática |
| Vite | Build tool |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes UI |
| Supabase (Lovable Cloud) | Backend, Auth, Database |
| React Router v6 | Navegação |
| React Query | Gerenciamento de estado servidor |
| Recharts | Gráficos e visualizações |
| Lucide React | Ícones |

---

## 🔐 Sistema de Autenticação

### Roles de Usuário
```typescript
type app_role = "user" | "admin" | "gestao" | "dev"
```

| Role | Descrição | Redirecionamento |
|------|-----------|------------------|
| `user` | Clientes da oficina | `/` (Dashboard cliente) |
| `admin` | Funcionários/Atendentes | `/admin` |
| `gestao` | Gerentes/Diretores | `/gestao` |
| `dev` | Desenvolvedores | Acesso total |

### Fluxo de Login
1. Usuário faz login via email/senha ou Google OAuth
2. Sistema busca role do usuário na tabela `user_roles`
3. Redirecionamento automático baseado na role

### Arquivos Relacionados
- `src/contexts/AuthContext.tsx` - Contexto de autenticação
- `src/hooks/useUserRole.tsx` - Hook para verificar role
- `src/pages/Login.tsx` - Página de login
- `src/pages/Register.tsx` - Página de cadastro

---

## 🏢 Arquitetura Multi-Empresa

O sistema suporta múltiplas unidades/filiais:

| Código | Nome |
|--------|------|
| POMBAL | Unidade Pombal |
| CENTRO | Unidade Centro |
| MATRIZ | Matriz |

### Implementação
- `src/contexts/CompanyContext.tsx` - Gerencia empresa selecionada
- Seletor de empresa no sidebar do admin
- Filtros de dados por empresa (a implementar)

---

## 🎨 Sistema de Temas

### Dark/Light Mode
- Persistido no `localStorage`
- Toggle disponível em Configurações
- Aplicado via classe no `document.documentElement`

### Arquivos
- `src/hooks/useTheme.tsx` - Hook e Provider de tema
- `src/components/ui/theme-toggle.tsx` - Componente toggle
- `src/index.css` - Variáveis CSS de tema

### Tokens de Cor (HSL)
```css
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--card, --card-foreground
--border, --input, --ring
```

---

## 📱 Estrutura de Páginas

### App Cliente (`/`)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Index | Dashboard principal |
| `/login` | Login | Autenticação |
| `/register` | Register | Cadastro |
| `/perfil` | Profile | Perfil do usuário |
| `/agenda` | Agenda | Agendamentos do cliente |
| `/historico` | Historico | Histórico de serviços |
| `/novo-agendamento` | NovoAgendamento | Wizard de agendamento |
| `/agendamento-sucesso` | AgendamentoSucesso | Confirmação |
| `/configuracoes` | Configuracoes | Configurações do app |
| `/veiculos` | Veiculos | Gestão de veículos |
| `/avisos` | Avisos | Notificações/Promoções |
| `/visao-geral` | VisaoGeral | Resumo geral |
| `/performance` | Performance | Métricas do cliente |

### Painel Admin (`/admin`)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | AdminDashboard | Dashboard admin |
| `/admin/pendencias` | Pendencias | Pendências do dia |
| `/admin/ordens-servico` | OrdensServico | Lista de OS |
| `/admin/nova-os` | NovaOS | Criar nova OS |
| `/admin/os/:osId` | AdminOSDetalhes | Detalhes da OS |
| `/admin/clientes` | Clientes | Gestão de clientes |
| `/admin/veiculos` | AdminVeiculos | Gestão de veículos |
| `/admin/agendamentos` | AdminAgendamentos | Gestão de agendamentos |
| `/admin/ias` | AdminIAs | Painel de IAs |
| `/admin/nova-promocao` | NovaPromocao | Criar promoção |
| `/admin/patio` | MonitoramentoPatio | Mapa do pátio |
| `/admin/operacional` | AdminOperacional | Workflow de OS |
| `/admin/agenda-mecanicos` | AdminAgendaMecanicos | Agenda dos mecânicos |
| `/admin/feedback-mecanicos` | AdminMechanicFeedback | Feedback diário |
| `/admin/analytics-mecanicos` | AdminMechanicAnalytics | Analytics de performance |
| `/admin/financeiro` | AdminFinanceiro | Métricas financeiras |
| `/admin/configuracoes` | AdminConfiguracoes | Configurações do sistema |

### Módulo Gestão (`/gestao`)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/gestao` | GestaoDashboards | Dashboard principal |
| `/gestao/rh` | GestaoRH | Recursos Humanos |
| `/gestao/operacoes` | GestaoOperacoes | Operações |
| `/gestao/financeiro` | GestaoFinanceiro | Financeiro |
| `/gestao/tecnologia` | GestaoTecnologia | Tecnologia |
| `/gestao/comercial` | GestaoComercial | Comercial |
| `/gestao/melhorias` | GestaoMelhorias | Sugestões de melhorias |

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas

#### `profiles`
Dados adicionais dos usuários
```sql
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- full_name: text
- phone: text
- avatar_url: text
- created_at, updated_at: timestamp
```

#### `user_roles`
Controle de permissões
```sql
- id: uuid (PK)
- user_id: uuid
- role: app_role (user, admin, gestao, dev)
- created_at: timestamp
```

#### `mechanics`
Cadastro de mecânicos
```sql
- id: uuid (PK)
- name: text
- phone: text
- specialty: text
- is_active: boolean
- created_at, updated_at: timestamp
```

#### `agenda_mecanicos`
Agenda dos mecânicos
```sql
- id: uuid (PK)
- mechanic_id: uuid (FK -> mechanics)
- data: date
- hora_inicio: time
- vehicle_id: uuid (opcional)
- tipo: text (normal, encaixe)
- status: text (agendado, em_andamento, concluido)
- created_at: timestamp
```

#### `mechanic_daily_feedback`
Avaliação diária dos mecânicos
```sql
- id: uuid (PK)
- mechanic_id: uuid (FK -> mechanics)
- feedback_date: date
- performance_score: integer (1-5)
- punctuality_score: integer (1-5)
- quality_score: integer (1-5)
- notes: text
- given_by: uuid
- created_at: timestamp
```

#### `workflow_etapas`
Etapas do workflow de OS
```sql
- id: uuid (PK)
- nome: text
- ordem: integer
- cor: text (hex color)
- icone: text (lucide icon name)
- is_active: boolean
- created_at: timestamp
```

#### `system_config`
Configurações do sistema
```sql
- id: uuid (PK)
- key: text (unique)
- value: jsonb
- updated_at: timestamp
```

### Políticas RLS
Todas as tabelas possuem Row Level Security habilitado com políticas:
- `admin`, `gestao`, `dev`: Acesso total (CRUD)
- `user`: Acesso de leitura ou específico ao próprio registro

---

## 🧭 Menu Lateral Administrativo

### Estrutura Hierárquica

```
📁 Empresa (POMBAL/CENTRO/MATRIZ)
├── 🏠 Home
│   ├── ⚡ Operacional (/admin/operacional)
│   ├── 💰 Financeiro (/admin/financeiro)
│   ├── 📊 Produtividade (/admin/analytics-mecanicos)
│   └── 📅 Agenda Mecânicos (/admin/agenda-mecanicos)
│       └── ⭐ Feedback (/admin/feedback-mecanicos)
├── 📋 Visão Geral (/admin)
├── 🔧 Ordens de Serviço (/admin/ordens-servico)
├── 🅿️ Pátio (/admin/patio)
├── 📆 Agendamentos (/admin/agendamentos)
├── 👥 Clientes (/admin/clientes)
└── ⚙️ Configurações (/admin/configuracoes)
    └── 💡 Melhorias (/gestao/melhorias)

📁 Sistema
├── 🚗 Veículos (/admin/veiculos)
├── 🤖 IAs (/admin/ias)
└── ➕ Nova OS (/admin/nova-os)
```

### Implementação
- Arquivo: `src/components/layout/AdminLayout.tsx`
- Submenus colapsáveis com estado `expandedItems`
- Indentação visual por nível de profundidade
- Suporte mobile com drawer

---

## 🤖 Sistema de IAs

IAs disponíveis para automação:
- 🔍 **DoctorScan** - Diagnóstico veicular
- 📞 **AutoCall** - Atendimento telefônico
- 💬 **PrimeChat** - Chat com clientes
- 📊 **DataPrime** - Análise de dados
- 📅 **AgendaPro** - Gestão de agendamentos
- 🔔 **AlertaMaster** - Notificações inteligentes
- 💰 **PrecificaAI** - Precificação dinâmica
- ⭐ **QualityCheck** - Controle de qualidade

Arquivo: `src/pages/admin/AdminIAs.tsx`

---

## 📊 Componentes Reutilizáveis

### Layout
- `Header` - Cabeçalho do app cliente
- `BottomNavigation` - Navegação inferior mobile
- `AdminLayout` - Layout do painel admin

### UI (shadcn/ui)
- Accordion, Alert, Badge, Button, Card
- Calendar, Carousel, Checkbox, Dialog
- Dropdown, Form, Input, Label, Popover
- Progress, Select, Separator, Sheet
- Skeleton, Slider, Switch, Table, Tabs
- Textarea, Toast, Toggle, Tooltip

### Customizados
- `ThemeToggle` - Alternador dark/light
- `LoyaltyCard` - Cartão fidelidade
- `EditProfileDialog` - Modal de edição de perfil
- `LayoutPatio` - Mapa visual do pátio
- `DiagnosticoIA` - Interface de diagnóstico IA

---

## 🔌 Edge Functions

### `ai-oficina`
Função para integração com modelos de IA.
- Caminho: `supabase/functions/ai-oficina/index.ts`
- Uso: Chat com IAs do sistema

---

## 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── layout/          # Layouts (Header, Admin, Navigation)
│   ├── os/              # Componentes de Ordem de Serviço
│   ├── patio/           # Componentes do pátio
│   ├── profile/         # Componentes de perfil
│   └── ui/              # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx  # Autenticação
│   └── CompanyContext.tsx # Multi-empresa
├── hooks/
│   ├── useTheme.tsx     # Tema dark/light
│   ├── useUserRole.tsx  # Role do usuário
│   ├── use-mobile.tsx   # Detecção mobile
│   └── use-toast.ts     # Notificações toast
├── integrations/
│   └── supabase/        # Cliente e tipos Supabase
├── lib/
│   ├── mock-data.ts     # Dados mock
│   └── utils.ts         # Utilitários (cn, etc)
├── pages/
│   ├── admin/           # Páginas administrativas
│   └── gestao/          # Páginas de gestão
└── test/                # Configuração de testes
```

---

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Linting
npm run test     # Testes (Vitest)
```

---

## 📝 Convenções de Código

1. **Componentes**: PascalCase (`AdminDashboard.tsx`)
2. **Hooks**: camelCase com prefixo `use` (`useTheme.tsx`)
3. **Contextos**: PascalCase com sufixo `Context` (`AuthContext.tsx`)
4. **Estilos**: Tailwind CSS com tokens semânticos
5. **Imports**: Alias `@/` para `src/`

---

## 🔄 Próximas Implementações

- [ ] Criar páginas `AdminProdutividade` e `AdminMelhorias`
- [ ] Implementar filtros por empresa nas consultas
- [ ] Criar tabelas de clientes e veículos no banco
- [ ] Implementar sistema de Ordens de Serviço completo
- [ ] Adicionar webhooks para integração com Kommo CRM
- [ ] Implementar notificações push

---

*Documentação atualizada em: Janeiro 2026*
