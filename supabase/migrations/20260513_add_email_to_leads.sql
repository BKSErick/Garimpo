-- Adiciona campo de email extraído do site na qualificação
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
