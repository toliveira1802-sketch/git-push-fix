# ✅ Checklist Interativo de Teste Real

Use este checklist enquanto testa o sistema. Marque os itens conforme completa.

---

## 🔐 AUTENTICAÇÃO

- [ ] **Login realizado** com sucesso
  - Email: seu@email.com
  - Senha: SenhaTemporaria123!

- [ ] **Redirecionamento correto**
  - [ ] Colaborador (gestao) → `/admin` (Dashboard)
  - [ ] Cliente (user) → `/minha-garagem` (Minha Garagem)

- [ ] **Dados de usuário aparecem**
  - [ ] Nome/email no perfil
  - [ ] Role correta exibida
  - [ ] Empresa selecionada (DAB)

---

## 📱 NAVEGAÇÃO & MENU

- [ ] **Menu lateral funciona**
  - [ ] Menu abre/fecha
  - [ ] Todos os links são clicáveis
  - [ ] Ícones carregam corretamente

- [ ] **Links principais funcionam**
  - [ ] Dashboard
  - [ ] Clientes
  - [ ] Ordens de Serviço
  - [ ] Pátio/Kanban
  - [ ] Agendamentos
  - [ ] Financeiro
  - [ ] Relatórios
  - [ ] Configurações

- [ ] **Responsividade**
  - [ ] Menu funciona em mobile
  - [ ] Layout adapta-se ao tamanho da tela
  - [ ] Buttons são clicáveis em mobile

---

## 👤 CLIENTES

### Listagem
- [ ] **Página "Clientes" carrega**
  - [ ] Tabela visível
  - [ ] "Pedro Oliveira Silva" aparece na lista

- [ ] **Dados do cliente aparecem**
  - [ ] Nome: Pedro Oliveira Silva ✓
  - [ ] Telefone: (11) 99999-8888 ✓
  - [ ] Email: pedro.oliveira@email.com ✓
  - [ ] Total gasto: R$ 4.500,00 ✓

### Detalhe do Cliente
- [ ] **Clique em "Pedro Oliveira Silva"**
  - [ ] Abre ficha do cliente

- [ ] **Aba "Informações Gerais"**
  - [ ] Nome: Pedro Oliveira Silva
  - [ ] CPF: 123.456.789-00
  - [ ] Endereço: Rua das Flores, 123, São Paulo
  - [ ] Data de nascimento: 15/05/1985

- [ ] **Aba "CRM"**
  - [ ] Status: Ativo
  - [ ] Satisfação: Muito Satisfeito
  - [ ] Origem: Indicação
  - [ ] Tags: VIP, Preventiva, Leal
  - [ ] Próximo contato: 30 dias

- [ ] **Aba "Métricas"**
  - [ ] Total gasto: R$ 4.500,00
  - [ ] Total de OS: 5
  - [ ] Ticket médio: R$ 900,00
  - [ ] Dias sem visita: 45
  - [ ] Total de veículos: 2

- [ ] **Aba "Veículos"**
  - [ ] Volkswagen T-Cross (ABC-1234) - 67.450 km
  - [ ] Chevrolet Onix (XYZ-9999) - 92.300 km

- [ ] **Aba "Ordens de Serviço"**
  - [ ] OS-2026-0001 (Diagnóstico)
  - [ ] OS-2026-0002 (Em Execução)

- [ ] **Aba "Agendamentos"**
  - [ ] Agendamento em +3 dias 09:00
  - [ ] Agendamento em +2 dias 14:00

---

## 🚗 VEÍCULOS

- [ ] **Página "Veículos" carrega**
  - [ ] Ambos os veículos aparecem

- [ ] **Volkswagen T-Cross (ABC-1234)**
  - [ ] Placa: ABC-1234
  - [ ] Marca: Volkswagen
  - [ ] Modelo: T-Cross
  - [ ] Ano: 2021
  - [ ] Cor: Prata
  - [ ] KM: 67.450
  - [ ] Combustível: Gasolina
  - [ ] Versão: 1.4 TSI Automática

- [ ] **Chevrolet Onix (XYZ-9999)**
  - [ ] Placa: XYZ-9999
  - [ ] Marca: Chevrolet
  - [ ] Modelo: Onix
  - [ ] Ano: 2019
  - [ ] Cor: Preto
  - [ ] KM: 92.300
  - [ ] Combustível: Flex

