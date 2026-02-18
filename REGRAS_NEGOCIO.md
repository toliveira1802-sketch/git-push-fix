# REGRAS DE NEGOCIO - DOCTOR AUTO
# Documento base para a IA Mae (Athena)
# Preencher/validar com dados reais
# Ultima atualizacao: ___/___/2026

---

## 1. FLUXO DA ORDEM DE SERVICO (OS)

### 1.1 Etapas obrigatorias

```
RECEPCAO → DIAGNOSTICO → ORCAMENTO → APROVACAO → EXECUCAO → PRONTO → ENTREGA
```

### 1.2 Detalhamento de cada etapa

| Etapa | Responsavel | SLA | Regra |
|---|---|---|---|
| Recepcao | Consultor | Imediato | Registrar veiculo, placa, KM, queixa do cliente |
| Diagnostico | Mecanico | Ate 4h | Identificar problemas, listar pecas, estimar tempo |
| Orcamento | Consultor | Ate 24h | Montar orcamento com pecas + mao de obra, enviar ao cliente |
| Aprovacao | Cliente | Ate 48h | WhatsApp/ligacao. Apos 48h sem resposta: follow-up automatico |
| Execucao | Mecanico | Conforme estimativa | Registrar inicio/fim, pecas usadas, observacoes |
| Pronto | Consultor | Imediato | Avisar cliente por WhatsApp que o veiculo esta pronto |
| Entrega | Consultor | Ate 24h | Conferir pagamento, entregar veiculo, solicitar avaliacao |

### 1.3 Status da OS

| Status | Cor | Significado |
|---|---|---|
| aberta | Azul | Recebida, aguardando diagnostico |
| diagnostico | Amarelo | Mecanico avaliando |
| orcamento | Laranja | Orcamento enviado ao cliente |
| aprovada | Verde | Cliente aprovou, aguardando inicio |
| em_execucao | Verde piscante | Mecanico trabalhando |
| pronta | Azul escuro | Servico concluido, aguardando retirada |
| entregue | Cinza | Finalizada |
| cancelada | Vermelho | Cancelada pelo cliente ou oficina |

---

## 2. REGRAS DE PRIORIDADE

### 2.1 Ordem de prioridade (maior > menor)

1. **EMERGENCIA** - Veiculo parado/reboque, cliente sem alternativa
2. **GARANTIA** - Retorno por problema no servico anterior (ate 90 dias)
3. **VIP** - Clientes recorrentes (3+ visitas) ou ticket alto
4. **RETORNO** - Cliente que ja foi atendido antes
5. **AGENDADO** - Com horario marcado
6. **NORMAL** - Demanda espontanea

### 2.2 Regras de prioridade

- Emergencia: atender no mesmo dia, reorganizar fila se necessario
- Garantia: prioridade absoluta, custo ZERO para o cliente
- VIP: tempo de espera max 30min, mecanico senior designado
- Agendado: respeitar horario com tolerancia de 15min
- Normal: ordem de chegada

---

## 3. POLITICA DE PRECOS E DESCONTOS

### 3.1 Formacao de preco

| Componente | Calculo |
|---|---|
| Mao de obra | Tempo estimado x Valor hora (R$ ___/h) |
| Pecas | Custo + margem (___%) |
| Diagnostico | R$ ___ (fixo) ou incluso no servico |

### 3.2 Descontos autorizados

| Nivel | Desconto max | Quem autoriza |
|---|---|---|
| Consultor | Ate 10% | Autonomo |
| Gestor | Ate 20% | Aprovacao do gestor |
| Diretor (Thales) | Ate 30% | Apenas Thales |
| Acima de 30% | Caso especial | Thales + justificativa |

### 3.3 Condicoes de pagamento

- A vista (PIX/dinheiro): desconto de ___% automatico
- Cartao debito: sem desconto, sem acrescimo
- Cartao credito: ate ___x sem juros
- Cartao credito parcelado: a partir de ___x com juros (___% a.m.)
- Boleto: apenas para empresas/frotas

---

## 4. REGRAS DO KOMMO (CRM)

### 4.1 Pipeline de leads

| Etapa Kommo | Acao requerida | SLA |
|---|---|---|
| Lead novo | Primeiro contato | Ate 1h |
| Primeiro contato | Qualificar interesse | Ate 2h |
| Qualificado quente | Agendar visita | Ate 4h |
| Qualificado morno | Follow-up | A cada 24h por 7 dias |
| Qualificado frio | Nutricao | 1x por semana por 30 dias |
| Agendado | Confirmar dia anterior | 24h antes |
| Compareceu | Registrar OS | Imediato |
| Nao compareceu (no-show) | Reagendar | Ate 2h |
| Perdido | Registrar motivo | Imediato |

### 4.2 Classificacao de leads

