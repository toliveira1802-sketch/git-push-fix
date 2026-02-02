# Mapa de Rotas e Tabelas - Doctor Auto

## ROTAS DO SISTEMA

### Autenticação
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Redirect | Redireciona para /login |
| `/login` | Login.tsx | Login de funcionários |
| `/trocar-senha` | TrocarSenha.tsx | Troca de senha no primeiro acesso |

### Admin (Visão Oficina)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | AdminDashboard.tsx | Dashboard principal com cards resumo |
| `/admin/overview` | AdminDashboardOverview.tsx | Visão geral detalhada |
| `/admin/operacional` | AdminOperacional.tsx | Kanban de OS por status |
| `/admin/ordens-servico` | AdminOrdensServico.tsx | Lista de ordens de serviço |
| `/admin/nova-os` | AdminNovaOS.tsx | Criar nova OS |
| `/admin/os/:id` | AdminOSDetalhes.tsx | Detalhes de uma OS |
| `/admin/patio` | AdminPatio.tsx | Veículos no pátio |
| `/admin/patio/:id` | AdminPatioDetalhes.tsx | Detalhes do veículo no pátio |
| `/admin/agendamentos` | AdminAgendamentos.tsx | Lista de agendamentos |
| `/admin/agenda-mecanicos` | AdminAgendaMecanicos.tsx | Grade de agenda dos mecânicos |
| `/admin/clientes` | AdminClientesPage.tsx | Lista de clientes |
| `/admin/servicos` | AdminServicos.tsx | Catálogo de serviços |
| `/admin/financeiro` | AdminFinanceiro.tsx | Dashboard financeiro |
| `/admin/produtividade` | AdminProdutividade.tsx | Produtividade dos mecânicos |
| `/admin/analytics-mecanicos` | AdminMechanicAnalytics.tsx | Analytics detalhado mecânicos |
| `/admin/feedback-mecanicos` | AdminMechanicFeedback.tsx | Feedbacks dos mecânicos |
| `/admin/documentacao` | AdminDocumentacao.tsx | Documentação do sistema |
| `/admin/configuracoes` | AdminConfiguracoes.tsx | Configurações gerais |
| `/admin/painel-tv` | AdminPainelTV.tsx | Painel para TV da oficina |
| `/admin/pendencias` | AdminPendencias.tsx | Pendências da equipe |

### Gestão (Visão Gerencial)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/gestao` | GestaoDashboards.tsx | Dashboard gestão com 6 módulos |
| `/gestao/rh` | GestaoRH.tsx | Recursos Humanos |
| `/gestao/operacoes` | GestaoOperacoes.tsx | Operações consolidadas |
| `/gestao/financeiro` | GestaoFinanceiro.tsx | Financeiro consolidado |
| `/gestao/tecnologia` | GestaoTecnologia.tsx | Métricas de tecnologia |
| `/gestao/comercial` | GestaoComercial.tsx | Comercial e Marketing |
| `/gestao/melhorias` | GestaoMelhorias.tsx | Sugestões de melhorias |

---

## TABELAS DO BANCO DE DADOS (MySQL)

### 1. users
**Descrição:** Autenticação do sistema (Manus OAuth)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID auto-incremento |
| openId | varchar(64) | ID único do OAuth |
| name | text | Nome do usuário |
| email | varchar(320) | Email |
| loginMethod | varchar(64) | Método de login |
| role | enum(user,admin) | Papel no sistema |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |
| lastSignedIn | timestamp | Último login |

