ALTER TABLE `ordens_servico` ADD `dataOrcamento` timestamp;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `dataAprovacao` timestamp;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `dataConclusao` timestamp;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `descricaoProblema` text;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `diagnostico` text;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `valorAprovado` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `motivoRecusa` text;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `googleDriveLink` varchar(500);--> statement-breakpoint
ALTER TABLE `ordens_servico_itens` ADD `valorCusto` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ordens_servico_itens` ADD `margemAplicada` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ordens_servico_itens` ADD `prioridade` varchar(20) DEFAULT 'verde';--> statement-breakpoint
ALTER TABLE `ordens_servico_itens` ADD `status` varchar(20) DEFAULT 'pendente';--> statement-breakpoint
ALTER TABLE `ordens_servico_itens` ADD `motivoRecusa` text;