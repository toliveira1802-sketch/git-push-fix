# 📋 Mapeamento do Kommo - Doctor Auto Bosch

## 🔗 Dados de Conexão
- **Subdomínio:** doctorautobosch
- **Account ID:** 33504243
- **API Domain:** api-g.kommo.com

---

## 📊 Pipeline: Vendas (ID: 12717900)

| ID | Etapa | Cor | Sort |
|----|-------|-----|------|
| 98157076 | QUALIFICAÇÃO | #c1e0ff | 10 |
| 98157080 | ATENDIMENTO | #c1e0ff | 20 |
| 98157088 | ORÇAMENTO | #c1e0ff | 30 |
| 98157084 | TENTANDO AGENDAR | #c1e0ff | 40 |
| 98157456 | POTENCIAL CLIENTE | #c1e0ff | 50 |
| 98157516 | FOLLOW UP | #fff000 | 60 |
| 98157520 | AGENDADO | #ffdc7f | 70 |
| 98157580 | ENTREGUE | #87f2c0 | 80 |
| 142 | Closed - won | #CCFF66 | 10000 |
| 143 | Closed - lost | #D5D8DB | 11000 |

---

## 📝 Campos Personalizados (Leads)

| ID | Nome | Tipo | Código |
|----|------|------|--------|
| 966171 | serviço | text | - |
| 966153 | Gravação | text | N_RS_RECORDING |
| 966155 | Funcionário | text | N_RS_SPECIALIST |
| 966157 | Data de início da gravação | date_time | N_RS_START_DATE |
| 966159 | Data de término da gravação | date_time | N_RS_EXPIRATION_DATE |
| 966161 | Comente esta postagem | textarea | N_RS_COMMENT |

---

## 🤖 Configuração da Simone

### Etapas que a Simone monitora:
1. **QUALIFICAÇÃO** (98157076) → Classificar lead (quente/morno/frio)
2. **ATENDIMENTO** (98157080) → Modo vendedora (responder perguntas)
3. **ORÇAMENTO** (98157088) → Enviar/acompanhar orçamento
4. **TENTANDO AGENDAR** (98157084) → Insistir no agendamento
5. **FOLLOW UP** (98157516) → Reativar leads parados

### Ações automáticas:
- Lead parado >2h em QUALIFICAÇÃO → Mover para ATENDIMENTO + mensagem
- Lead parado >24h em ATENDIMENTO → Mover para FOLLOW UP
- Lead parado >48h em FOLLOW UP → Marcar como perdido ou reativar

