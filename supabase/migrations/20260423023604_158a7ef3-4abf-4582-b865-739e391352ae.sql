-- Create factory admin user
DO $$
DECLARE
  admin_uid UUID;
  existing_uid UUID;
BEGIN
  SELECT id INTO existing_uid FROM auth.users WHERE email = 'usuario@barbearia.local';

  IF existing_uid IS NULL THEN
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated',
      'authenticated',
      'usuario@barbearia.local',
      crypt('05092012', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrador"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_uid, jsonb_build_object('sub', admin_uid::text, 'email', 'usuario@barbearia.local'), 'email', admin_uid::text, now(), now(), now());
  ELSE
    admin_uid := existing_uid;
  END IF;

  -- Promote to admin (remove cliente role added by trigger, add admin)
  DELETE FROM public.user_roles WHERE user_id = admin_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;