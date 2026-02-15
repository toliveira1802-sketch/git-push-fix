-- Migration: Renomeação de tabelas e adição de campos
-- Data: 2026-02-02
-- Descrição: Migração completa do banco de dados Doctor Auto

-- =====================================================
-- TABELAS RENOMEADAS (já aplicadas no banco)
-- =====================================================
-- empresas → 00_empresas
-- colaboradores → 01_colaboradores
-- niveis_acesso → 02_nivelDeAcesso
-- mecanicos → 03_mecanicos
-- lista_status → 04_lista_status
-- pendencias → 05_pendencias
-- recursos → 06_recursos
-- clientes → 07_clientes
-- veiculos → 08_veiculos
-- ordens_servico → 09_ordens_servico
-- ordens_servico_historico → 10_ordens_servico_historico (nova)
-- ordens_servico_itens → 11_ordens_servico_itens
-- agendamentos → 12_agendamentos (nova)
-- faturamento → 95_faturamento (nova)
-- analise_promocoes → 97_ANALISE_PROMOCOES
-- servicos_catalogo → 98_SERVICOS
-- crm → 99_CRM

-- =====================================================
-- NOVOS CAMPOS ADICIONADOS
-- =====================================================

-- Campos adicionados em 09_ordens_servico:
-- ALTER TABLE `09_ordens_servico` ADD COLUMN `emTerceiros` BOOLEAN DEFAULT FALSE;
-- ALTER TABLE `09_ordens_servico` ADD COLUMN `recurso` VARCHAR(100) DEFAULT NULL;

-- =====================================================
-- NOVAS TABELAS CRIADAS
-- =====================================================

-- Tabela 10_ordens_servico_historico (histórico de alterações nas OS)
CREATE TABLE IF NOT EXISTS `10_ordens_servico_historico` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ordemServicoId` INT NOT NULL,
  `statusAnterior` VARCHAR(50),
  `statusNovo` VARCHAR(50),
  `colaboradorId` INT,
  `observacao` TEXT,
  `dataAlteracao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela 12_agendamentos (agendamentos de serviços)
CREATE TABLE IF NOT EXISTS `12_agendamentos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clienteId` INT,
  `veiculoId` INT,
  `dataAgendamento` TIMESTAMP,
  `horaAgendamento` VARCHAR(10),
  `tipoServico` VARCHAR(100),
  `descricao` TEXT,
  `status` VARCHAR(50) DEFAULT 'agendado',
  `colaboradorId` INT,
  `observacoes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Tabela 95_faturamento (controle financeiro)
CREATE TABLE IF NOT EXISTS `95_faturamento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ordemServicoId` INT,
  `valorTotal` DECIMAL(10,2) DEFAULT 0,
  `formaPagamento` VARCHAR(100),
  `parcelas` INT DEFAULT 1,
  `dataFaturamento` TIMESTAMP,
  `numeroNF` VARCHAR(50),
  `status` VARCHAR(50) DEFAULT 'pendente',
  `observacoes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- =====================================================
-- ESTRUTURA FINAL DAS TABELAS
-- =====================================================
-- 00_empresas - Empresas do grupo
-- 01_colaboradores - Colaboradores (Direção, Gestão, Consultores)
-- 02_nivelDeAcesso - Níveis de acesso do sistema
-- 03_mecanicos - Mecânicos das oficinas
-- 04_lista_status - Status do workflow da OS
-- 05_pendencias - Pendências de serviços
-- 06_recursos - Recursos da oficina (elevadores, boxes, etc)
-- 07_clientes - Clientes cadastrados
-- 08_veiculos - Veículos dos clientes
-- 09_ordens_servico - Ordens de serviço
-- 10_ordens_servico_historico - Histórico de alterações
-- 11_ordens_servico_itens - Itens/serviços da OS
-- 12_agendamentos - Agendamentos de serviços
-- 95_faturamento - Controle financeiro
-- 97_ANALISE_PROMOCOES - Análise de promoções
-- 98_SERVICOS - Catálogo de serviços
-- 99_CRM - Dados de relacionamento com cliente
-- users - Usuários do sistema (auth)
