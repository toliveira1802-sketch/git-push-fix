# Doctor Auto - Versão Final - TODO

## Fase 1: Configuração Base
- [x] Configurar projeto base
- [x] Criar todo.md
- [ ] Configurar sistema de autenticação com roles (admin, oficina, cliente)
- [ ] Criar estrutura base de navegação para as três visões

## Fase 1.5: Criar Tabelas Base
- [x] Criar tabela Empresas
- [x] Criar tabela Colaboradores
- [x] Criar tabela Mecânicos
- [x] Criar tabela Recursos
- [x] Criar tabela Níveis de Acesso

## Fase 2: Visão da Oficina (Admin) - Interface Web
- [ ] Tabela de Clientes (cadastro, listagem, edição)
- [ ] Tabela de Veículos (vinculados aos clientes)
- [ ] Tabela de Serviços (catálogo de serviços oferecidos)
- [ ] Tabela de Ordens de Serviço (OS)
- [ ] Tela de criação de nova OS
- [ ] Tela de listagem e filtro de OS
- [ ] Tela de detalhes da OS com status
- [ ] Gestão de status da OS (aberta, em andamento, aguardando peças, concluída, entregue)

## Fase 3: Visão de Gestão - Dashboards Operacionais
- [ ] Dashboard principal com métricas (OS abertas, concluídas, faturamento)
- [ ] Relatórios de produtividade
- [ ] Relatórios financeiros
- [ ] Visão de agenda/calendário
- [ ] Interface responsiva (web e mobile)

## Fase 4: Visão do Cliente - Aplicativo Mobile-First
- [ ] Tela de login do cliente
- [ ] Visualização dos veículos do cliente
- [ ] Acompanhamento de OS em tempo real
- [ ] Histórico de serviços
- [ ] Notificações de status

## Fase 5: Integração e Testes
- [ ] Integrar fluxos entre as três visões
- [ ] Testar autenticação e autorização por role
- [ ] Validar responsividade em dispositivos móveis
- [ ] Testes de usabilidade

## Bugs e Ajustes
(Adicionar conforme identificados)

## Fase 1.6: Sistema de Login e Autenticação
- [x] Criar página de login para funcionários (colaboradores)
- [x] Implementar autenticação via email/senha usando tabela colaboradores
- [x] Criar rotas protegidas para área admin
- [x] Criar dashboard inicial da oficina (admin)

## Fase 1.7: Sistema de Senha Padrão
- [x] Adicionar campo primeiroAcesso na tabela colaboradores
- [x] Senha padrão inicial: 123456
- [x] Criar tela de troca de senha obrigatória no primeiro acesso
- [x] Após trocar senha, marcar primeiroAcesso como false

## Fase 2.1: Conectar Telas com Banco
- [x] Criar página de visualização de Clientes e Veículos conectada ao banco
- [x] Conectar todas as páginas admin com dados mock

## Fase 2.2: Refazer Dashboard Admin
- [x] Criar Dashboard igual à referência com:
  - [x] Pendências do dia (Thalles, João, Pedro) no topo
  - [x] 4 abas: Operacional, Financeiro, Produtividade, Agenda
  - [x] Cards com métricas em cada aba
  - [x] Sidebar com navegação (Dashboard, Visão Geral, Pátio, Agendamentos, Cadastro, Configurações)
  - [x] Seletor de empresa no canto superior direito

## Fase 2.3: Criar Tela Operacional
- [x] Header com abas (Operacional, Financeiro, Produtividade, Agenda, Histórico)
- [x] Cards de status (Capacidade, Fluxo, Retorno, Fora da Loja)
- [x] Status Pátio com filtro de consultores
- [x] 8 cards de status das OS
- [x] Veículos Atrasados
- [x] Tempo Médio de Permanência por Etapa (com gargalos)
- [x] Agenda dos mecânicos do dia (não da semana)

