// =====================================================
// DADOS MOCK PARA O DOCTOR AUTO
// Estes dados serão substituídos por dados reais do banco
// =====================================================

// Status das OS
export const statusList = [
  { id: 1, status: "Diagnóstico", cor: "#3B82F6", ordem: 1 },
  { id: 2, status: "Orçamento", cor: "#8B5CF6", ordem: 2 },
  { id: 3, status: "Aguardando Aprovação", cor: "#F59E0B", ordem: 3 },
  { id: 4, status: "Aguardando Peça", cor: "#EF4444", ordem: 4 },
  { id: 5, status: "Pronto para Iniciar", cor: "#10B981", ordem: 5 },
  { id: 6, status: "Em Execução", cor: "#06B6D4", ordem: 6 },
  { id: 7, status: "Pronto", cor: "#22C55E", ordem: 7 },
  { id: 8, status: "Aguardando Retirada", cor: "#84CC16", ordem: 8 },
  { id: 9, status: "Entregue", cor: "#6B7280", ordem: 9 },
];

// Empresas
export const empresasMock = [
  { id: 1, nomeEmpresa: "Doctor Auto Prime", razaoSocial: "DOCTOR AUTO PRIME", cnpj: "", telefone: "" },
  { id: 2, nomeEmpresa: "Doctor Auto Bosch", razaoSocial: "POMBAL", cnpj: "", telefone: "" },
  { id: 3, nomeEmpresa: "Garage 347", razaoSocial: "GARAGEM 1347", cnpj: "", telefone: "" },
];

// Colaboradores
export const colaboradoresMock = [
  { id: 1, nome: "Thales", cargo: "Direção", email: "thales@doctorauto.com", empresaId: 1 },
  { id: 2, nome: "Sofia", cargo: "Direção", email: "sofia@doctorauto.com", empresaId: 1 },
  { id: 3, nome: "Francisco", cargo: "Gestão", email: "francisco@doctorauto.com", empresaId: 1 },
  { id: 4, nome: "Márcia", cargo: "Gestão", email: "marcia@doctorauto.com", empresaId: 1 },
  { id: 5, nome: "Pedro", cargo: "Consultor Técnico", email: "pedro@doctorauto.com", empresaId: 1 },
  { id: 6, nome: "João", cargo: "Consultor Técnico", email: "joao@doctorauto.com", empresaId: 1 },
  { id: 7, nome: "Rony", cargo: "Consultor Técnico", email: "rony@doctorauto.com", empresaId: 2 },
  { id: 8, nome: "Antônio", cargo: "Consultor Técnico", email: "antonio@doctorauto.com", empresaId: 3 },
];

// Mecânicos
export const mecanicosMock = [
  { id: 1, nome: "Tadeu", especialidade: "Motor", grauConhecimento: "Sênior", qtdePositivos: 45, qtdeNegativos: 2, empresaId: 1 },
  { id: 2, nome: "João", especialidade: "Elétrica", grauConhecimento: "Pleno", qtdePositivos: 38, qtdeNegativos: 3, empresaId: 1 },
  { id: 3, nome: "Pedro", especialidade: "Suspensão", grauConhecimento: "Sênior", qtdePositivos: 52, qtdeNegativos: 1, empresaId: 1 },
  { id: 4, nome: "Aldo", especialidade: "Freios", grauConhecimento: "Pleno", qtdePositivos: 30, qtdeNegativos: 4, empresaId: 1 },
  { id: 5, nome: "Samuel", especialidade: "Câmbio", grauConhecimento: "Júnior", qtdePositivos: 20, qtdeNegativos: 5, empresaId: 1 },
  { id: 6, nome: "Wendel", especialidade: "Motor", grauConhecimento: "Pleno", qtdePositivos: 35, qtdeNegativos: 2, empresaId: 2 },
  { id: 7, nome: "Alexandre", especialidade: "Injeção", grauConhecimento: "Sênior", qtdePositivos: 48, qtdeNegativos: 1, empresaId: 2 },
  { id: 8, nome: "Léo", especialidade: "Elétrica", grauConhecimento: "Júnior", qtdePositivos: 15, qtdeNegativos: 6, empresaId: 2 },
  { id: 9, nome: "Rogério", especialidade: "Geral", grauConhecimento: "Pleno", qtdePositivos: 40, qtdeNegativos: 3, empresaId: 3 },
  { id: 10, nome: "Matheus", especialidade: "Motor", grauConhecimento: "Júnior", qtdePositivos: 18, qtdeNegativos: 4, empresaId: 3 },
  { id: 11, nome: "Gabriel", especialidade: "Suspensão", grauConhecimento: "Pleno", qtdePositivos: 32, qtdeNegativos: 2, empresaId: 3 },
  { id: 12, nome: "Alessandro", especialidade: "Diagnóstico", grauConhecimento: "Sênior", qtdePositivos: 55, qtdeNegativos: 0, empresaId: 1 },
];