- [ ] **Ações nos veículos**
  - [ ] Pode clicar para ver detalhes
  - [ ] Ver histórico de serviços
  - [ ] Ver próximas manutenções recomendadas

---

## 📋 ORDENS DE SERVIÇO

### OS 1: Diagnóstico (test-os-001)

- [ ] **Listar OS**
  - [ ] "OS-2026-0001" aparece na lista
  - [ ] Status: "Diagnóstico" visível
  - [ ] Cliente: Pedro Oliveira Silva
  - [ ] Veículo: ABC-1234 (T-Cross)

- [ ] **Abrir OS**
  - [ ] Clique em OS-2026-0001
  - [ ] Detalhes carregam

- [ ] **Informações Gerais**
  - [ ] Número: OS-2026-0001
  - [ ] Status: Diagnóstico
  - [ ] Cliente: Pedro Oliveira Silva
  - [ ] Veículo: Volkswagen T-Cross (ABC-1234)
  - [ ] Mecânico: João da Silva
  - [ ] KM de entrada: 67.450
  - [ ] Prioridade: Alta
  - [ ] Data de criação: Hoje

- [ ] **Descrição do Problema**
  - [ ] "Cliente relata barulho estranho no motor durante aceleração..."

- [ ] **Itens da OS**
  - [ ] Item 1: "Diagnóstico eletrônico e limpeza do motor" - R$ 150,00
  - [ ] Item 2: "Limpeza de carbonização - Motor TSI" - R$ 500,00
  - [ ] Item 3: "Óleo Mobil 0W-30 (5L)" - R$ 320,00
  - [ ] Item 4: "Filtro de Óleo" - R$ 95,00
  - [ ] **Total esperado**: R$ 1.065,00

- [ ] **Histórico**
  - [ ] "Ordem de serviço criada pelo sistema"
  - [ ] "Diagnóstico iniciado por João da Silva"

- [ ] **Ações permitidas**
  - [ ] Pode editar itens
  - [ ] Pode mudar status
  - [ ] Pode adicionar observações

### OS 2: Em Execução (test-os-002)

- [ ] **Listar OS**
  - [ ] "OS-2026-0002" aparece na lista
  - [ ] Status: "Em Execução" visível
  - [ ] Cliente: Pedro Oliveira Silva
  - [ ] Veículo: XYZ-9999 (Onix)

- [ ] **Abrir OS**
  - [ ] Clique em OS-2026-0002
  - [ ] Detalhes carregam

- [ ] **Informações Gerais**
  - [ ] Número: OS-2026-0002
  - [ ] Status: Em Execução
  - [ ] Mecânico: Maria Santos
  - [ ] Total aprovado: R$ 750,00
  - [ ] Método pagamento: Crédito
  - [ ] Status pagamento: Pendente

- [ ] **Itens da OS**
  - [ ] Item 1: "Jogo de Pastilhas de Freio" - Status: Entregue ✓
  - [ ] Item 2: "Instalação de Pastilhas" - Status: Entregue ✓
  - [ ] Item 3: "Disco de Freio" - Status: Pendente de Entrega

- [ ] **Ações permitidas**
  - [ ] Pode aprovar/rejeitar itens
  - [ ] Pode estimar conclusão
  - [ ] Pode gerar recibo/nota fiscal

---

## 🏗️ PÁTIO / KANBAN

- [ ] **Página "Pátio" carrega**
  - [ ] Layout tipo Kanban visível

- [ ] **Colunas de Status**
  - [ ] Coluna "Diagnóstico"
    - [ ] 1 card (OS-2026-0001)
    - [ ] Mostra veículo ABC-1234

  - [ ] Coluna "Em Execução"
    - [ ] 1 card (OS-2026-0002)
    - [ ] Mostra veículo XYZ-9999

  - [ ] Coluna "Pronta para Entrega"
    - [ ] Vazia (0 cards)

- [ ] **Funcionalidade de Drag & Drop**
  - [ ] Pode arrastar card de coluna
  - [ ] Card segue o cursor
  - [ ] Pode soltar em outra coluna
  - [ ] Status atualiza ao soltar