## Ajustes Solicitados
- [x] Adicionar "Nova OS" no menu lateral entre "Visão Geral" e "Pátio"

## Fase 2.4: Criar Página de Agendamentos
- [x] Header com título + botão Novo Agendamento (sem Checklist)
- [x] Cards de estatísticas (Hoje, Aguardando, Do Kommo, Confirmados)
- [x] Barra de busca + filtros
- [x] Lista de agendamentos com dados do cliente/veículo
- [x] Botão "Confirmar Chegada" (em vez de WhatsApp)
- [x] Ao confirmar chegada: criar OS automaticamente e abrir card no Kanban em Diagnóstico

## Ajustes Nova OS
- [x] Juntar "Sel. Cliente" e "Sel. Veículos" em um único campo
- [x] Trocar "Sel. Veículos" por "Adicionar Novo Cliente"
- [x] Simplificar formulário novo cliente: Nome, Telefone, Placa, Veículo

## Sistema de Pendências
- [x] Apagar botão "Linhas da equipe" do Dashboard
- [x] Ativar botão "Operacional" para ir para página operacional
- [x] Transformar "Pendências do dia" em botão clicável que vai para nova página
- [x] Criar página de Pendências com lista de consultores
- [x] Criar modal de Nova Pendência com formulário
- [ ] Criar tabela de pendências no banco de dados (usando mock por enquanto)

## Atualização Página de Agendamentos
- [ ] Header com botões "Checklist" e "Novo Agendamento" lado a lado
- [ ] 4 Cards de estatísticas: Hoje, Aguardando, Do Kommo, Confirmados
- [ ] Barra de busca com placeholder "Buscar cliente, placa ou v..."
- [ ] Filtros: Todas origens, Todos status, Filtrar data
- [ ] Cards de agendamento com nome, badges, data/hora, veículo, placa
- [ ] Tags de serviços nos cards
- [ ] Botões: WhatsApp, Reagendar, Cancelar

