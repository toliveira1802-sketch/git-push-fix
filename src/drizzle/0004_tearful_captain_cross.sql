CREATE TABLE `pendencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomePendencia` varchar(255) NOT NULL,
	`responsavelId` int NOT NULL,
	`criadorId` int NOT NULL,
	`status` enum('pendente','feita','feita_ressalvas','nao_feita') NOT NULL DEFAULT 'pendente',
	`dataCriacao` timestamp NOT NULL DEFAULT (now()),
	`dataAtualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`observacoes` text,
	`empresaId` int,
	CONSTRAINT `pendencias_id` PRIMARY KEY(`id`)
);
