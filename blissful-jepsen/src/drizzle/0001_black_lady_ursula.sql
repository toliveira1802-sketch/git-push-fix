CREATE TABLE `colaboradores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(100),
	`email` varchar(320),
	`telefone` varchar(20),
	`cpf` varchar(14),
	`senha` varchar(255),
	`nivelAcessoId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `colaboradores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`razaoSocial` varchar(255),
	`nomeEmpresa` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`telefone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mecanicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`cpf` varchar(14),
	`grauConhecimento` varchar(50),
	`especialidade` varchar(255),
	`qtdePositivos` int DEFAULT 0,
	`qtdeNegativos` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mecanicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `niveis_acesso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoUsuario` varchar(100) NOT NULL,
	`nivelAcesso` int NOT NULL DEFAULT 1,
	`permissoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `niveis_acesso_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recursos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`nomeRecurso` varchar(255) NOT NULL,
	`ultimaManutencao` date,
	`horasUtilizadasMes` int DEFAULT 0,
	`valorProduzidoMes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recursos_id` PRIMARY KEY(`id`)
);
