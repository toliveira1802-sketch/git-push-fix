-- =============================================
-- BOT SQL - Funcoes auxiliares
-- Permite executar queries READ-ONLY via RPC
-- =============================================

-- Funcao pra executar SELECT (somente leitura)
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Bloqueia qualquer coisa que nao seja SELECT
  IF query_text ~* '^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|EXEC)' THEN
    RAISE EXCEPTION 'Apenas queries SELECT sao permitidas';
  END IF;

  -- Executa e retorna como JSONB
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query_text || ') t'
  INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Funcao pra listar schema do banco (tabelas + colunas)
CREATE OR REPLACE FUNCTION get_schema_info()
RETURNS TABLE(table_name TEXT, column_name TEXT, data_type TEXT, is_nullable TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    c.table_name::TEXT,
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  ORDER BY c.table_name, c.ordinal_position;
$$;

-- Permissoes: so service_role pode executar
REVOKE ALL ON FUNCTION execute_readonly_query(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_readonly_query(TEXT) TO service_role;

REVOKE ALL ON FUNCTION get_schema_info() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_schema_info() TO service_role;
