# Doctor Auto - Resumo do Sistema

## 1. ROTAS DA API (tRPC)

### Auth
| Rota | Método | Descrição |
|------|--------|-----------|
| `auth.me` | Query | Retorna usuário logado |
| `auth.logout` | Mutation | Faz logout |

### Empresas
| Rota | Método | Descrição |
|------|--------|-----------|
| `empresas.list` | Query | Lista todas as empresas |
| `empresas.getById` | Query | Busca empresa por ID |

### Colaboradores
| Rota | Método | Descrição |
|------|--------|-----------|
| `colaboradores.list` | Query | Lista todos os colaboradores |
| `colaboradores.getByEmail` | Query | Busca colaborador por email |
| `colaboradores.getById` | Query | Busca colaborador por ID |
| `colaboradores.getByEmpresa` | Query | Lista colaboradores de uma empresa |
| `colaboradores.trocarSenha` | Mutation | Troca senha do colaborador |

### Mecânicos
| Rota | Método | Descrição |
|------|--------|-----------|
| `mecanicos.list` | Query | Lista todos os mecânicos |
| `mecanicos.getByEmpresa` | Query | Lista mecânicos de uma empresa |

### Recursos
| Rota | Método | Descrição |
|------|--------|-----------|
| `recursos.list` | Query | Lista todos os recursos |
| `recursos.getByEmpresa` | Query | Lista recursos de uma empresa |

### Níveis de Acesso
| Rota | Método | Descrição |
|------|--------|-----------|
| `niveisAcesso.list` | Query | Lista todos os níveis de acesso |

### Clientes
| Rota | Método | Descrição |
|------|--------|-----------|
| `clientes.list` | Query | Lista todos os clientes |
| `clientes.getById` | Query | Busca cliente por ID |

### Veículos
| Rota | Método | Descrição |
|------|--------|-----------|
| `veiculos.list` | Query | Lista todos os veículos |
| `veiculos.getByCliente` | Query | Lista veículos de um cliente |

### Ordens de Serviço
| Rota | Método | Descrição |
|------|--------|-----------|
| `ordensServico.list` | Query | Lista todas as OS |
| `ordensServico.getById` | Query | Busca OS por ID |
| `ordensServico.getByStatus` | Query | Lista OS por status |
| `ordensServico.create` | Mutation | Cria nova OS |
| `ordensServico.updateStatus` | Mutation | Atualiza status da OS |

---

## 2. ROTAS DAS PÁGINAS (Frontend)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | Login | Tela de login |
| `/trocar-senha` | TrocarSenha | Troca de senha obrigatória |
| `/admin` | AdminDashboard | Dashboard principal |
| `/admin/overview` | AdminDashboardOverview | Visão geral |
| `/admin/operacional` | AdminOperacional | Painel operacional |
| `/admin/ordens-servico` | AdminOrdensServico | Lista de OS |
| `/admin/nova-os` | AdminNovaOS | Criar nova OS |
| `/admin/os/:id` | AdminOSDetalhes | Detalhes da OS |
| `/admin/patio` | AdminPatio | Veículos no pátio |
| `/admin/patio/:id` | AdminPatioDetalhes | Detalhes do pátio |
| `/admin/agendamentos` | AdminAgendamentos | Agendamentos |
| `/admin/agenda-mecanicos` | AdminAgendaMecanicos | Agenda dos mecânicos |
| `/admin/clientes` | AdminClientes | Gestão de clientes |
| `/admin/servicos` | AdminServicos | Catálogo de serviços |
| `/admin/financeiro` | AdminFinanceiro | Financeiro |
| `/admin/produtividade` | AdminProdutividade | Produtividade |
| `/admin/analytics-mecanicos` | AdminMechanicAnalytics | Analytics mecânicos |
| `/admin/feedback-mecanicos` | AdminMechanicFeedback | Feedback mecânicos |
| `/admin/documentacao` | AdminDocumentacao | Documentação |
| `/admin/configuracoes` | AdminConfiguracoes | Configurações |
| `/admin/painel-tv` | AdminPainelTV | Painel TV |