// Recursos
export const recursosMock = [
  { id: 1, nomeRecurso: "Elevador 1", empresaId: 1, ocupado: true, osId: 1 },
  { id: 2, nomeRecurso: "Elevador 2", empresaId: 1, ocupado: false, osId: null },
  { id: 3, nomeRecurso: "Elevador 3", empresaId: 1, ocupado: true, osId: 2 },
  { id: 4, nomeRecurso: "Elevador 4", empresaId: 1, ocupado: false, osId: null },
  { id: 5, nomeRecurso: "Elevador 5", empresaId: 1, ocupado: true, osId: 3 },
  { id: 6, nomeRecurso: "Elevador 6", empresaId: 2, ocupado: false, osId: null },
  { id: 7, nomeRecurso: "Elevador 7", empresaId: 2, ocupado: true, osId: 4 },
  { id: 8, nomeRecurso: "Elevador 8", empresaId: 3, ocupado: false, osId: null },
  { id: 9, nomeRecurso: "Elevador 9", empresaId: 3, ocupado: false, osId: null },
  { id: 10, nomeRecurso: "Box 1", empresaId: 1, ocupado: true, osId: 5 },
  { id: 11, nomeRecurso: "Box 2", empresaId: 1, ocupado: false, osId: null },
  { id: 12, nomeRecurso: "Box 3", empresaId: 2, ocupado: false, osId: null },
  { id: 13, nomeRecurso: "Box 4", empresaId: 2, ocupado: true, osId: 6 },
  { id: 14, nomeRecurso: "Box 5", empresaId: 3, ocupado: false, osId: null },
  { id: 15, nomeRecurso: "Rampa", empresaId: 1, ocupado: false, osId: null },
  { id: 16, nomeRecurso: "Dinamômetro", empresaId: 1, ocupado: false, osId: null },
  { id: 17, nomeRecurso: "VCDS", empresaId: 1, ocupado: true, osId: 7 },
  { id: 18, nomeRecurso: "Remap", empresaId: 1, ocupado: false, osId: null },
  { id: 19, nomeRecurso: "Vagas Extras", empresaId: 1, ocupado: false, osId: null },
];

// Clientes
export const clientesMock = [
  { id: 7230, nomeCompleto: "NELSON VOLPATO", cpf: "300.650.118-72", email: "nelson@doctor.com", telefone: "(11) 97151-7535", endereco: "RUA JOAO DELLA MANNA", cep: "05535-010", cidade: "ROLINOPOLIS", estado: "SP" },
  { id: 7231, nomeCompleto: "MARIA SILVA", cpf: "123.456.789-00", email: "maria@email.com", telefone: "(11) 98765-4321", endereco: "AV PAULISTA 1000", cep: "01310-100", cidade: "SÃO PAULO", estado: "SP" },
  { id: 7232, nomeCompleto: "CARLOS SANTOS", cpf: "987.654.321-00", email: "carlos@email.com", telefone: "(11) 91234-5678", endereco: "RUA AUGUSTA 500", cep: "01305-000", cidade: "SÃO PAULO", estado: "SP" },
];

// Veículos
export const veiculosMock = [
  { id: 1, clienteId: 7230, placa: "ERR1B44", marca: "VW", modelo: "I/VW PASSAT CC 3.6 FSI", versao: "FSI", ano: 2011, combustivel: "Gasolina", kmAtual: 125000 },
  { id: 2, clienteId: 7230, placa: "ERR4E88", marca: "VW", modelo: "PASSAT 2.0T FSI", versao: "I/VW PASSAT 2.0T FSI", ano: 2011, combustivel: "Gasolina", kmAtual: 98000 },
  { id: 3, clienteId: 7231, placa: "ABC1D23", marca: "BMW", modelo: "320i", versao: "Sport", ano: 2020, combustivel: "Gasolina", kmAtual: 45000 },
  { id: 4, clienteId: 7232, placa: "XYZ9K87", marca: "Mercedes", modelo: "C180", versao: "Avantgarde", ano: 2019, combustivel: "Gasolina", kmAtual: 62000 },
];