| Tipo | Criterio | Acao |
|---|---|---|
| QUENTE | Precisa do servico urgente (veiculo parado, barulho, luz no painel) | Contato imediato, agendar hoje/amanha |
| MORNO | Pesquisando precos, servico preventivo | Follow-up em 24h, enviar diferencial |
| FRIO | Apenas cotacao, sem urgencia | Nutricao por conteudo, recontato em 7 dias |

### 4.3 Mensagens padrao

- **Primeiro contato**: "Ola [NOME]! Aqui e da Doctor Auto [UNIDADE]. Vi que voce tem interesse em [SERVICO]. Podemos ajudar! Qual o melhor horario para voce?"
- **Follow-up 24h**: "Oi [NOME]! Estou passando pra ver se conseguiu resolver a questao do seu [VEICULO]. Temos horarios disponiveis essa semana!"
- **Confirmacao agendamento**: "Ola [NOME]! Confirmando seu agendamento para amanha as [HORA] na Doctor Auto [UNIDADE]. Confirma presenca?"
- **Pos-servico**: "Oi [NOME]! O servico no seu [VEICULO] ficou pronto. Pode retirar ate as 18h. Obrigado pela confianca!"

---

## 5. REGRAS OPERACIONAIS

### 5.1 Horario de funcionamento

| Dia | Horario | Observacao |
|---|---|---|
| Segunda a Sexta | 08:00 - 18:00 | Atendimento normal |
| Sabado | 08:00 - 12:00 | Meio periodo |
| Domingo | Fechado | |
| Feriados | Fechado | Verificar calendario |

### 5.2 Regras de agendamento

- Max ___ veiculos simultaneos por unidade
- Intervalo minimo entre agendamentos: 30min
- Servicos complexos (motor, cambio): agendar com 48h antecedencia
- Sabado: apenas servicos rapidos (ate 2h)
- Nao agendar apos 16h para servicos > 2h

### 5.3 Regras de estoque/pecas

- Pecas comuns: manter estoque minimo (oleo, filtros, pastilhas)
- Pecas especificas: encomendar apos aprovacao do orcamento
- Prazo medio entrega pecas: ___dias uteis
- Fornecedores preferenciais: ___

---

## 6. REGRAS DE COMUNICACAO

### 6.1 Canais oficiais

| Canal | Uso | Responsavel |
|---|---|---|
| WhatsApp Business | Atendimento principal | Consultores + IAs |
| Telefone | Emergencias e idosos | Recepcao |
| Instagram | Marketing e engajamento | Marketing + IA |
| Site/Landing | Captacao de leads | Automatico |
| Kommo | Gestao de pipeline | Gestao + IA |

### 6.2 Tom de comunicacao

- Profissional mas acessivel
- Sem giriass excessivas
- Usar nome do cliente sempre
- Responder duvidas tecnicas de forma simples
- Nunca prometer prazo que nao pode cumprir
- Sempre informar valor ANTES de executar servico

### 6.3 Escalacao

| Nivel | Quem resolve | Prazo |
|---|---|---|
| Duvida simples | IA / Consultor | Imediato |
| Reclamacao | Gestor | Ate 4h |
| Reclamacao grave | Thales (diretor) | Ate 24h |
| Crise (redes sociais) | Thales | Imediato |

---

## 7. SLAs (ACORDOS DE NIVEL DE SERVICO)

| Processo | SLA | Penalidade se nao cumprir |
|---|---|---|
| Responder lead novo | < 1h | Lead esfria, perda de conversao |
| Enviar diagnostico | < 4h | Cliente pode ir pra concorrencia |
| Enviar orcamento | < 24h | Cliente busca outro orcamento |
| Iniciar servico (apos aprovacao) | < 24h | Perda de confianca |
| Avisar que esta pronto | Imediato | Cliente insatisfeito |
| Resolver reclamacao | < 24h | Risco reputacional |

---

## 8. REGRAS FINANCEIRAS

### 8.1 Aprovacoes

| Valor | Quem aprova |
|---|---|
| Ate R$ 500 | Consultor |
| R$ 500 - R$ 2.000 | Gestor |
| R$ 2.000 - R$ 5.000 | Thales |
| Acima R$ 5.000 | Thales + orcamento detalhado |

### 8.2 Garantia

| Tipo de servico | Garantia |
|---|---|
| Mao de obra | ___ meses / ___ km |
| Pecas originais | ___ meses |
| Pecas paralelas | ___ meses |

---

## INSTRUCOES

1. Revise cada regra e ajuste conforme a realidade atual
2. Preencha os campos com "___" com valores reais
3. Adicione regras que estao faltando
4. Remova regras que nao se aplicam
5. Este documento sera vetorizado no ChromaDB para a Athena consultar
6. Atualize sempre que uma regra mudar
