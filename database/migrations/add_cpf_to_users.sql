-- Adiciona coluna CPF na tabela users
ALTER TABLE users ADD COLUMN cpf TEXT UNIQUE NOT NULL DEFAULT '00000000000';

-- Atualiza o schema.sql para incluir CPF na criação da tabela
-- Execute este comando manualmente no arquivo schema.sql

-- Adiciona índice para CPF
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);