-- Criar usuário dev de teste usando extensão pgcrypto
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Gerar UUID para o novo usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir na auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dev@doctor.com',
    crypt('123456', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Dev Test"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    ''
  );
  
  -- Inserir na auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'dev@doctor.com'),
    'email',
    new_user_id::text,
    now(),
    now(),
    now()
  );
  
  -- Atualizar role para dev (o trigger já criou como 'user')
  UPDATE public.user_roles SET role = 'dev' WHERE user_id = new_user_id;
  
  -- Atualizar profile
  UPDATE public.colaboradores SET full_name = 'Dev Test' WHERE user_id = new_user_id;
  
  RAISE NOTICE 'Usuário dev criado com ID: %', new_user_id;
END $$;