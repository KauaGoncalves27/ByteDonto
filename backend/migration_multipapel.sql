-- migration_multipapel.sql
-- Permite que o mesmo usuário (mesmo email / mesmo auth.users.id)
-- tenha múltiplos perfis com papéis diferentes
-- (ex: Dono em uma clínica e Especialista em outra).
--
-- REGRAS após esta migration:
--   ✅ [lucas@gmail.com, Dono]       → permitido
--   ✅ [lucas@gmail.com, Especialista] → permitido
--   ✅ [lucas@gmail.com, Recepção]   → permitido
--   ❌ [lucas@gmail.com, Dono]       → BLOQUEADO (mesmo email + mesmo papel)
--
-- EXECUTE NO SUPABASE SQL EDITOR antes de usar o registro multi-papel.

-- 1. Remove a restrição de chave primária atual (apenas 'id')
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;

-- 2. Adiciona coluna 'pk' como nova chave primária auto-gerada
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pk UUID DEFAULT gen_random_uuid();
UPDATE usuarios SET pk = gen_random_uuid() WHERE pk IS NULL;
ALTER TABLE usuarios ADD PRIMARY KEY (pk);

-- 3. Garante que a combinação (id, papel) seja única
--    Um mesmo auth user não pode ter o mesmo papel duas vezes
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_id_papel_unique;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_id_papel_unique UNIQUE (id, papel);

-- 4. Mantém o índice em 'id' para buscas rápidas por usuário
CREATE INDEX IF NOT EXISTS idx_usuarios_id ON usuarios (id);
