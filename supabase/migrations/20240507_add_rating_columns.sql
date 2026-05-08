-- Migração: Adicionar colunas de Rating e Reviews para a tabela de Leads
-- Autor: Antigravity (Dex)
-- Data: 2026-05-07

-- 1. Adicionar a coluna rating (decimal de 2 dígitos, 1 decimal, ex: 4.5)
ALTER TABLE IF EXISTS leads 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1);

-- 2. Adicionar a coluna reviews_count (inteiro)
ALTER TABLE IF EXISTS leads 
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- 3. Comentários para documentação do Schema
COMMENT ON COLUMN leads.rating IS 'Avaliação média do estabelecimento no Google Maps (0 a 5)';
COMMENT ON COLUMN leads.reviews_count IS 'Número total de avaliações recebidas no Google Maps';

-- 4. Notificar PostgREST para recarregar o cache (opcional, acontece automático em alguns segundos)
NOTIFY pgrst, 'reload schema';
