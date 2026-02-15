-- Adicionar campo para controlar se o usuário precisa trocar a senha
ALTER TABLE public.profiles 
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.must_change_password IS 'Se true, usuário precisa trocar a senha no primeiro acesso';