---

## 3. TABELAS QUE USAM MOCK (client/src/lib/mockData.ts)

As seguintes tabelas estão usando dados mock no frontend. Você pode modificar os dados no arquivo `mockData.ts`:

### statusList
```json
[
  { "id": 1, "status": "Diagnóstico", "cor": "#3B82F6", "ordem": 1 },
  { "id": 2, "status": "Orçamento", "cor": "#8B5CF6", "ordem": 2 },
  { "id": 3, "status": "Aguardando Aprovação", "cor": "#F59E0B", "ordem": 3 },
  { "id": 4, "status": "Aguardando Peça", "cor": "#EF4444", "ordem": 4 },
  { "id": 5, "status": "Pronto para Iniciar", "cor": "#10B981", "ordem": 5 },
  { "id": 6, "status": "Em Execução", "cor": "#06B6D4", "ordem": 6 },
  { "id": 7, "status": "Pronto", "cor": "#22C55E", "ordem": 7 },
  { "id": 8, "status": "Aguardando Retirada", "cor": "#84CC16", "ordem": 8 },
  { "id": 9, "status": "Entregue", "cor": "#6B7280", "ordem": 9 }
]
```

### empresasMock
```json
[
  { "id": 1, "nomeEmpresa": "Doctor Auto Prime", "razaoSocial": "DOCTOR AUTO PRIME" },
  { "id": 2, "nomeEmpresa": "Doctor Auto Bosch", "razaoSocial": "POMBAL" },
  { "id": 3, "nomeEmpresa": "Garage 347", "razaoSocial": "GARAGEM 1347" }
]
```

### colaboradoresMock
```json
[
  { "id": 1, "nome": "Thalles", "cargo": "Direção", "email": "thalles@doctorauto.com", "empresaId": 1 },
  { "id": 2, "nome": "Sofia", "cargo": "Direção", "email": "sofia@doctorauto.com", "empresaId": 1 },
  { "id": 3, "nome": "Francisco", "cargo": "Gestão", "email": "francisco@doctorauto.com", "empresaId": 1 },
  { "id": 4, "nome": "Márcia", "cargo": "Gestão", "email": "marcia@doctorauto.com", "empresaId": 1 },
  { "id": 5, "nome": "Pedro", "cargo": "Consultor Técnico", "email": "pedro@doctorauto.com", "empresaId": 1 },
  { "id": 6, "nome": "João", "cargo": "Consultor Técnico", "email": "joao@doctorauto.com", "empresaId": 1 },
  { "id": 7, "nome": "Rony", "cargo": "Consultor Técnico", "email": "rony@doctorauto.com", "empresaId": 2 },
  { "id": 8, "nome": "Antônio", "cargo": "Consultor Técnico", "email": "antonio@doctorauto.com", "empresaId": 3 }
]
```

