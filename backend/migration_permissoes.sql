-- ============================================================
-- MIGRAÇÃO: Sistema de Permissões por Membro
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adiciona coluna de permissões na tabela de usuários
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS permissoes JSONB DEFAULT '{}'::jsonb;

-- 2. Define permissões padrão para membros já existentes por papel
UPDATE usuarios SET permissoes = '{
  "ver_pacientes":      true,
  "editar_pacientes":   false,
  "ver_prontuario":     true,
  "editar_prontuario":  true,
  "ver_agenda":         true,
  "agendar_consultas":  false,
  "cancelar_consultas": false,
  "ver_financeiro":     false
}'::jsonb WHERE papel = 'Especialista';

UPDATE usuarios SET permissoes = '{
  "ver_pacientes":      true,
  "editar_pacientes":   true,
  "ver_prontuario":     false,
  "editar_prontuario":  false,
  "ver_agenda":         true,
  "agendar_consultas":  true,
  "cancelar_consultas": true,
  "ver_financeiro":     true
}'::jsonb WHERE papel = 'Recepção';

-- Dono não precisa de permissões — no backend ele tem tudo automaticamente
UPDATE usuarios SET permissoes = '{}'::jsonb WHERE papel = 'Dono';
