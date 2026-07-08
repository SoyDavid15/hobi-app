-- ============================================================
-- Hobi - Row Level Security (RLS)
-- Ejecutar en Supabase SQL Editor (proyecto: lywureazxewyujvjfrcx)
-- ============================================================
-- Fase 0 del hardening de seguridad del frontend.
-- Protege todas las tablas de datos de usuario con policies por auth.uid().
-- ============================================================

-- ============================================================
-- 1) Activar RLS en todas las tablas de la app
-- ============================================================
ALTER TABLE "Retos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fotos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_hobbies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_challenge_selection" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2) Tabla "Retos" (contenido estático de retos)
--    Acceso: SELECT publico para anon y auth (los retos se muestran a todos).
--    No se permite INSERT/UPDATE/DELETE desde anon ni desde auth.uid()
--    (solo service_role puede escribir retos, vía backend).
-- ============================================================
DROP POLICY IF EXISTS "retos_public_read" ON "Retos";
CREATE POLICY "retos_public_read" ON "Retos"
  FOR SELECT USING (true);

-- Polidades explícitas de bloqueo para escribir (defensas en profundidad)
DROP POLICY IF EXISTS "retos_no_insert" ON "Retos";
CREATE POLICY "retos_no_insert" ON "Retos"
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "retos_no_update" ON "Retos";
CREATE POLICY "retos_no_update" ON "Retos"
  FOR UPDATE USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "retos_no_delete" ON "Retos";
CREATE POLICY "retos_no_delete" ON "Retos"
  FOR DELETE USING (false);

-- ============================================================
-- 3) Tabla "fotos"
--    Cada usuario solo ve sus propias fotos.
-- ============================================================
DROP POLICY IF EXISTS "fotos_owner_select" ON "fotos";
CREATE POLICY "fotos_owner_select" ON "fotos"
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "fotos_owner_insert" ON "fotos";
CREATE POLICY "fotos_owner_insert" ON "fotos"
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "fotos_owner_update" ON "fotos";
CREATE POLICY "fotos_owner_update" ON "fotos"
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "fotos_owner_delete" ON "fotos";
CREATE POLICY "fotos_owner_delete" ON "fotos"
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 4) Tabla "user_progress"
-- ============================================================
DROP POLICY IF EXISTS "user_progress_owner_select" ON "user_progress";
CREATE POLICY "user_progress_owner_select" ON "user_progress"
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_progress_owner_insert" ON "user_progress";
CREATE POLICY "user_progress_owner_insert" ON "user_progress"
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_progress_owner_update" ON "user_progress";
CREATE POLICY "user_progress_owner_update" ON "user_progress"
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_progress_owner_delete" ON "user_progress";
CREATE POLICY "user_progress_owner_delete" ON "user_progress"
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 5) Tabla "user_hobbies"
-- ============================================================
DROP POLICY IF EXISTS "user_hobbies_owner_select" ON "user_hobbies";
CREATE POLICY "user_hobbies_owner_select" ON "user_hobbies"
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_hobbies_owner_insert" ON "user_hobbies";
CREATE POLICY "user_hobbies_owner_insert" ON "user_hobbies"
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_hobbies_owner_update" ON "user_hobbies";
CREATE POLICY "user_hobbies_owner_update" ON "user_hobbies"
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_hobbies_owner_delete" ON "user_hobbies";
CREATE POLICY "user_hobbies_owner_delete" ON "user_hobbies"
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 6) Tabla "user_challenge_selection"
-- ============================================================
DROP POLICY IF EXISTS "ucs_owner_select" ON "user_challenge_selection";
CREATE POLICY "ucs_owner_select" ON "user_challenge_selection"
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ucs_owner_insert" ON "user_challenge_selection";
CREATE POLICY "ucs_owner_insert" ON "user_challenge_selection"
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ucs_owner_update" ON "user_challenge_selection";
CREATE POLICY "ucs_owner_update" ON "user_challenge_selection"
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ucs_owner_delete" ON "user_challenge_selection";
CREATE POLICY "ucs_owner_delete" ON "user_challenge_selection"
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 7) Trigger: validación server-side de displayName
--    F-8: bloquea displayName que no cumpla ^[a-zA-Z0-9_]{3,20}$.
--    Garantiza que un cliente malicioso no pueda bypassar la regex client-side
--    y enviar HTML/scripts como metadata del user.
-- ============================================================
CREATE OR REPLACE FUNCTION hobi_validate_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF new.raw_user_meta_data IS NULL THEN
    RETURN new;
  END IF;

  IF (new.raw_user_meta_data ? 'displayName') THEN
    IF (new.raw_user_meta_data->>'displayName') !~ '^[a-zA-Z0-9_]{3,20}$' THEN
      RAISE EXCEPTION 'displayName inválido: debe tener entre 3 y 20 caracteres alfanuméricos o guion bajo';
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS hobi_enforce_valid_display_name ON auth.users;
CREATE TRIGGER hobi_enforce_valid_display_name
  BEFORE INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION hobi_validate_display_name();

-- ============================================================
-- 8) Verificación final
--    Las siguientes consultas deben devolver TRUE en rowsecurity:
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- Y las policies deben existir:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
-- ============================================================