### mecanicosMock
```json
[
  { "id": 1, "nome": "Tadeu", "especialidade": "Motor", "grauConhecimento": "Sênior", "qtdePositivos": 45, "qtdeNegativos": 2, "empresaId": 1 },
  { "id": 2, "nome": "João", "especialidade": "Elétrica", "grauConhecimento": "Pleno", "qtdePositivos": 38, "qtdeNegativos": 3, "empresaId": 1 },
  { "id": 3, "nome": "Pedro", "especialidade": "Suspensão", "grauConhecimento": "Sênior", "qtdePositivos": 52, "qtdeNegativos": 1, "empresaId": 1 },
  { "id": 4, "nome": "Aldo", "especialidade": "Freios", "grauConhecimento": "Pleno", "qtdePositivos": 30, "qtdeNegativos": 4, "empresaId": 1 },
  { "id": 5, "nome": "Samuel", "especialidade": "Câmbio", "grauConhecimento": "Júnior", "qtdePositivos": 20, "qtdeNegativos": 5, "empresaId": 1 },
  { "id": 6, "nome": "Wendel", "especialidade": "Motor", "grauConhecimento": "Pleno", "qtdePositivos": 35, "qtdeNegativos": 2, "empresaId": 2 },
  { "id": 7, "nome": "Alexandre", "especialidade": "Injeção", "grauConhecimento": "Sênior", "qtdePositivos": 48, "qtdeNegativos": 1, "empresaId": 2 },
  { "id": 8, "nome": "Léo", "especialidade": "Elétrica", "grauConhecimento": "Júnior", "qtdePositivos": 15, "qtdeNegativos": 6, "empresaId": 2 },
  { "id": 9, "nome": "Rogério", "especialidade": "Geral", "grauConhecimento": "Pleno", "qtdePositivos": 40, "qtdeNegativos": 3, "empresaId": 3 },
  { "id": 10, "nome": "Matheus", "especialidade": "Motor", "grauConhecimento": "Júnior", "qtdePositivos": 18, "qtdeNegativos": 4, "empresaId": 3 },
  { "id": 11, "nome": "Gabriel", "especialidade": "Suspensão", "grauConhecimento": "Pleno", "qtdePositivos": 32, "qtdeNegativos": 2, "empresaId": 3 },
  { "id": 12, "nome": "Alessandro", "especialidade": "Diagnóstico", "grauConhecimento": "Sênior", "qtdePositivos": 55, "qtdeNegativos": 0, "empresaId": 1 }
]
```

### recursosMock
```json
[
  { "id": 1, "nomeRecurso": "Elevador 1", "empresaId": 1, "ocupado": true, "osId": 1 },
  { "id": 2, "nomeRecurso": "Elevador 2", "empresaId": 1, "ocupado": false, "osId": null },
  { "id": 3, "nomeRecurso": "Elevador 3", "empresaId": 1, "ocupado": true, "osId": 2 },
  { "id": 4, "nomeRecurso": "Elevador 4", "empresaId": 1, "ocupado": false, "osId": null },
  { "id": 5, "nomeRecurso": "Elevador 5", "empresaId": 1, "ocupado": true, "osId": 3 },
  { "id": 6, "nomeRecurso": "Elevador 6", "empresaId": 2, "ocupado": false, "osId": null },
  { "id": 7, "nomeRecurso": "Elevador 7", "empresaId": 2, "ocupado": true, "osId": 4 },
  { "id": 8, "nomeRecurso": "Elevador 8", "empresaId": 3, "ocupado": false, "osId": null },
  { "id": 9, "nomeRecurso": "Elevador 9", "empresaId": 3, "ocupado": false, "osId": null },
  { "id": 10, "nomeRecurso": "Box 1", "empresaId": 1, "ocupado": true, "osId": 5 },
  { "id": 11, "nomeRecurso": "Box 2", "empresaId": 1, "ocupado": false, "osId": null },
  { "id": 12, "nomeRecurso": "Box 3", "empresaId": 2, "ocupado": false, "osId": null },
  { "id": 13, "nomeRecurso": "Box 4", "empresaId": 2, "ocupado": true, "osId": 6 },
  { "id": 14, "nomeRecurso": "Box 5", "empresaId": 3, "ocupado": false, "osId": null },
  { "id": 15, "nomeRecurso": "Rampa", "empresaId": 1, "ocupado": false, "osId": null },
  { "id": 16, "nomeRecurso": "Dinamômetro", "empresaId": 1, "ocupado": false, "osId": null },
  { "id": 17, "nomeRecurso": "VCDS", "empresaId": 1, "ocupado": true, "osId": 7 },
  { "id": 18, "nomeRecurso": "Remap", "empresaId": 1, "ocupado": false, "osId": null },
  { "id": 19, "nomeRecurso": "Vagas Extras", "empresaId": 1, "ocupado": false, "osId": null }
]
```

