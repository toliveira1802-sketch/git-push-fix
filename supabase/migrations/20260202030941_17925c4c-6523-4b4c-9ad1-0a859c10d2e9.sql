-- Deletar tabelas de IA (ordem correta por causa de foreign keys)

-- Primeiro: tabelas que referenciam outras tabelas de IA
DROP TABLE IF EXISTS public.ia_joao_qualidade CASCADE;
DROP TABLE IF EXISTS public.ia_pedro_reativacoes CASCADE;

-- Depois: tabelas referenciadas
DROP TABLE IF EXISTS public.ia_anna_atendimentos CASCADE;
DROP TABLE IF EXISTS public.ia_luiz_base_leads CASCADE;

-- Por último: tabelas independentes
DROP TABLE IF EXISTS public.ia_zoraide_monitor CASCADE;
DROP TABLE IF EXISTS public.ia_metricas_diarias CASCADE;