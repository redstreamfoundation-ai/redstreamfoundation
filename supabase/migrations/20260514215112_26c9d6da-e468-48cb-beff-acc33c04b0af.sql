
CREATE OR REPLACE FUNCTION public.ensure_my_role(_intended text)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_existing public.app_role;
  v_target public.app_role;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _intended = 'patient' THEN
    v_target := 'user';
  ELSE
    v_target := 'donor';
  END IF;

  -- Find any existing non-admin role
  SELECT role INTO v_existing
  FROM public.user_roles
  WHERE user_id = v_uid AND role IN ('donor','user')
  LIMIT 1;

  IF v_existing IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, v_target)
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN v_target;
  END IF;

  -- If existing role differs from intended, add the intended one too
  -- (keeps existing role; user may legitimately be both)
  IF v_existing <> v_target THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, v_target)
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN v_target;
  END IF;

  RETURN v_existing;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_my_role(text) TO authenticated;