### clientesMock
```json
[
  { "id": 7230, "nomeCompleto": "NELSON VOLPATO", "cpf": "300.650.118-72", "email": "nelson@doctor.com", "telefone": "(11) 97151-7535", "endereco": "RUA JOAO DELLA MANNA", "cep": "05535-010", "cidade": "ROLINOPOLIS", "estado": "SP" },
  { "id": 7231, "nomeCompleto": "MARIA SILVA", "cpf": "123.456.789-00", "email": "maria@email.com", "telefone": "(11) 98765-4321", "endereco": "AV PAULISTA 1000", "cep": "01310-100", "cidade": "SÃO PAULO", "estado": "SP" },
  { "id": 7232, "nomeCompleto": "CARLOS SANTOS", "cpf": "987.654.321-00", "email": "carlos@email.com", "telefone": "(11) 91234-5678", "endereco": "RUA AUGUSTA 500", "cep": "01305-000", "cidade": "SÃO PAULO", "estado": "SP" }
]
```

### veiculosMock
```json
[
  { "id": 1, "clienteId": 7230, "placa": "ERR1B44", "marca": "VW", "modelo": "I/VW PASSAT CC 3.6 FSI", "versao": "FSI", "ano": 2011, "combustivel": "Gasolina", "kmAtual": 125000 },
  { "id": 2, "clienteId": 7230, "placa": "ERR4E88", "marca": "VW", "modelo": "PASSAT 2.0T FSI", "versao": "I/VW PASSAT 2.0T FSI", "ano": 2011, "combustivel": "Gasolina", "kmAtual": 98000 },
  { "id": 3, "clienteId": 7231, "placa": "ABC1D23", "marca": "BMW", "modelo": "320i", "versao": "Sport", "ano": 2020, "combustivel": "Gasolina", "kmAtual": 45000 },
  { "id": 4, "clienteId": 7232, "placa": "XYZ9K87", "marca": "Mercedes", "modelo": "C180", "versao": "Avantgarde", "ano": 2019, "combustivel": "Gasolina", "kmAtual": 62000 }
]
```

### ordensServicoMock
```json
[
  { "id": 1, "numeroOs": "OS-2026-001", "clienteId": 7230, "veiculoId": 1, "placa": "ERR1B44", "cliente": "NELSON VOLPATO", "veiculo": "VW PASSAT CC 3.6 FSI", "status": "Em Execução", "statusId": 6, "mecanicoId": 1, "mecanico": "Tadeu", "recursoId": 1, "recurso": "Elevador 1", "dataEntrada": "2026-01-28", "motivoVisita": "Revisão completa", "totalOrcamento": 2500.00, "valorTotalOs": 2500.00, "km": 125000 },
  { "id": 2, "numeroOs": "OS-2026-002", "clienteId": 7231, "veiculoId": 3, "placa": "ABC1D23", "cliente": "MARIA SILVA", "veiculo": "BMW 320i", "status": "Diagnóstico", "statusId": 1, "mecanicoId": 12, "mecanico": "Alessandro", "recursoId": 3, "recurso": "Elevador 3", "dataEntrada": "2026-01-30", "motivoVisita": "Barulho na suspensão", "totalOrcamento": 0, "valorTotalOs": 0, "km": 45000 },
  { "id": 3, "numeroOs": "OS-2026-003", "clienteId": 7232, "veiculoId": 4, "placa": "XYZ9K87", "cliente": "CARLOS SANTOS", "veiculo": "Mercedes C180", "status": "Aguardando Aprovação", "statusId": 3, "mecanicoId": 3, "mecanico": "Pedro", "recursoId": 5, "recurso": "Elevador 5", "dataEntrada": "2026-01-29", "motivoVisita": "Troca de pastilhas", "totalOrcamento": 1800.00, "valorTotalOs": 0, "km": 62000 },
  { "id": 4, "numeroOs": "OS-2026-004", "clienteId": 7230, "veiculoId": 2, "placa": "ERR4E88", "cliente": "NELSON VOLPATO", "veiculo": "VW PASSAT 2.0T FSI", "status": "Aguardando Peça", "statusId": 4, "mecanicoId": 7, "mecanico": "Alexandre", "recursoId": 7, "recurso": "Elevador 7", "dataEntrada": "2026-01-27", "motivoVisita": "Troca de correia dentada", "totalOrcamento": 3200.00, "valorTotalOs": 3200.00, "km": 98000 },
  { "id": 5, "numeroOs": "OS-2026-005", "clienteId": 7231, "veiculoId": 3, "placa": "ABC1D23", "cliente": "MARIA SILVA", "veiculo": "BMW 320i", "status": "Pronto", "statusId": 7, "mecanicoId": 2, "mecanico": "João", "recursoId": 10, "recurso": "Box 1", "dataEntrada": "2026-01-25", "motivoVisita": "Troca de óleo", "totalOrcamento": 450.00, "valorTotalOs": 450.00, "km": 44500 },
  { "id": 6, "numeroOs": "OS-2026-006", "clienteId": 7232, "veiculoId": 4, "placa": "XYZ9K87", "cliente": "CARLOS SANTOS", "veiculo": "Mercedes C180", "status": "Orçamento", "statusId": 2, "mecanicoId": 9, "mecanico": "Rogério", "recursoId": 13, "recurso": "Box 4", "dataEntrada": "2026-01-31", "motivoVisita": "Diagnóstico de motor", "totalOrcamento": 0, "valorTotalOs": 0, "km": 62500 },
  { "id": 7, "numeroOs": "OS-2026-007", "clienteId": 7230, "veiculoId": 1, "placa": "ERR1B44", "cliente": "NELSON VOLPATO", "veiculo": "VW PASSAT CC 3.6 FSI", "status": "Pronto para Iniciar", "statusId": 5, "mecanicoId": 4, "mecanico": "Aldo", "recursoId": 17, "recurso": "VCDS", "dataEntrada": "2026-02-01", "motivoVisita": "Reprogramação de módulo", "totalOrcamento": 800.00, "valorTotalOs": 800.00, "km": 125100 }
]
```