## Telas de Gestão
- [x] Criar página principal GestaoDashboards com 6 módulos
- [x] Criar GestaoRH (Recursos Humanos)
- [x] Criar GestaoOperacoes
- [x] Criar GestaoFinanceiro
- [x] Criar GestaoTecnologia
- [x] Criar GestaoComercial
- [x] Criar GestaoMelhorias
- [x] Adicionar opção Gestão no menu lateral (baseado no cargo)
- [x] Configurar rotas /gestao/*

## Correções Pendências e Operacional
- [x] Dashboard: Botão único "Pendências do dia" (sem nomes)
- [x] Dashboard: Botão Operacional navegar para /admin/operacional
- [x] Prime: Consultores Thales (1 L), Pedro, João
- [x] Página Pendências: Cards com campo descrição
- [x] Página Pendências: Status = Pendente (padrão), Feito, Feito com ressalvas
- [x] Página Pendências: Ordem FIFO (mais antigas primeiro)
- [x] Página Pendências: Filtro por Todos, Thales, Pedro, João
- [x] Página Pendências: Permissões (consultores só para si, gestão/direção para todos)

## Ajustes Operacional e Overview
- [ ] Remover "Agenda dos Mecânicos" do Operacional
- [ ] Manter cabeçalho (Operacional, Financeiro, Produtividade, Agenda) nas outras páginas
- [ ] Verificar cálculo de Performance dos Mecânicos no Overview

## Atualização Página Financeiro
- [ ] Criar layout igual à referência com 6 cards
- [ ] Card FATURADO (azul) - Total entregue
- [ ] Card TICKET MÉDIO (roxo) - Por veículo
- [ ] Card SAÍDA HOJE (rosa) - Previsão de entrega
- [ ] Card ATRASADO (amarelo) - Previsão vencida
- [ ] Card PRESO (laranja) - No pátio
- [ ] Card ENTREGUES (verde) - Veículos finalizados
- [ ] Header com filtro de período e botões
- [ ] Menu superior: Operacional, Financeiro, Produtividade, Agenda, Histórico
- [ ] Conectar com tabela de dados (aguardando usuário)

## Página OS Ultimate
- [x] Criar página /admin/os-ultimate/:id (OS Ultimate)
- [x] Header com status, número OS, veículo, placa
- [x] Cards: Cliente, Valor Total, Previsão Entrega
- [x] Tabs: Resumo, Serviços, Fotos, Histórico
- [x] Problema Relatado e Diagnóstico Técnico
- [x] Lista de serviços com status (concluído, em andamento, pendente)
- [x] Resumo financeiro (peças, mão de obra, desconto, total)
- [x] Botões: Contatar Cliente, Atualizar Status
- [x] Conectar Nova OS para redirecionar após criar
- [ ] Status inicial = Diagnóstico automático (a implementar com banco)

## Página Orçamento Cliente
- [x] Copiar OrcamentoCliente.tsx do repositório antigo
- [x] Adaptar para usar wouter e estrutura atual
- [x] Registrar rota no App.tsx (/cliente/orcamento/:osId)
- [x] Testar funcionamento

## Correção OS Ultimate (Visão Admin)
- [x] Analisar AdminOSDetalhes.tsx do repositório antigo
- [x] Analisar AdminOrdensServico.tsx do repositório antigo
- [x] Adaptar AdminOSDetalhes para visão da oficina (com itens, prioridades, checklist, etc)
- [x] Testar funcionamento - Página AdminOSDetalhes com visão admin completa funcionando

## Passo 1-2-3: Banco + AdminOrdensServico + Fluxo Nova OS
- [x] Criar tabelas: ordens_servico e os_itens no banco (campos extras adicionados)
- [x] Criar procedures tRPC para CRUD de OS
- [x] Conectar AdminOSDetalhes com banco real
- [x] Adaptar AdminOrdensServico com layout completo (tabs, stats, tabela)
- [x] Fluxo Nova OS → redirecionar para AdminOSDetalhes após criar
- [x] Testar funcionamento completo - OS criada e redirecionada para AdminOSDetalhes

## Passo 2: Conectar Clientes/Veículos ao Banco
- [x] Atualizar AdminNovaOS para salvar cliente no banco ao criar
- [x] Salvar veículo vinculado ao cliente no banco
- [x] Vincular cliente/veículo à OS criada
- [ ] Exibir dados reais do cliente/veículo na AdminOSDetalhes

## Passo 3: Visão do Pátio (Kanban)
- [x] Criar página AdminPatio com Kanban por status
- [x] Colunas: Diagnóstico, Orçamento, Aprovação, Em Execução, Pronto
- [x] Cards com placa, número OS, tempo no pátio, valor
- [x] Drag and drop para mudar status
- [x] Filtros por consultor e busca por placa/OS
- [x] Recursos da oficina com status (ocupado/livre)
- [x] AdminPatioDetalhes conectado ao banco

## Importação de Dados Reais - Empresas
- [x] Ler CSV empresas_20260202_100005.csv
- [x] Limpar tabela empresas existente
- [x] Importar dados do CSV para tabela empresas (3 registros)
- [x] Verificar importação - DOCTOR AUTO PRIME, DOCTOR AUTO BOSCH, GARAGEM 347

## Renomear Tabela empresas → 00_empresas
- [x] Renomear tabela no banco de dados
- [x] Atualizar schema.ts do Drizzle
- [x] Verificar funcionamento - 3 registros mantidos

## Renomear e Importar 01_colaboradores
- [x] Renomear tabela colaboradores para 01_colaboradores
- [x] Ler CSV colaboradores_20260202_100823.csv
- [x] Calcular id_colab (3 dígitos empresa + 3 telefone + 3 CPF)
- [x] Importar dados para 01_colaboradores (10 registros)
- [x] Verificar importação

## Renomear niveis_acesso → 02_nivelDeAcesso
- [x] Renomear tabela no banco de dados
- [x] Atualizar schema.ts
- [x] Verificar funcionamento

## Renomear e Importar 03_mecanicos
- [x] Renomear tabela mecanicos para 03_mecanicos
- [x] Ler CSV mecanicos_20260202_101806.csv
- [x] Importar dados para 03_mecanicos (12 mecânicos)
- [x] Verificar importação

## Renomear 04_lista_status, 05_pendencias, 06_recursos
- [x] Renomear lista_status para 04_lista_status
- [x] Renomear pendencias para 05_pendencias
- [x] Renomear recursos para 06_recursos
- [x] Importar dados de recursos do CSV (18 recursos)
- [x] Atualizar schema.ts
- [x] Verificar funcionamento

## Renomear 97_ANALISE_PROMOCOES, 98_SERVIÇOS, 99_CRM
- [x] Renomear analise_promocoes para 97_ANALISE_PROMOCOES (já estava)
- [x] Renomear servicos_catalogo para 98_SERVICOS
- [x] Renomear crm para 99_CRM
- [x] Atualizar schema.ts
- [x] Verificar funcionamento

## Atualizar 04_lista_status
- [x] Ler CSV workflow_etapas_rows.csv
- [x] Limpar tabela 04_lista_status
- [x] Importar dados completos do CSV (9 status)
- [x] Verificar importação

## Atualizar código para usar novos nomes de tabelas
- [x] Verificar erros de compilação - Nenhum erro TypeScript/LSP
- [x] Servidor rodando normalmente
- [x] Sistema pronto para testes

## CHECKLIST DEV - BUGS CRÍTICOS E ALTA PRIORIDADE

### 🔴 CRÍTICO
- [x] Corrigir quebra da página Dashboard - FUNCIONANDO
- [x] Header: "bem-vindo de volta, usuário" → nome do usuário logado ("Bem-vindo de volta, Thales")
- [x] Corrigir bug que expulsa o usuário do sistema - Login funcionando
- [x] Adicionar navegação de retorno ao painel principal (AdminNovaOS, AdminOSDetalhes, AdminOrdensServico, AdminPatio)
- [ ] Corrigir fluxo de Criar OS: página específica, botão não quebrar fluxo

### 🟠 ALTA PRIORIDADE
- [x] Remover dados mockados da Dashboard - Usando dados do banco
- [x] Pendências do dia: aumentar fonte, melhorar ocupação da tela
- [x] Campos Nova OS: remover "Motivo da visita" e "KM", manter só descrição do problema

### 🔵 ESTRUTURAL
- [x] Criar link "Ordens Itens Serviço" dentro de Cadastros (já existe no menu)
- [ ] Revisar estrutura de rotas para evitar redirects indevidos

## Renomear Tabelas e Importar Dados
- [x] Renomear ordens_servico → 09_ordens_servico
- [x] Renomear ordens_servico_itens → 11_ordens_servico_itens
- [x] Renomear clientes → 07_clientes
- [x] Renomear veiculos → 08_veiculos
- [x] Criar tabela 10_ordens_servico_historico
- [x] Criar tabela 12_agendamentos
- [x] Criar tabela 95_faturamento
- [x] Importar dados de 07_clientes.xlsx (1 cliente: NELSON VOLPATO)
- [ ] Importar dados de 08_veiculos.xlsx (arquivo contém veículos)
- [x] Gerar relatório de regras de cadastro (RELATORIO_REGRAS_CADASTRO.md)

## Adaptar Visão Pátio (Kanban + Mapa)
- [ ] Ler LayoutPatio.tsx enviado
- [ ] Ler KanbanCard.tsx enviado
- [ ] Ler KanbanCardDetails.tsx enviado
- [ ] Adaptar componentes para o projeto atual
- [ ] Testar funcionamento
