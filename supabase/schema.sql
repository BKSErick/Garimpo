-- Extensão para UUID e JSONB
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Campanhas de Garimpo
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    niche TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'ativa', -- ativa, pausada, finalizada
    total_leads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Leads (Versão Outlier)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    
    -- Dados Básicos
    name TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    address TEXT,
    rating DECIMAL(2,1),
    reviews_count INTEGER,
    
    -- Inteligência e Qualificação
    status TEXT DEFAULT 'extraido', -- extraido, qualificado, abordado, convertido, descartado
    score INTEGER DEFAULT 0,
    
    -- Diagnóstico Profundo (Falsa Ruína)
    diagnosis JSONB DEFAULT '{}'::jsonb, -- { "flaws": [], "mechanism": "", "vulnerability_level": "" }
    whatsapp_copy TEXT, -- Mensagem de 4 passos gerada
    
    -- Metadados Brutos (Backup do Scraper)
    raw_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Logs de Atividade (Transparency)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'search', 'qualification', 'copy_gen', 'whatsapp_click'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Segurança RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin access" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin access" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