- [ ] **Detalhes ao clicar no Card**
  - [ ] Abre modal/sidebar com detalhes
  - [ ] Mostra cliente, veículo, itens
  - [ ] Pode expandir itens

- [ ] **Filtros (se houver)**
  - [ ] Filtrar por mecânico
  - [ ] Filtrar por data
  - [ ] Filtrar por prioridade

---

## 📅 AGENDAMENTOS

- [ ] **Página "Agendamentos" carrega**
  - [ ] Calendário ou lista visível

- [ ] **Agendamento 1**
  - [ ] Data: +3 dias
  - [ ] Hora: 09:00
  - [ ] Cliente: Pedro Oliveira Silva
  - [ ] Veículo: ABC-1234 (T-Cross)
  - [ ] Tipo: Diagnóstico
  - [ ] Status: Confirmado

- [ ] **Agendamento 2**
  - [ ] Data: +2 dias
  - [ ] Hora: 14:00
  - [ ] Cliente: Pedro Oliveira Silva
  - [ ] Veículo: XYZ-9999 (Onix)
  - [ ] Tipo: Preventiva
  - [ ] Status: Confirmado

- [ ] **Ações**
  - [ ] Pode clicar em agendamento
  - [ ] Pode cancelar agendamento
  - [ ] Pode remarcar data/hora

---

## 💰 FINANCEIRO / DASHBOARD

- [ ] **Dashboard carrega**
  - [ ] Gráficos renderizam
  - [ ] Números aparecem

- [ ] **Cards Resumo**
  - [ ] OS Abertas: 1
  - [ ] OS em Execução: 1
  - [ ] Faturamento esperado: R$ 750,00 (OS aprovadas)
  - [ ] Pendentes de aprovação: R$ 1.065,00 (OS em diagnóstico)

- [ ] **Faturamento**
  - [ ] Filtra por período
  - [ ] Mostra OS faturadas este mês
  - [ ] Calcula total corretamente

- [ ] **Lucratividade**
  - [ ] Mostra custo vs venda
  - [ ] Calcula margem por item
  - [ ] Identifica itens mais lucrativos

- [ ] **Relatórios**
  - [ ] Cliente com maior faturamento: Pedro Oliveira Silva
  - [ ] Mecânico mais ativo
  - [ ] Serviço mais vendido

---

## 🔧 SISTEMA / CONFIGURAÇÃO

- [ ] **Tema/Aparência**
  - [ ] Modo claro/escuro funciona
  - [ ] Cores carregam corretamente

- [ ] **Responsividade**
  - [ ] Desktop (1920x1080): ✓
  - [ ] Tablet (768x1024): ✓
  - [ ] Mobile (360x640): ✓

- [ ] **Performance**
  - [ ] Páginas carregam em < 2s
  - [ ] Sem lentidão visível
  - [ ] Sem travamentos

- [ ] **Erros**
  - [ ] Nenhum erro no console (F12)
  - [ ] Nenhum 404 nas requests
  - [ ] Nenhuma excessão não tratada

---

## 🚀 TESTES AVANÇADOS (Opcional)

- [ ] **Criar nova OS via formulário**
  - [ ] Preenche campos corretamente
  - [ ] Valida campos obrigatórios
  - [ ] Salva no banco

- [ ] **Editar cliente**
  - [ ] Abre formulário
  - [ ] Permite editar campos
  - [ ] Atualiza no banco

- [ ] **Remover item de OS**
  - [ ] Pode deletar item
  - [ ] Total recalcula
  - [ ] Histórico registra

- [ ] **Aprovar OS**
  - [ ] Muda status para "Aprovada"
  - [ ] Libera para execução
  - [ ] Notifica mecânico

---

## 📊 RESUMO DE TESTE

**Total de Itens**: 150+
**Itens Completados**: ___/150+
**Percentual**: ___%

**Erros Encontrados**:
- [ ] Nenhum (Perfeito! 🎉)
- [ ] [ ] Descrever abaixo...

**Observações:**
```
[Espaço para anotar descobertas]




```

---

**Status Final:**
- [ ] ✅ Tudo funcionando perfeitamente
- [ ] ⚠️ Alguns bugs encontrados (listar acima)
- [ ] ❌ Funcionalidades críticas faltando

---

**Data do teste:** ___/___/______
**Testador:** _________________________
**Tempo total:** ________