### agendamentosMock
```json
[
  { "id": 1, "clienteId": 7230, "cliente": "NELSON VOLPATO", "veiculoId": 1, "placa": "ERR1B44", "dataAgendamento": "2026-02-03", "horaAgendamento": "08:00", "motivoVisita": "Revisão 130.000km", "status": "agendado" },
  { "id": 2, "clienteId": 7231, "cliente": "MARIA SILVA", "veiculoId": 3, "placa": "ABC1D23", "dataAgendamento": "2026-02-03", "horaAgendamento": "10:00", "motivoVisita": "Alinhamento", "status": "agendado" },
  { "id": 3, "clienteId": 7232, "cliente": "CARLOS SANTOS", "veiculoId": 4, "placa": "XYZ9K87", "dataAgendamento": "2026-02-04", "horaAgendamento": "09:00", "motivoVisita": "Troca de pneus", "status": "agendado" },
  { "id": 4, "clienteId": 7230, "cliente": "NELSON VOLPATO", "veiculoId": 2, "placa": "ERR4E88", "dataAgendamento": "2026-02-05", "horaAgendamento": "14:00", "motivoVisita": "Diagnóstico elétrico", "status": "agendado" }
]
```

### servicosCatalogoMock
```json
[
  { "id": 1, "nome": "Troca de Óleo", "tipo": "Serviço", "valorBase": 150.00, "tempoEstimado": 30 },
  { "id": 2, "nome": "Alinhamento e Balanceamento", "tipo": "Serviço", "valorBase": 180.00, "tempoEstimado": 45 },
  { "id": 3, "nome": "Troca de Pastilhas de Freio", "tipo": "Serviço", "valorBase": 250.00, "tempoEstimado": 60 },
  { "id": 4, "nome": "Revisão Completa", "tipo": "Serviço", "valorBase": 800.00, "tempoEstimado": 180 },
  { "id": 5, "nome": "Diagnóstico Eletrônico", "tipo": "Diagnóstico", "valorBase": 200.00, "tempoEstimado": 60 },
  { "id": 6, "nome": "Troca de Correia Dentada", "tipo": "Serviço", "valorBase": 1200.00, "tempoEstimado": 240 },
  { "id": 7, "nome": "Reprogramação de Módulo", "tipo": "Serviço", "valorBase": 500.00, "tempoEstimado": 90 },
  { "id": 8, "nome": "Mão de Obra Hora", "tipo": "Mão de Obra", "valorBase": 120.00, "tempoEstimado": 60 }
]
```