// Ordens de Serviço
export const ordensServicoMock = [
  { 
    id: 1, 
    numeroOs: "OS-2026-001", 
    clienteId: 7230, 
    veiculoId: 1, 
    placa: "ERR1B44",
    cliente: "NELSON VOLPATO",
    veiculo: "VW PASSAT CC 3.6 FSI",
    status: "Em Execução",
    statusId: 6,
    mecanicoId: 1,
    mecanico: "Tadeu",
    recursoId: 1,
    recurso: "Elevador 1",
    dataEntrada: new Date("2026-01-28"),
    motivoVisita: "Revisão completa",
    totalOrcamento: 2500.00,
    valorTotalOs: 2500.00,
    km: 125000,
  },
  { 
    id: 2, 
    numeroOs: "OS-2026-002", 
    clienteId: 7231, 
    veiculoId: 3, 
    placa: "ABC1D23",
    cliente: "MARIA SILVA",
    veiculo: "BMW 320i",
    status: "Diagnóstico",
    statusId: 1,
    mecanicoId: 12,
    mecanico: "Alessandro",
    recursoId: 3,
    recurso: "Elevador 3",
    dataEntrada: new Date("2026-01-30"),
    motivoVisita: "Barulho na suspensão",
    totalOrcamento: 0,
    valorTotalOs: 0,
    km: 45000,
  },
  { 
    id: 3, 
    numeroOs: "OS-2026-003", 
    clienteId: 7232, 
    veiculoId: 4, 
    placa: "XYZ9K87",
    cliente: "CARLOS SANTOS",
    veiculo: "Mercedes C180",
    status: "Aguardando Aprovação",
    statusId: 3,
    mecanicoId: 3,
    mecanico: "Pedro",
    recursoId: 5,
    recurso: "Elevador 5",
    dataEntrada: new Date("2026-01-29"),
    motivoVisita: "Troca de pastilhas",
    totalOrcamento: 1800.00,
    valorTotalOs: 0,
    km: 62000,
  },
  { 
    id: 4, 
    numeroOs: "OS-2026-004", 
    clienteId: 7230, 
    veiculoId: 2, 
    placa: "ERR4E88",
    cliente: "NELSON VOLPATO",
    veiculo: "VW PASSAT 2.0T FSI",
    status: "Aguardando Peça",
    statusId: 4,
    mecanicoId: 7,
    mecanico: "Alexandre",
    recursoId: 7,
    recurso: "Elevador 7",
    dataEntrada: new Date("2026-01-27"),
    motivoVisita: "Troca de correia dentada",
    totalOrcamento: 3200.00,
    valorTotalOs: 3200.00,
    km: 98000,
  },
  { 
    id: 5, 
    numeroOs: "OS-2026-005", 
    clienteId: 7231, 
    veiculoId: 3, 
    placa: "ABC1D23",
    cliente: "MARIA SILVA",
    veiculo: "BMW 320i",
    status: "Pronto",
    statusId: 7,
    mecanicoId: 2,
    mecanico: "João",
    recursoId: 10,
    recurso: "Box 1",
    dataEntrada: new Date("2026-01-25"),
    motivoVisita: "Troca de óleo",
    totalOrcamento: 450.00,
    valorTotalOs: 450.00,
    km: 44500,
  },
  { 
    id: 6, 
    numeroOs: "OS-2026-006", 
    clienteId: 7232, 
    veiculoId: 4, 
    placa: "XYZ9K87",
    cliente: "CARLOS SANTOS",
    veiculo: "Mercedes C180",
    status: "Orçamento",
    statusId: 2,
    mecanicoId: 9,
    mecanico: "Rogério",
    recursoId: 13,
    recurso: "Box 4",
    dataEntrada: new Date("2026-01-31"),
    motivoVisita: "Diagnóstico de motor",
    totalOrcamento: 0,
    valorTotalOs: 0,
    km: 62500,
  },
  { 
    id: 7, 
    numeroOs: "OS-2026-007", 
    clienteId: 7230, 
    veiculoId: 1, 
    placa: "ERR1B44",
    cliente: "NELSON VOLPATO",
    veiculo: "VW PASSAT CC 3.6 FSI",
    status: "Pronto para Iniciar",
    statusId: 5,
    mecanicoId: 4,
    mecanico: "Aldo",
    recursoId: 17,
    recurso: "VCDS",
    dataEntrada: new Date("2026-02-01"),
    motivoVisita: "Reprogramação de módulo",
    totalOrcamento: 800.00,
    valorTotalOs: 800.00,
    km: 125100,
  },
];

