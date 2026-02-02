# Doctor Auto - Compilado de Tabelas do Sistema

## Resumo

O sistema possui **17 tabelas** no banco de dados + **13 entidades** de dados mock.

---

## 1. TABELAS DO BANCO DE DADOS (Schema Drizzle)

### 1.1 users (Autenticação)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| openId | varchar(64) | ID único OAuth |
| name | text | Nome do usuário |
| email | varchar(320) | Email |
| loginMethod | varchar(64) | Método de login |
| role | enum(user, admin) | Papel no sistema |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |
| lastSignedIn | timestamp | Último login |

---

### 1.2 empresas (00_EMPRESAS)
**Telas:** AdminDashboard, AdminDashboardOverview, Configurações

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| razaoSocial | varchar(255) | Razão social |
| nomeEmpresa | varchar(255) | Nome fantasia |
| cnpj | varchar(20) | CNPJ |
| telefone | varchar(20) | Telefone |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

**Dados atuais:**
- Doctor Auto Prime
- Doctor Auto Bosch (Pombal)
- Garage 347

---

### 1.3 niveis_acesso (04_NIVEL_DE_ACESSO)
**Telas:** Login, Configurações, controle de permissões

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| tipoUsuario | varchar(100) | Tipo de usuário |
| nivelAcesso | int | Nível (1-5) |
| permissoes | text | JSON de permissões |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.4 colaboradores (01_COLABORADORES)
**Telas:** Login, AdminDashboard, AdminAgendaMecanicos, Configurações

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| empresaId | int | FK empresa |
| nome | varchar(255) | Nome completo |
| cargo | varchar(100) | Cargo (Direção, Gestão, Consultor Técnico) |
| email | varchar(320) | Email |
| telefone | varchar(20) | Telefone |
| cpf | varchar(14) | CPF |
| senha | varchar(255) | Senha (default: 123456) |
| primeiroAcesso | boolean | Primeiro acesso? |
| nivelAcessoId | int | FK nível de acesso |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

**Dados atuais:**
| Nome | Cargo | Empresa |
|------|-------|---------|
| Thales | Direção | Prime |
| Sofia | Direção | Prime |
| Francisco | Gestão | Prime |
| Márcia | Gestão | Prime |
| Pedro | Consultor Técnico | Prime |
| João | Consultor Técnico | Prime |
| Rony | Consultor Técnico | Bosch |
| Antônio | Consultor Técnico | Garage 347 |

---

### 1.5 mecanicos (02_MECANICOS)
**Telas:** AdminAgendaMecanicos, AdminMechanicAnalytics, AdminMechanicFeedback, AdminProdutividade, AdminPainelTV

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| empresaId | int | FK empresa |
| nome | varchar(255) | Nome |
| email | varchar(320) | Email |
| telefone | varchar(20) | Telefone |
| cpf | varchar(14) | CPF |
| grauConhecimento | varchar(50) | Júnior, Pleno, Sênior |
| especialidade | varchar(255) | Motor, Elétrica, Suspensão, etc |
| qtdePositivos | int | Feedbacks positivos |
| qtdeNegativos | int | Feedbacks negativos |
| ativo | boolean | Ativo? |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

**Dados atuais:**
| Nome | Especialidade | Nível | Empresa |
|------|---------------|-------|---------|
| Tadeu | Motor | Sênior | Prime |
| João | Elétrica | Pleno | Prime |
| Pedro | Suspensão | Sênior | Prime |
| Aldo | Freios | Pleno | Prime |
| Samuel | Câmbio | Júnior | Prime |
| Alessandro | Diagnóstico | Sênior | Prime |
| Wendel | Motor | Pleno | Bosch |
| Alexandre | Injeção | Sênior | Bosch |
| Léo | Elétrica | Júnior | Bosch |
| Rogério | Geral | Pleno | Garage 347 |
| Matheus | Motor | Júnior | Garage 347 |
| Gabriel | Suspensão | Pleno | Garage 347 |