---

## 4. MAPA DE COLUNAS - ONDE CADA COLUNA É USADA

### Tabela: empresas
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| razaoSocial | varchar(255) | AdminConfiguracoes |
| nomeEmpresa | varchar(255) | AdminDashboard (seletor), AdminDashboardOverview, AdminConfiguracoes |
| cnpj | varchar(20) | AdminConfiguracoes |
| telefone | varchar(20) | AdminConfiguracoes |

### Tabela: colaboradores
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| empresaId | int | AdminDashboard (filtro por empresa) |
| nome | varchar(255) | AdminDashboard (pendências), AdminAgendaMecanicos, Login |
| cargo | varchar(100) | AdminDashboard (pendências), AdminConfiguracoes |
| email | varchar(320) | Login (autenticação) |
| telefone | varchar(20) | AdminConfiguracoes |
| cpf | varchar(14) | AdminConfiguracoes |
| senha | varchar(255) | Login (autenticação), TrocarSenha |
| primeiroAcesso | boolean | Login (redireciona para TrocarSenha) |
| nivelAcessoId | int | Controle de permissões em todas as telas |

### Tabela: mecanicos
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| empresaId | int | Filtro por empresa |
| nome | varchar(255) | AdminAgendaMecanicos, AdminOperacional, AdminProdutividade, AdminMechanicAnalytics, AdminPainelTV |
| email | varchar(320) | AdminConfiguracoes |
| telefone | varchar(20) | AdminConfiguracoes |
| cpf | varchar(14) | AdminConfiguracoes |
| grauConhecimento | varchar(50) | AdminMechanicAnalytics, AdminProdutividade |
| especialidade | varchar(255) | AdminAgendaMecanicos, AdminMechanicAnalytics |
| qtdePositivos | int | AdminMechanicFeedback, AdminMechanicAnalytics |
| qtdeNegativos | int | AdminMechanicFeedback, AdminMechanicAnalytics |
| ativo | boolean | Filtro de mecânicos ativos |

### Tabela: recursos
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| empresaId | int | Filtro por empresa |
| nomeRecurso | varchar(255) | AdminOperacional (mapa), AdminPatio, AdminProdutividade |
| ultimaManutencao | date | AdminConfiguracoes |
| horasUtilizadasMes | int | AdminProdutividade |
| valorProduzidoMes | int | AdminProdutividade, AdminFinanceiro |
| ativo | boolean | Filtro de recursos ativos |

### Tabela: clientes
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| empresaId | int | Filtro por empresa |
| nomeCompleto | varchar(255) | AdminClientes, AdminNovaOS, AdminOrdensServico, AdminOSDetalhes, AdminPatio |
| cpf | varchar(14) | AdminClientes (busca), AdminNovaOS |
| email | varchar(320) | AdminClientes, Visão Cliente (login) |
| telefone | varchar(20) | AdminClientes, AdminOSDetalhes |
| dataNascimento | date | AdminClientes |
| endereco | varchar(500) | AdminClientes |
| cep | varchar(10) | AdminClientes |
| cidade | varchar(100) | AdminClientes |
| estado | varchar(2) | AdminClientes |
| origemCadastro | varchar(100) | AdminClientes, Relatórios |
| senha | varchar(255) | Visão Cliente (login) |
| primeiroAcesso | boolean | Visão Cliente |