// Agendamentos
export const agendamentosMock = [
  { id: 1, clienteId: 7230, cliente: "NELSON VOLPATO", veiculoId: 1, placa: "ERR1B44", dataAgendamento: "2026-02-03", horaAgendamento: "08:00", motivoVisita: "Revisão 130.000km", status: "agendado" },
  { id: 2, clienteId: 7231, cliente: "MARIA SILVA", veiculoId: 3, placa: "ABC1D23", dataAgendamento: "2026-02-03", horaAgendamento: "10:00", motivoVisita: "Alinhamento", status: "agendado" },
  { id: 3, clienteId: 7232, cliente: "CARLOS SANTOS", veiculoId: 4, placa: "XYZ9K87", dataAgendamento: "2026-02-04", horaAgendamento: "09:00", motivoVisita: "Troca de pneus", status: "agendado" },
  { id: 4, clienteId: 7230, cliente: "NELSON VOLPATO", veiculoId: 2, placa: "ERR4E88", dataAgendamento: "2026-02-05", horaAgendamento: "14:00", motivoVisita: "Diagnóstico elétrico", status: "agendado" },
];

// Serviços do catálogo
export const servicosCatalogoMock = [
  { id: 1, nome: "Troca de Óleo", tipo: "Serviço", valorBase: 150.00, tempoEstimado: 30 },
  { id: 2, nome: "Alinhamento e Balanceamento", tipo: "Serviço", valorBase: 180.00, tempoEstimado: 45 },
  { id: 3, nome: "Troca de Pastilhas de Freio", tipo: "Serviço", valorBase: 250.00, tempoEstimado: 60 },
  { id: 4, nome: "Revisão Completa", tipo: "Serviço", valorBase: 800.00, tempoEstimado: 180 },
  { id: 5, nome: "Diagnóstico Eletrônico", tipo: "Diagnóstico", valorBase: 200.00, tempoEstimado: 60 },
  { id: 6, nome: "Troca de Correia Dentada", tipo: "Serviço", valorBase: 1200.00, tempoEstimado: 240 },
  { id: 7, nome: "Reprogramação de Módulo", tipo: "Serviço", valorBase: 500.00, tempoEstimado: 90 },
  { id: 8, nome: "Mão de Obra Hora", tipo: "Mão de Obra", valorBase: 120.00, tempoEstimado: 60 },
];

// Faturamento
export const faturamentoMock = [
  { id: 1, ordemServicoId: 5, clienteId: 7231, dataEntrega: "2026-01-26", valor: 450.00, formaPagamento: "Cartão de Crédito", parcelas: 1 },
  { id: 2, ordemServicoId: 1, clienteId: 7230, dataEntrega: null, valor: 2500.00, formaPagamento: null, parcelas: 1 },
];

// Estatísticas do Dashboard
export const dashboardStatsMock = {
  osAbertas: 6,
  osEmExecucao: 2,
  osConcluidas: 1,
  osAguardandoPeca: 1,
  osAguardandoAprovacao: 1,
  faturamentoMes: 8200.00,
  faturamentoSemana: 2950.00,
  ticketMedio: 1366.67,
  clientesAtendidos: 3,
  veiculosAtendidos: 4,
  agendamentosHoje: 2,
  agendamentosSemana: 4,
};

// Metas de produtividade
export const metasProdutividadeMock = [
  { mecanicoId: 1, mecanico: "Tadeu", metaHoras: 160, horasRealizadas: 145, metaValor: 25000, valorRealizado: 22500 },
  { mecanicoId: 2, mecanico: "João", metaHoras: 160, horasRealizadas: 138, metaValor: 20000, valorRealizado: 18200 },
  { mecanicoId: 3, mecanico: "Pedro", metaHoras: 160, horasRealizadas: 155, metaValor: 25000, valorRealizado: 24800 },
  { mecanicoId: 12, mecanico: "Alessandro", metaHoras: 160, horasRealizadas: 160, metaValor: 30000, valorRealizado: 31500 },
];

// Funções auxiliares
export function getClienteById(id: number) {
  return clientesMock.find(c => c.id === id);
}

export function getVeiculosByClienteId(clienteId: number) {
  return veiculosMock.filter(v => v.clienteId === clienteId);
}

export function getMecanicoById(id: number) {
  return mecanicosMock.find(m => m.id === id);
}

export function getRecursoById(id: number) {
  return recursosMock.find(r => r.id === id);
}

export function getOsByStatus(statusId: number) {
  return ordensServicoMock.filter(os => os.statusId === statusId);
}

export function getOsByMecanico(mecanicoId: number) {
  return ordensServicoMock.filter(os => os.mecanicoId === mecanicoId);
}

export function getStatusById(id: number) {
  return statusList.find(s => s.id === id);
}
