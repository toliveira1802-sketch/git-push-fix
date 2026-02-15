ALTER TABLE `colaboradores` MODIFY COLUMN `senha` varchar(255) DEFAULT '123456';--> statement-breakpoint
ALTER TABLE `colaboradores` ADD `primeiroAcesso` boolean DEFAULT true;