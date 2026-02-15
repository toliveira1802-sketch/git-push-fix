CREATE TABLE `agendamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int,
	`veiculoId` int,
	`dataAgendamento` date NOT NULL,
	`horaAgendamento` varchar(10),
	`motivoVisita` varchar(255),
	`status` varchar(50) DEFAULT 'agendado',
	`colaboradorId` int,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analise_promocoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataPromocao` date,
	`nomePromocao` varchar(255),
	`clienteId` int,
	`veioPelaPromocao` boolean DEFAULT false,
	`clienteRetornou` boolean DEFAULT false,
	`quantasVezesRetornou` int DEFAULT 0,
	`totalGasto` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_promocoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`nomeCompleto` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`email` varchar(320),
	`telefone` varchar(20),
	`dataNascimento` date,
	`endereco` varchar(500),
	`cep` varchar(10),
	`cidade` varchar(100),
	`estado` varchar(2),
	`origemCadastro` varchar(100),
	`senha` varchar(255) DEFAULT '123456',
	`primeiroAcesso` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`marcaCarro` varchar(100),
	`modeloCarro` varchar(255),
	`tipoServico1` varchar(100),
	`tipoServico2` varchar(100),
	`tipoServico3` varchar(100),
	`ultimaQuilometragem` int DEFAULT 0,
	`ultimaPassagem` timestamp,
	`totalPassagens` int DEFAULT 0,
	`totalGasto` decimal(10,2) DEFAULT '0',
	`comoConheceu` varchar(255),
	`nivelFidelidade` varchar(50),
	`pontosFidelidade` int DEFAULT 0,
	`cashbackDisponivel` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faturamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int,
	`clienteId` int,
	`dataEntrega` date,
	`valor` decimal(10,2) DEFAULT '0',
	`formaPagamento` varchar(100),
	`parcelas` int DEFAULT 1,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faturamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lista_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` varchar(100) NOT NULL,
	`ordem` int DEFAULT 0,
	`cor` varchar(20),
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lista_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordens_servico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroOs` varchar(20),
	`dataEntrada` timestamp DEFAULT (now()),
	`dataSaida` timestamp,
	`clienteId` int,
	`veiculoId` int,
	`placa` varchar(10),
	`km` int DEFAULT 0,
	`status` varchar(50) DEFAULT 'diagnostico',
	`colaboradorId` int,
	`mecanicoId` int,
	`recursoId` int,
	`veioDePromocao` boolean DEFAULT false,
	`motivoVisita` varchar(255),
	`totalOrcamento` decimal(10,2) DEFAULT '0',
	`valorTotalOs` decimal(10,2) DEFAULT '0',
	`primeiraVez` boolean DEFAULT true,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ordens_servico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordens_servico_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`colaboradorId` int,
	`observacao` text,
	`dataAlteracao` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ordens_servico_historico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordens_servico_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`tipo` varchar(50),
	`descricao` varchar(500),
	`quantidade` int DEFAULT 1,
	`valorUnitario` decimal(10,2) DEFAULT '0',
	`valorTotal` decimal(10,2) DEFAULT '0',
	`aprovado` boolean DEFAULT false,
	`executado` boolean DEFAULT false,
	`mecanicoId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ordens_servico_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servicos_catalogo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` varchar(50),
	`valorBase` decimal(10,2) DEFAULT '0',
	`tempoEstimado` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servicos_catalogo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `veiculos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`placa` varchar(10) NOT NULL,
	`marca` varchar(100),
	`modelo` varchar(255),
	`versao` varchar(255),
	`ano` int,
	`combustivel` varchar(50),
	`ultimoKm` int DEFAULT 0,
	`kmAtual` int DEFAULT 0,
	`origemContato` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `veiculos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mecanicos` ADD `ativo` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `recursos` ADD `ativo` boolean DEFAULT true;