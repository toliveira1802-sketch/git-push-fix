# 🧪 Guia Completo: Teste Real do Sistema

## 📋 O que você vai testar

Caminho completo de um **colaborador** (gestão) usando o sistema:

1. ✅ **Login** como colaborador
2. ✅ **Ver OS aberta** (Diagnóstico em andamento)
3. ✅ **Ver OS aprovada** (Em execução - Pátio)
4. ✅ **Gerenciar Pátio** (Status dos veículos)
5. ✅ **Gerenciar Clientes** (Histórico, agendamentos)
6. ✅ **Dashboard Financeiro** (Faturamento, lucro)

---

## 🚀 Passo 1: Preparar os Dados no Banco

### 1.1 Acessar Supabase
```
1. Vá para https://app.supabase.com
2. Abra seu projeto
3. Vá para "SQL Editor" no menu lateral
4. Clique em "New Query"
```

### 1.2 Copiar e colar o script
```sql
-- Copie TODO o conteúdo de: test-data-setup.sql
-- Cole na janela do SQL Editor
-- Clique em "RUN" (ou Ctrl+Enter)
```

### 1.3 Verificar se funcionou
```sql
-- Execute para verificar:
SELECT COUNT(*) as total_clientes FROM clientes WHERE id LIKE 'test%';
SELECT COUNT(*) as total_veiculos FROM veiculos WHERE client_id LIKE 'test%';
SELECT COUNT(*) as total_os FROM ordens_servico WHERE id LIKE 'test%';
```

Deve retornar:
- `total_clientes`: 1 ✅
- `total_veiculos`: 2 ✅
- `total_os`: 2 ✅

---

## 🔐 Passo 2: Criar usuário Colaborador (Gestão)

### 2.1 No Supabase Auth
```
1. Vá para "Authentication" > "Users"
2. Clique em "Add user"
3. Preencha:
   - Email: seu@email.com (seu email pessoal)
   - Password: SenhaTemporaria123!
   - Auto Generate Password: desabilitar
4. Clique em "Create user"
```

### 2.2 Copie o USER_ID (UUID)
```
Aparecerá na tabela. Formato: 550e8400-e29b-41d4-a716-446655440000
```

### 2.3 Associar Role de "GESTÃO"
```sql
-- No SQL Editor, rode:
INSERT INTO user_roles (user_id, role)
VALUES ('COLE_O_UUID_AQUI', 'gestao');

-- Exemplo:
INSERT INTO user_roles (user_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'gestao');
```

### 2.4 Associar a uma Empresa
```sql
-- Se tiver tabela de user_company:
INSERT INTO user_companies (user_id, company_id)
SELECT 'COLE_O_UUID_AQUI', id FROM empresas WHERE code = 'DAB';
```

---

## 🌐 Passo 3: Testar no App

### 3.1 URL do seu app
```
http://localhost:5173  (local)
ou
https://seu-dominio.com (produção)
```

### 3.2 Login
```
Email: seu@email.com
Senha: SenhaTemporaria123!
Clique em "Entrar"
```

### 3.3 Você deve ser direcionado para
```
/admin  (Dashboard de Gestão)
ou
/minha-garagem (se for cliente)
```

---

## 📊 Passo 4: Testar Funcionalidades

### Cenário A: Acompanhar OS em Diagnóstico

```
1. Vá para "Ordens de Serviço"
2. Procure por "OS-2026-0001"
3. Status: "Diagnóstico"
4. Cliente: "Pedro Oliveira Silva"
5. Veículo: "Volkswagen T-Cross (ABC-1234)"
6. Itens: Diagnóstico + Limpeza de Carbonização
```

**Ações esperadas:**
- ✅ Ver detalhes da OS
- ✅ Ver itens com preços
- ✅ Ver histórico de eventos
- ✅ Poder editar status (avançar para orçamento)

---

### Cenário B: Gerenciar OS em Execução

```
1. Procure por "OS-2026-0002"
2. Status: "Em Execução"
3. Cliente: "Pedro Oliveira Silva"
4. Veículo: "Chevrolet Onix (XYZ-9999)"
5. Mecânico: "Maria Santos"
```

**Ações esperadas:**
- ✅ Ver progresso de itens (alguns "Entregues", outros "Pendentes")
- ✅ Pode aprovar/rejeitar itens
- ✅ Estimar data de conclusão
- ✅ Ver valor total: R$ 750,00

---

### Cenário C: Pátio (Kanban)

