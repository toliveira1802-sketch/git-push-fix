import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// =====================================================
// TABELAS DO DOCTOR AUTO
// =====================================================

/**
 * 00_EMPRESAS - Empresas do grupo (Doctor Auto Prime, Pombal, Garage 347)
 * TELAS: AdminDashboard, AdminDashboardOverview, Configurações
 */
export const empresas = mysqlTable("00_empresas", {
  id: int("id").autoincrement().primaryKey(),
  razaoSocial: varchar("razaoSocial", { length: 255 }),
  nomeEmpresa: varchar("nomeEmpresa", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

/**
 * 02_NIVEL_DE_ACESSO - Níveis de acesso do sistema
 * TELAS: Login, Configurações, controle de permissões em todas as telas
 */
export const niveisAcesso = mysqlTable("02_nivelDeAcesso", {
  id: int("id").autoincrement().primaryKey(),
  tipoUsuario: varchar("tipoUsuario", { length: 100 }).notNull(),
  nivelAcesso: int("nivelAcesso").notNull().default(1),
  permissoes: text("permissoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NivelAcesso = typeof niveisAcesso.$inferSelect;
export type InsertNivelAcesso = typeof niveisAcesso.$inferInsert;

/**
 * 01_COLABORADORES - Colaboradores das empresas (Direção, Gestão, Consultores)
 * TELAS: Login, AdminDashboard, AdminAgendaMecanicos, Configurações
 */
export const colaboradores = mysqlTable("01_colaboradores", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  senha: varchar("senha", { length: 255 }).default("123456"),
  primeiroAcesso: boolean("primeiroAcesso").default(true),
  nivelAcessoId: int("nivelAcessoId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Colaborador = typeof colaboradores.$inferSelect;
export type InsertColaborador = typeof colaboradores.$inferInsert;

/**
 * 03_MECANICOS - Mecânicos das oficinas
 * TELAS: AdminAgendaMecanicos, AdminMechanicAnalytics, AdminMechanicFeedback, AdminProdutividade, AdminPainelTV
 */
export const mecanicos = mysqlTable("03_mecanicos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  grauConhecimento: varchar("grauConhecimento", { length: 50 }),
  especialidade: varchar("especialidade", { length: 255 }),
  qtdePositivos: int("qtdePositivos").default(0),
  qtdeNegativos: int("qtdeNegativos").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mecanico = typeof mecanicos.$inferSelect;
export type InsertMecanico = typeof mecanicos.$inferInsert;

/**
 * 03_RECURSOS - Recursos da oficina (Elevadores, Boxes, Equipamentos)
 * TELAS: AdminOperacional, AdminPatio, AdminProdutividade
 */
export const recursos = mysqlTable("06_recursos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"),
  nomeRecurso: varchar("nomeRecurso", { length: 255 }).notNull(),
  ultimaManutencao: date("ultimaManutencao"),
  horasUtilizadasMes: int("horasUtilizadasMes").default(0),
  valorProduzidoMes: int("valorProduzidoMes").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recurso = typeof recursos.$inferSelect;
export type InsertRecurso = typeof recursos.$inferInsert;

/**
 * 05_CLIENTES - Clientes cadastrados
 * TELAS: AdminClientes, AdminNovaOS, AdminOrdensServico, AdminOSDetalhes, Visão Cliente
 */
export const clientes = mysqlTable("07_clientes", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"),
  nomeCompleto: varchar("nomeCompleto", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  dataNascimento: date("dataNascimento"),
  endereco: varchar("endereco", { length: 500 }),
  cep: varchar("cep", { length: 10 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  origemCadastro: varchar("origemCadastro", { length: 100 }),
  senha: varchar("senha", { length: 255 }).default("123456"),
  primeiroAcesso: boolean("primeiroAcesso").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

/**
 * 06_VEICULOS - Veículos dos clientes
 * TELAS: AdminClientes, AdminNovaOS, AdminOrdensServico, AdminOSDetalhes, AdminPatio, Visão Cliente
 */
export const veiculos = mysqlTable("08_veiculos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  placa: varchar("placa", { length: 10 }).notNull(),
  marca: varchar("marca", { length: 100 }),
  modelo: varchar("modelo", { length: 255 }),
  versao: varchar("versao", { length: 255 }),
  ano: int("ano"),
  combustivel: varchar("combustivel", { length: 50 }),
  ultimoKm: int("ultimoKm").default(0),
  kmAtual: int("kmAtual").default(0),
  origemContato: varchar("origemContato", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Veiculo = typeof veiculos.$inferSelect;
export type InsertVeiculo = typeof veiculos.$inferInsert;

/**
 * 07_ORDEM_DE_SERVICO - Ordens de serviço principais
 * TELAS: AdminOrdensServico, AdminNovaOS, AdminOSDetalhes, AdminPatio, AdminPatioDetalhes, AdminDashboard, AdminFinanceiro, AdminPainelTV
 */
export const ordensServico = mysqlTable("09_ordens_servico", {
  id: int("id").autoincrement().primaryKey(),
  numeroOs: varchar("numeroOs", { length: 20 }),
  dataEntrada: timestamp("dataEntrada").defaultNow(),
  dataOrcamento: timestamp("dataOrcamento"),
  dataAprovacao: timestamp("dataAprovacao"),
  dataConclusao: timestamp("dataConclusao"),
  dataSaida: timestamp("dataSaida"),
  clienteId: int("clienteId"),
  veiculoId: int("veiculoId"),
  placa: varchar("placa", { length: 10 }),
  km: int("km").default(0),
  status: varchar("status", { length: 50 }).default("diagnostico"),
  colaboradorId: int("colaboradorId"),
  mecanicoId: int("mecanicoId"),
  recursoId: int("recursoId"),
  veioDePromocao: boolean("veioDePromocao").default(false),
  motivoVisita: varchar("motivoVisita", { length: 255 }),
  descricaoProblema: text("descricaoProblema"),
  diagnostico: text("diagnostico"),
  totalOrcamento: decimal("totalOrcamento", { precision: 10, scale: 2 }).default("0"),
  valorAprovado: decimal("valorAprovado", { precision: 10, scale: 2 }).default("0"),
  valorTotalOs: decimal("valorTotalOs", { precision: 10, scale: 2 }).default("0"),
  primeiraVez: boolean("primeiraVez").default(true),
  observacoes: text("observacoes"),
  motivoRecusa: text("motivoRecusa"),
  googleDriveLink: varchar("googleDriveLink", { length: 500 }),
  emTerceiros: boolean("emTerceiros").default(false),
  recurso: varchar("recurso", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrdemServico = typeof ordensServico.$inferSelect;
export type InsertOrdemServico = typeof ordensServico.$inferInsert;

/**
 * 08_CRM - Dados de relacionamento com cliente
 * TELAS: AdminClientes, AdminDashboard, Relatórios
 */
export const crm = mysqlTable("99_CRM", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  marcaCarro: varchar("marcaCarro", { length: 100 }),
  modeloCarro: varchar("modeloCarro", { length: 255 }),
  tipoServico1: varchar("tipoServico1", { length: 100 }),
  tipoServico2: varchar("tipoServico2", { length: 100 }),
  tipoServico3: varchar("tipoServico3", { length: 100 }),
  ultimaQuilometragem: int("ultimaQuilometragem").default(0),
  ultimaPassagem: timestamp("ultimaPassagem"),
  totalPassagens: int("totalPassagens").default(0),
  totalGasto: decimal("totalGasto", { precision: 10, scale: 2 }).default("0"),
  comoConheceu: varchar("comoConheceu", { length: 255 }),
  nivelFidelidade: varchar("nivelFidelidade", { length: 50 }),
  pontosFidelidade: int("pontosFidelidade").default(0),
  cashbackDisponivel: decimal("cashbackDisponivel", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Crm = typeof crm.$inferSelect;
export type InsertCrm = typeof crm.$inferInsert;

/**
 * 09_ORDEM_DE_SERVICO_HISTORICO - Histórico de alterações nas OS
 * TELAS: AdminOSDetalhes, Relatórios
 */
export const ordensServicoHistorico = mysqlTable("10_ordens_servico_historico", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  colaboradorId: int("colaboradorId"),
  observacao: text("observacao"),
  dataAlteracao: timestamp("dataAlteracao").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrdemServicoHistorico = typeof ordensServicoHistorico.$inferSelect;
export type InsertOrdemServicoHistorico = typeof ordensServicoHistorico.$inferInsert;

/**
 * 10_ORDEM_DE_SERVICO_DETALHADA - Itens/serviços da OS
 * TELAS: AdminOSDetalhes, AdminFinanceiro
 */
export const ordensServicoItens = mysqlTable("11_ordens_servico_itens", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").notNull(),
  tipo: varchar("tipo", { length: 50 }), // peca, mao_de_obra
  descricao: varchar("descricao", { length: 500 }),
  quantidade: int("quantidade").default(1),
  valorCusto: decimal("valorCusto", { precision: 10, scale: 2 }).default("0"),
  margemAplicada: decimal("margemAplicada", { precision: 5, scale: 2 }).default("0"),
  valorUnitario: decimal("valorUnitario", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).default("0"),
  prioridade: varchar("prioridade", { length: 20 }).default("verde"), // verde, amarelo, vermelho
  status: varchar("status", { length: 20 }).default("pendente"), // pendente, aprovado, recusado
  motivoRecusa: text("motivoRecusa"),
  aprovado: boolean("aprovado").default(false),
  executado: boolean("executado").default(false),
  mecanicoId: int("mecanicoId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrdemServicoItem = typeof ordensServicoItens.$inferSelect;
export type InsertOrdemServicoItem = typeof ordensServicoItens.$inferInsert;

/**
 * 11_ANALISE_PROMOCOES - Análise de promoções
 * TELAS: AdminDashboard, Relatórios
 */
export const analisePromocoes = mysqlTable("97_ANALISE_PROMOCOES", {
  id: int("id").autoincrement().primaryKey(),
  dataPromocao: date("dataPromocao"),
  nomePromocao: varchar("nomePromocao", { length: 255 }),
  clienteId: int("clienteId"),
  veioPelaPromocao: boolean("veioPelaPromocao").default(false),
  clienteRetornou: boolean("clienteRetornou").default(false),
  quantasVezesRetornou: int("quantasVezesRetornou").default(0),
  totalGasto: decimal("totalGasto", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnalisePromocao = typeof analisePromocoes.$inferSelect;
export type InsertAnalisePromocao = typeof analisePromocoes.$inferInsert;

/**
 * 12_LISTA_STATUS - Status possíveis das OS
 * TELAS: AdminOrdensServico, AdminOSDetalhes, AdminPatio, AdminOperacional
 */
export const listaStatus = mysqlTable("04_lista_status", {
  id: int("id").autoincrement().primaryKey(),
  status: varchar("status", { length: 100 }).notNull(),
  ordem: int("ordem").default(0),
  cor: varchar("cor", { length: 20 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ListaStatus = typeof listaStatus.$inferSelect;
export type InsertListaStatus = typeof listaStatus.$inferInsert;

/**
 * 13_AGENDAMENTOS - Agendamentos de serviços
 * TELAS: AdminAgendamentos, AdminDashboard, AdminPainelTV
 */
export const agendamentos = mysqlTable("12_agendamentos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId"),
  veiculoId: int("veiculoId"),
  dataAgendamento: date("dataAgendamento").notNull(),
  horaAgendamento: varchar("horaAgendamento", { length: 10 }),
  motivoVisita: varchar("motivoVisita", { length: 255 }),
  status: varchar("status", { length: 50 }).default("agendado"),
  colaboradorId: int("colaboradorId"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agendamento = typeof agendamentos.$inferSelect;
export type InsertAgendamento = typeof agendamentos.$inferInsert;

/**
 * 14_FATURAMENTO - Faturamento/Financeiro
 * TELAS: AdminFinanceiro, AdminDashboard, AdminDashboardOverview
 */
export const faturamento = mysqlTable("95_faturamento", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId"),
  clienteId: int("clienteId"),
  dataEntrega: date("dataEntrega"),
  valor: decimal("valor", { precision: 10, scale: 2 }).default("0"),
  formaPagamento: varchar("formaPagamento", { length: 100 }),
  parcelas: int("parcelas").default(1),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faturamento = typeof faturamento.$inferSelect;
export type InsertFaturamento = typeof faturamento.$inferInsert;

/**
 * 15_SERVICOS_CATALOGO - Catálogo de serviços
 * TELAS: AdminServicos, AdminNovaOS, AdminOSDetalhes
 */
export const servicosCatalogo = mysqlTable("98_SERVICOS", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: varchar("tipo", { length: 50 }), // Peça, Serviço, Mão de Obra, Diagnóstico, Instalação
  valorBase: decimal("valorBase", { precision: 10, scale: 2 }).default("0"),
  tempoEstimado: int("tempoEstimado").default(0), // em minutos
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServicoCatalogo = typeof servicosCatalogo.$inferSelect;
export type InsertServicoCatalogo = typeof servicosCatalogo.$inferInsert;


/**
 * 16_PENDENCIAS - Pendências da equipe
 * TELAS: AdminDashboard, AdminPendencias
 */
export const pendencias = mysqlTable("05_pendencias", {
  id: int("id").autoincrement().primaryKey(),
  nomePendencia: varchar("nomePendencia", { length: 255 }).notNull(),
  responsavelId: int("responsavelId").notNull(), // colaborador responsável
  criadorId: int("criadorId").notNull(), // quem criou a pendência
  status: mysqlEnum("status", ["pendente", "feita", "feita_ressalvas", "nao_feita"]).default("pendente").notNull(),
  dataCriacao: timestamp("dataCriacao").defaultNow().notNull(),
  dataAtualizacao: timestamp("dataAtualizacao").defaultNow().onUpdateNow().notNull(),
  observacoes: text("observacoes"),
  empresaId: int("empresaId"),
});

export type Pendencia = typeof pendencias.$inferSelect;
export type InsertPendencia = typeof pendencias.$inferInsert;