### 2. empresas
**Descrição:** Empresas do grupo (Doctor Auto Prime, Bosch, Garage 347)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| razaoSocial | varchar(255) | Razão social |
| nomeEmpresa | varchar(255) | Nome fantasia |
| cnpj | varchar(20) | CNPJ |
| telefone | varchar(20) | Telefone |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 3. niveis_acesso
**Descrição:** Níveis de acesso/permissões
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| tipoUsuario | varchar(100) | Tipo (Direção, Gestão, Consultor) |
| nivelAcesso | int | Nível numérico |
| permissoes | text | JSON com permissões |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 4. colaboradores
**Descrição:** Funcionários das empresas
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| empresaId | int | FK empresa |
| nome | varchar(255) | Nome completo |
| cargo | varchar(100) | Cargo |
| email | varchar(320) | Email |
| telefone | varchar(20) | Telefone |
| cpf | varchar(14) | CPF |
| senha | varchar(255) | Senha (padrão: 123456) |
| primeiroAcesso | boolean | Se é primeiro acesso |
| nivelAcessoId | int | FK nível de acesso |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 5. mecanicos
**Descrição:** Mecânicos das oficinas
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| empresaId | int | FK empresa |
| nome | varchar(255) | Nome |
| email | varchar(320) | Email |
| telefone | varchar(20) | Telefone |
| cpf | varchar(14) | CPF |
| grauConhecimento | varchar(50) | Nível técnico |
| especialidade | varchar(255) | Especialidades |
| qtdePositivos | int | Feedbacks positivos |
| qtdeNegativos | int | Feedbacks negativos |
| ativo | boolean | Se está ativo |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 6. recursos
**Descrição:** Recursos da oficina (Elevadores, Boxes, Equipamentos)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| empresaId | int | FK empresa |
| nomeRecurso | varchar(255) | Nome (Elevador 1, Box A, etc) |
| ultimaManutencao | date | Data última manutenção |
| horasUtilizadasMes | int | Horas no mês |
| valorProduzidoMes | int | Valor produzido no mês |
| ativo | boolean | Se está ativo |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 7. clientes
**Descrição:** Clientes cadastrados
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| empresaId | int | FK empresa |
| nomeCompleto | varchar(255) | Nome completo |
| cpf | varchar(14) | CPF |
| email | varchar(320) | Email |
| telefone | varchar(20) | Telefone |
| dataNascimento | date | Data nascimento |
| endereco | varchar(500) | Endereço |
| cep | varchar(10) | CEP |
| cidade | varchar(100) | Cidade |
| estado | varchar(2) | UF |
| origemCadastro | varchar(100) | Como chegou |
| senha | varchar(255) | Senha (padrão: 123456) |
| primeiroAcesso | boolean | Se é primeiro acesso |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 8. veiculos
**Descrição:** Veículos dos clientes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| clienteId | int | FK cliente |
| placa | varchar(10) | Placa |
| marca | varchar(100) | Marca |
| modelo | varchar(255) | Modelo |
| versao | varchar(255) | Versão |
| ano | int | Ano |
| combustivel | varchar(50) | Tipo combustível |
| ultimoKm | int | KM anterior |
| kmAtual | int | KM atual |
| origemContato | varchar(100) | Origem do contato |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 9. ordens_servico
**Descrição:** Ordens de serviço (espelho do pátio)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| numeroOs | varchar(20) | Número da OS |
| dataEntrada | timestamp | Data entrada |
| dataSaida | timestamp | Data saída |
| clienteId | int | FK cliente |
| veiculoId | int | FK veículo |
| placa | varchar(10) | Placa |
| km | int | KM na entrada |
| status | varchar(50) | Status atual |
| colaboradorId | int | FK consultor |
| mecanicoId | int | FK mecânico |
| recursoId | int | FK recurso |
| veioDePromocao | boolean | Se veio de promoção |
| motivoVisita | varchar(255) | Motivo da visita |
| totalOrcamento | decimal(10,2) | Valor orçamento |
| valorTotalOs | decimal(10,2) | Valor total OS |
| primeiraVez | boolean | Se é primeira vez |
| observacoes | text | Observações |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 10. ordens_servico_historico
**Descrição:** Histórico de alterações nas OS
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| ordemServicoId | int | FK ordem_servico |
| statusAnterior | varchar(50) | Status anterior |
| statusNovo | varchar(50) | Novo status |
| colaboradorId | int | Quem alterou |
| observacao | text | Observação |
| dataAlteracao | timestamp | Data da alteração |
| createdAt | timestamp | Data criação |

### 11. ordens_servico_itens
**Descrição:** Itens/serviços da OS
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| ordemServicoId | int | FK ordem_servico |
| tipo | varchar(50) | Tipo (Peça, Serviço, MO) |
| descricao | varchar(500) | Descrição |
| quantidade | int | Quantidade |
| valorUnitario | decimal(10,2) | Valor unitário |
| valorTotal | decimal(10,2) | Valor total |
| aprovado | boolean | Se foi aprovado |
| executado | boolean | Se foi executado |
| mecanicoId | int | FK mecânico |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 12. analise_promocoes
**Descrição:** Análise de promoções
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| dataPromocao | date | Data da promoção |
| nomePromocao | varchar(255) | Nome |
| clienteId | int | FK cliente |
| veioPelaPromocao | boolean | Se veio pela promoção |
| clienteRetornou | boolean | Se retornou |
| quantasVezesRetornou | int | Quantidade retornos |
| totalGasto | decimal(10,2) | Total gasto |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 13. lista_status
**Descrição:** Status possíveis das OS
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| status | varchar(100) | Nome do status |
| ordem | int | Ordem no Kanban |
| cor | varchar(20) | Cor do status |
| ativo | boolean | Se está ativo |
| createdAt | timestamp | Data criação |