```
1. Vá para "Pátio" ou "Kanban"
2. Você verá cards de OS por status:
   - Diagnóstico (1 OS)
   - Em Execução (1 OS)
   - Pronta para Entrega (0 OS)
```

**Ações esperadas:**
- ✅ Arrastar OS entre colunas (mover de status)
- ✅ Clicar em card para ver detalhes
- ✅ Ver veículo e placa

---

### Cenário D: Clientes

```
1. Vá para "Clientes"
2. Procure por "Pedro Oliveira Silva"
3. Clique para abrir ficha
```

**Dados do cliente:**
- ✅ Nome: Pedro Oliveira Silva
- ✅ Telefone: (11) 99999-8888
- ✅ Email: pedro.oliveira@email.com
- ✅ Total gasto: R$ 4.500,00
- ✅ Veículos: 2 (T-Cross e Onix)
- ✅ Próximo contato: 30 dias
- ✅ Satisfação: Muito Satisfeito

---

### Cenário E: Dashboard Financeiro

```
1. Vá para "Financeiro" ou "Dashboard"
2. Procure por resumo de:
   - OS Abertas: 1 (R$ 0,00 - diagnóstico)
   - OS em Execução: 1 (R$ 750,00 aprovado)
   - Faturamento esperado este mês
```

---

## 🔧 Troubleshooting

### Erro: "Não consigo fazer login"
```
Motivo: Password fraco ou formato errado
Solução: Use SenhaTemporaria123! (com maiúscula, números, especiais)
```

### Erro: "Rota não encontrada"
```
Motivo: Role não foi associada corretamente
Solução: Verifique em SQL:
SELECT * FROM user_roles WHERE user_id = 'SeuID';
```

### Erro: "Nenhum cliente aparece"
```
Motivo: Script SQL não rodou corretamente
Solução:
1. Verifique se não há erros no console do SQL Editor
2. Rode novamente as queries de verificação
3. Delete dados antigos (descomente a seção de LIMPEZA)
```

### Dados do cliente não atualizam
```
Solução:
1. Pressione Ctrl+Shift+R (hard refresh)
2. Limpe cache do navegador
3. Feche e reabra a aba
```

---

## 📝 Dados de Teste Criados

### Cliente Principal
- **Nome:** Pedro Oliveira Silva
- **ID:** test-client-001
- **CPF:** 123.456.789-00
- **Telefone:** (11) 99999-8888
- **Email:** pedro.oliveira@email.com
- **Status CRM:** Ativo, Muito Satisfeito

### Veículos
| Placa | Marca | Modelo | Ano | KM | ID |
|-------|-------|--------|-----|-----|----------|
| ABC-1234 | Volkswagen | T-Cross | 2021 | 67.450 | test-vehicle-001 |
| XYZ-9999 | Chevrolet | Onix | 2019 | 92.300 | test-vehicle-002 |

### Ordens de Serviço
| OS | Status | Serviço | Total | Mecânico | ID |
|-------|--------|---------|-------|----------|----------|
| OS-2026-0001 | Diagnóstico | Motor TSI | R$ 0,00 | João da Silva | test-os-001 |
| OS-2026-0002 | Em Execução | Freios | R$ 750,00 | Maria Santos | test-os-002 |

### Agendamentos
| Data | Hora | Tipo | Status | ID |
|------|------|------|--------|------|
| +3 dias | 09:00 | Diagnóstico | Confirmado | test-appt-001 |
| +2 dias | 14:00 | Preventiva | Confirmado | test-appt-002 |

---

## 🎯 Próximos Passos (Após Teste)

1. **Testar novo cliente** - Criar via formulário da app
2. **Testar nova OS** - Abrir uma pela interface
3. **Testar movimentação de pátio** - Arrastar entre status
4. **Testar agendamento** - Criar novo agendamento
5. **Testar financeiro** - Ver faturamento e lucro

---

## ⚠️ Notas Importantes

- ✅ Os dados de teste usam IDs iniciados com `test-` para facilitar limpeza depois
- ✅ Você pode rodar o script de limpeza (seção de CLEANUP) para remover tudo depois
- ✅ Dados são realistas e completos (preços, datas, históricos)
- ✅ Seguro para testar em produção (dados identificáveis como teste)

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique o console do navegador (F12 > Console)
2. Verifique logs do Supabase
3. Rode as queries de verificação SQL
4. Reexecute o script SQL (delete antigos primeiro)

---

**Bom teste! 🚗✨**
