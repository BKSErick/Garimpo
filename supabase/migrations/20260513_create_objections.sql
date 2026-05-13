-- Tabela de Objeções por Lead
DROP TABLE IF EXISTS public.objections CASCADE;

CREATE TABLE public.objections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON public.objections FOR ALL USING (true) WITH CHECK (true);

-- Index para lookup por lead
CREATE INDEX objections_lead_id_idx ON public.objections(lead_id);
