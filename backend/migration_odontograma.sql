-- ============================================================
-- MIGRAÇÃO: Odontograma + Tipo de Atendimento
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adiciona coluna odontograma na tabela pacientes
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS odontograma JSONB DEFAULT '{}'::jsonb;

-- 2. Adiciona coluna tipo_atendimento na tabela atendimentos
ALTER TABLE atendimentos
  ADD COLUMN IF NOT EXISTS tipo_atendimento TEXT;