### Tabela: veiculos
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| clienteId | int | AdminClientes (lista veículos do cliente) |
| placa | varchar(10) | AdminClientes, AdminNovaOS, AdminOrdensServico, AdminPatio, AdminAgendamentos |
| marca | varchar(100) | AdminClientes, AdminNovaOS, AdminOrdensServico |
| modelo | varchar(255) | AdminClientes, AdminNovaOS, AdminOrdensServico, AdminPatio |
| versao | varchar(255) | AdminClientes, AdminOSDetalhes |
| ano | int | AdminClientes, AdminNovaOS, AdminOrdensServico |
| combustivel | varchar(50) | AdminClientes, AdminOSDetalhes |
| ultimoKm | int | AdminClientes |
| kmAtual | int | AdminClientes, AdminNovaOS, AdminOSDetalhes |
| origemContato | varchar(100) | Relatórios |

### Tabela: ordens_servico
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | Todas (FK) |
| numeroOs | varchar(20) | AdminOrdensServico, AdminOSDetalhes, AdminPatio, AdminPainelTV |
| dataEntrada | timestamp | AdminOrdensServico, AdminOSDetalhes, AdminOperacional, AdminFinanceiro |
| dataSaida | timestamp | AdminOSDetalhes, AdminFinanceiro |
| clienteId | int | Relacionamento com cliente |
| veiculoId | int | Relacionamento com veículo |
| placa | varchar(10) | AdminOrdensServico, AdminPatio, AdminPainelTV |
| km | int | AdminOSDetalhes |
| status | varchar(50) | AdminOperacional (Kanban), AdminOrdensServico, AdminPatio, AdminDashboard |
| colaboradorId | int | AdminOSDetalhes (consultor responsável) |
| mecanicoId | int | AdminOperacional, AdminAgendaMecanicos, AdminPainelTV |
| recursoId | int | AdminOperacional (mapa), AdminPatio |
| veioDePromocao | boolean | Relatórios |
| motivoVisita | varchar(255) | AdminOSDetalhes, AdminPatio |
| totalOrcamento | decimal | AdminOSDetalhes, AdminFinanceiro |
| valorTotalOs | decimal | AdminOSDetalhes, AdminFinanceiro, AdminDashboard |
| primeiraVez | boolean | Relatórios |
| observacoes | text | AdminOSDetalhes |

### Tabela: agendamentos
| Coluna | Tipo | Telas que Usam |
|--------|------|----------------|
| id | int | PK |
| clienteId | int | AdminAgendamentos |
| veiculoId | int | AdminAgendamentos |
| colaboradorId | int | AdminAgendamentos |
| dataAgendamento | date | AdminAgendamentos, AdminDashboard (agenda) |
| horaAgendamento | time | AdminAgendamentos, AdminDashboard (agenda) |
| motivoVisita | varchar(255) | AdminAgendamentos |
| status | varchar(50) | AdminAgendamentos |
| origem | varchar(100) | AdminAgendamentos (App, Kommo, Manual) |
| observacoes | text | AdminAgendamentos |

---

## 5. DIAGRAMA DE RELACIONAMENTOS

```
empresas (1) ──────┬──── (N) colaboradores
                   ├──── (N) mecanicos
                   ├──── (N) recursos
                   └──── (N) clientes

clientes (1) ──────┬──── (N) veiculos
                   ├──── (N) ordens_servico
                   ├──── (N) agendamentos
                   └──── (1) crm

ordens_servico (1) ┬──── (N) ordens_servico_itens
                   ├──── (N) ordens_servico_historico
                   ├──── (1) colaborador (consultor)
                   ├──── (1) mecanico
                   └──── (1) recurso

veiculos (1) ──────┴──── (N) ordens_servico
```

---

## 6. ARQUIVOS IMPORTANTES

| Arquivo | Descrição |
|---------|-----------|
| `client/src/lib/mockData.ts` | Dados mock do frontend |
| `drizzle/schema.ts` | Schema do banco de dados |
| `server/db.ts` | Queries do banco |
| `server/routers.ts` | Rotas da API tRPC |
| `client/src/App.tsx` | Rotas do frontend |