---

### 1.6 recursos (03_RECURSOS)
**Telas:** AdminOperacional, AdminPatio, AdminProdutividade

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| empresaId | int | FK empresa |
| nomeRecurso | varchar(255) | Nome do recurso |
| ultimaManutencao | date | Última manutenção |
| horasUtilizadasMes | int | Horas utilizadas no mês |
| valorProduzidoMes | int | Valor produzido no mês |
| ativo | boolean | Ativo? |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

**Dados atuais:**
- Elevadores 1-9
- Boxes 1-5
- Rampa
- Dinamômetro
- VCDS
- Remap
- Vagas Extras

---

### 1.7 clientes (05_CLIENTES)
**Telas:** AdminClientes, AdminNovaOS, AdminOrdensServico, AdminOSDetalhes, Visão Cliente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| empresaId | int | FK empresa |
| nomeCompleto | varchar(255) | Nome completo |
| cpf | varchar(14) | CPF |
| email | varchar(320) | Email |
| telefone | varchar(20) | Telefone |
| dataNascimento | date | Data nascimento |
| endereco | varchar(500) | Endereço |
| cep | varchar(10) | CEP |
| cidade | varchar(100) | Cidade |
| estado | varchar(2) | Estado |
| origemCadastro | varchar(100) | Origem do cadastro |
| senha | varchar(255) | Senha (default: 123456) |
| primeiroAcesso | boolean | Primeiro acesso? |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.8 veiculos (06_VEICULOS)
**Telas:** AdminClientes, AdminNovaOS, AdminOrdensServico, AdminOSDetalhes, AdminPatio, Visão Cliente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| clienteId | int | FK cliente |
| placa | varchar(10) | Placa |
| marca | varchar(100) | Marca |
| modelo | varchar(255) | Modelo |
| versao | varchar(255) | Versão |
| ano | int | Ano |
| combustivel | varchar(50) | Combustível |
| ultimoKm | int | Último KM registrado |
| kmAtual | int | KM atual |
| origemContato | varchar(100) | Origem do contato |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.9 ordens_servico (07_ORDEM_DE_SERVICO)
**Telas:** AdminOrdensServico, AdminNovaOS, AdminOSDetalhes, AdminPatio, AdminPatioDetalhes, AdminDashboard, AdminFinanceiro, AdminPainelTV

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| numeroOs | varchar(20) | Número da OS |
| dataEntrada | timestamp | Data entrada |
| dataSaida | timestamp | Data saída |
| clienteId | int | FK cliente |
| veiculoId | int | FK veículo |
| placa | varchar(10) | Placa |
| km | int | KM na entrada |
| status | varchar(50) | Status atual |
| colaboradorId | int | FK colaborador |
| mecanicoId | int | FK mecânico |
| recursoId | int | FK recurso |
| veioDePromocao | boolean | Veio de promoção? |
| motivoVisita | varchar(255) | Motivo da visita |
| totalOrcamento | decimal(10,2) | Total orçamento |
| valorTotalOs | decimal(10,2) | Valor total OS |
| primeiraVez | boolean | Primeira vez? |
| observacoes | text | Observações |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.10 crm (08_CRM)
**Telas:** AdminClientes, AdminDashboard, Relatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| clienteId | int | FK cliente |
| marcaCarro | varchar(100) | Marca preferida |
| modeloCarro | varchar(255) | Modelo preferido |
| tipoServico1 | varchar(100) | Serviço mais usado 1 |
| tipoServico2 | varchar(100) | Serviço mais usado 2 |
| tipoServico3 | varchar(100) | Serviço mais usado 3 |
| ultimaQuilometragem | int | Última KM |
| ultimaPassagem | timestamp | Última passagem |
| totalPassagens | int | Total de passagens |
| totalGasto | decimal(10,2) | Total gasto |
| comoConheceu | varchar(255) | Como conheceu |
| nivelFidelidade | varchar(50) | Nível fidelidade |
| pontosFidelidade | int | Pontos fidelidade |
| cashbackDisponivel | decimal(10,2) | Cashback disponível |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.11 ordens_servico_historico (09_ORDEM_DE_SERVICO_HISTORICO)
**Telas:** AdminOSDetalhes, Relatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| ordemServicoId | int | FK ordem de serviço |
| statusAnterior | varchar(50) | Status anterior |
| statusNovo | varchar(50) | Status novo |
| colaboradorId | int | FK colaborador |
| observacao | text | Observação |
| dataAlteracao | timestamp | Data alteração |
| createdAt | timestamp | Data criação |