### 14. agendamentos
**Descrição:** Agendamentos de serviços
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| clienteId | int | FK cliente |
| veiculoId | int | FK veículo |
| dataAgendamento | date | Data do agendamento |
| horaAgendamento | varchar(10) | Hora |
| motivoVisita | varchar(255) | Motivo |
| status | varchar(50) | Status |
| colaboradorId | int | FK consultor |
| observacoes | text | Observações |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 15. faturamento
**Descrição:** Faturamento/Financeiro
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| ordemServicoId | int | FK ordem_servico |
| clienteId | int | FK cliente |
| dataEntrega | date | Data entrega |
| valor | decimal(10,2) | Valor |
| formaPagamento | varchar(100) | Forma pagamento |
| parcelas | int | Número parcelas |
| observacoes | text | Observações |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 16. servicos_catalogo
**Descrição:** Catálogo de serviços
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| nome | varchar(255) | Nome do serviço |
| descricao | text | Descrição |
| tipo | varchar(50) | Tipo |
| valorBase | decimal(10,2) | Valor base |
| tempoEstimado | int | Tempo em minutos |
| ativo | boolean | Se está ativo |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

### 17. pendencias
**Descrição:** Pendências da equipe
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| nomePendencia | varchar(255) | Nome/descrição |
| responsavelId | int | FK colaborador responsável |
| criadorId | int | FK quem criou |
| status | enum | pendente, feita, feita_ressalvas, nao_feita |
| dataCriacao | timestamp | Data criação |
| dataAtualizacao | timestamp | Data atualização |
| observacoes | text | Observações |
| empresaId | int | FK empresa |

### 18. crm
**Descrição:** Dados de relacionamento com cliente
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID |
| clienteId | int | FK cliente |
| marcaCarro | varchar(100) | Marca principal |
| modeloCarro | varchar(255) | Modelo principal |
| tipoServico1 | varchar(100) | Serviço mais usado 1 |
| tipoServico2 | varchar(100) | Serviço mais usado 2 |
| tipoServico3 | varchar(100) | Serviço mais usado 3 |
| ultimaQuilometragem | int | Última KM |
| ultimaPassagem | timestamp | Última visita |
| totalPassagens | int | Total de visitas |
| totalGasto | decimal(10,2) | Total gasto |
| comoConheceu | varchar(255) | Como conheceu |
| nivelFidelidade | varchar(50) | Nível fidelidade |
| pontosFidelidade | int | Pontos |
| cashbackDisponivel | decimal(10,2) | Cashback |
| createdAt | timestamp | Data criação |
| updatedAt | timestamp | Data atualização |

---

## RELACIONAMENTOS

```
empresas (1) ─────────────────────────────────────────────────────────────┐
    │                                                                      │
    ├── colaboradores (N)                                                  │
    │       └── pendencias.responsavelId / criadorId                       │
    │       └── ordens_servico.colaboradorId                               │
    │       └── agendamentos.colaboradorId                                 │
    │                                                                      │
    ├── mecanicos (N)                                                      │
    │       └── ordens_servico.mecanicoId                                  │
    │       └── ordens_servico_itens.mecanicoId                            │
    │                                                                      │
    ├── recursos (N)                                                       │
    │       └── ordens_servico.recursoId                                   │
    │                                                                      │
    └── clientes (N)                                                       │
            │                                                              │
            ├── veiculos (N)                                               │
            │       └── ordens_servico.veiculoId                           │
            │       └── agendamentos.veiculoId                             │
            │                                                              │
            ├── crm (1)                                                    │
            │                                                              │
            ├── ordens_servico (N)                                         │
            │       ├── ordens_servico_itens (N)                           │
            │       ├── ordens_servico_historico (N)                       │
            │       └── faturamento (1)                                    │
            │                                                              │
            ├── agendamentos (N)                                           │
            │                                                              │
            └── analise_promocoes (N)                                      │
```

---

*Documento gerado em: 02/02/2026*