---

### 1.12 ordens_servico_itens (10_ORDEM_DE_SERVICO_DETALHADA)
**Telas:** AdminOSDetalhes, AdminFinanceiro

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| ordemServicoId | int | FK ordem de serviço |
| tipo | varchar(50) | Peça, Serviço, Mão de Obra |
| descricao | varchar(500) | Descrição |
| quantidade | int | Quantidade |
| valorUnitario | decimal(10,2) | Valor unitário |
| valorTotal | decimal(10,2) | Valor total |
| aprovado | boolean | Aprovado? |
| executado | boolean | Executado? |
| mecanicoId | int | FK mecânico |
| createdAt | timestamp | Data criação |

---

### 1.13 analise_promocoes (11_ANALISE_PROMOCOES)
**Telas:** AdminDashboard, Relatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| dataPromocao | date | Data promoção |
| nomePromocao | varchar(255) | Nome promoção |
| clienteId | int | FK cliente |
| veioPelaPromocao | boolean | Veio pela promoção? |
| clienteRetornou | boolean | Cliente retornou? |
| quantasVezesRetornou | int | Quantas vezes retornou |
| totalGasto | decimal(10,2) | Total gasto |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.14 lista_status (12_LISTA_STATUS)
**Telas:** AdminOrdensServico, AdminOSDetalhes, AdminPatio, AdminOperacional

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| status | varchar(100) | Nome do status |
| ordem | int | Ordem de exibição |
| cor | varchar(20) | Cor (hex) |
| ativo | boolean | Ativo? |
| createdAt | timestamp | Data criação |

**Dados atuais:**
| Status | Cor | Ordem |
|--------|-----|-------|
| Diagnóstico | #3B82F6 | 1 |
| Orçamento | #8B5CF6 | 2 |
| Aguardando Aprovação | #F59E0B | 3 |
| Aguardando Peça | #EF4444 | 4 |
| Pronto para Iniciar | #10B981 | 5 |
| Em Execução | #06B6D4 | 6 |
| Pronto | #22C55E | 7 |
| Aguardando Retirada | #84CC16 | 8 |
| Entregue | #6B7280 | 9 |

---

### 1.15 agendamentos (13_AGENDAMENTOS)
**Telas:** AdminAgendamentos, AdminDashboard, AdminPainelTV

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| clienteId | int | FK cliente |
| veiculoId | int | FK veículo |
| dataAgendamento | date | Data agendamento |
| horaAgendamento | varchar(10) | Hora agendamento |
| motivoVisita | varchar(255) | Motivo da visita |
| status | varchar(50) | Status (agendado, confirmado, etc) |
| colaboradorId | int | FK colaborador |
| observacoes | text | Observações |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.16 faturamento (14_FATURAMENTO)
**Telas:** AdminFinanceiro, AdminDashboard, AdminDashboardOverview

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| ordemServicoId | int | FK ordem de serviço |
| clienteId | int | FK cliente |
| dataEntrega | date | Data entrega |
| valor | decimal(10,2) | Valor |
| formaPagamento | varchar(100) | Forma de pagamento |
| parcelas | int | Número de parcelas |
| observacoes | text | Observações |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

### 1.17 servicos_catalogo (15_SERVICOS_CATALOGO)
**Telas:** AdminServicos, AdminNovaOS, AdminOSDetalhes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| nome | varchar(255) | Nome do serviço |
| descricao | text | Descrição |
| tipo | varchar(50) | Peça, Serviço, Mão de Obra, Diagnóstico, Instalação |
| valorBase | decimal(10,2) | Valor base |
| tempoEstimado | int | Tempo estimado (minutos) |
| ativo | boolean | Ativo? |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

**Dados atuais:**
| Serviço | Tipo | Valor Base | Tempo |
|---------|------|------------|-------|
| Troca de Óleo | Serviço | R$ 150 | 30 min |
| Alinhamento e Balanceamento | Serviço | R$ 180 | 45 min |
| Troca de Pastilhas de Freio | Serviço | R$ 250 | 60 min |
| Revisão Completa | Serviço | R$ 800 | 180 min |
| Diagnóstico Eletrônico | Diagnóstico | R$ 200 | 60 min |
| Troca de Correia Dentada | Serviço | R$ 1.200 | 240 min |
| Reprogramação de Módulo | Serviço | R$ 500 | 90 min |
| Mão de Obra Hora | Mão de Obra | R$ 120 | 60 min |

---

### 1.18 pendencias (16_PENDENCIAS)
**Telas:** AdminDashboard, AdminPendencias

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | PK auto-increment |
| nomePendencia | varchar(255) | Nome da pendência |
| responsavelId | int | FK colaborador responsável |
| criadorId | int | FK colaborador criador |
| status | enum | pendente, feita, feita_ressalvas, nao_feita |
| dataCriacao | timestamp | Data criação |
| dataAtualizacao | timestamp | Data atualização |
| observacoes | text | Observações |
| empresaId | int | FK empresa |

---

## 2. DADOS MOCK (mockData.ts)

Além das tabelas do banco, temos dados mock para desenvolvimento:

| Entidade | Quantidade | Descrição |
|----------|------------|-----------|
| statusList | 9 | Status das OS |
| empresasMock | 3 | Empresas do grupo |
| colaboradoresMock | 8 | Colaboradores |
| mecanicosMock | 12 | Mecânicos |
| recursosMock | 19 | Recursos (elevadores, boxes, etc) |
| clientesMock | 3 | Clientes de teste |
| veiculosMock | 4 | Veículos de teste |
| ordensServicoMock | 7 | OS de teste |
| agendamentosMock | 4 | Agendamentos de teste |
| servicosCatalogoMock | 8 | Serviços do catálogo |
| faturamentoMock | 2 | Faturamento de teste |
| dashboardStatsMock | 1 | Estatísticas do dashboard |
| metasProdutividadeMock | 4 | Metas de produtividade |

---

## 3. RELACIONAMENTOS PRINCIPAIS

```
empresas (1) ──────< (N) colaboradores
empresas (1) ──────< (N) mecanicos
empresas (1) ──────< (N) recursos
empresas (1) ──────< (N) clientes

clientes (1) ──────< (N) veiculos
clientes (1) ──────< (N) ordens_servico
clientes (1) ──────< (1) crm

veiculos (1) ──────< (N) ordens_servico

ordens_servico (1) ──────< (N) ordens_servico_itens
ordens_servico (1) ──────< (N) ordens_servico_historico
ordens_servico (1) ──────< (1) faturamento

colaboradores (1) ──────< (N) pendencias (responsável)
colaboradores (1) ──────< (N) pendencias (criador)
```

---

## 4. PERFORMANCE DOS MECÂNICOS (Overview)

**Cálculo atual:**
- `qtdePositivos` = quantidade de feedbacks positivos
- `qtdeNegativos` = quantidade de feedbacks negativos

**Exibição:** +45 / -2 (positivos vs negativos)

**Sugestões para melhorar:**
1. OS concluídas no mês
2. Tempo médio por serviço
3. Faturamento gerado
4. Taxa de retrabalho
