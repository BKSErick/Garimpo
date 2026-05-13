CREATE TABLE IF NOT EXISTS public.objections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  response TEXT,
  is_universal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON public.objections FOR ALL USING (true) WITH CHECK (true);

-- Objeções universais pré-carregadas
INSERT INTO public.objections (text, response, is_universal) VALUES
(
  'Tá caro',
  'Entendo que o investimento parece alto. Mas deixa eu te perguntar: quanto você está perdendo todo mês por não ter isso resolvido? O custo de não agir é muito maior do que o nosso serviço. O que você paga hoje é o custo do problema — não da solução.',
  true
),
(
  'Vou conversar com meu sócio',
  'Claro, decisões importantes merecem alinhamento. Mas deixa eu te perguntar: se seu sócio dissesse sim agora, você fecharia? Se sim, o que você precisa é de um argumento sólido para convencer ele — e eu posso te ajudar a montar isso agora mesmo.',
  true
),
(
  'Não tenho tempo agora',
  'Eu entendo, tempo é o recurso mais escasso. Por isso vou ser direto: quanto tempo você gasta todo mês lidando com esse problema? Nosso serviço existe exatamente para te devolver esse tempo. Quando você tem 20 minutos esta semana?',
  true
),
(
  'Já tenho um fornecedor',
  'Ótimo que você já investe nisso. Minha pergunta é simples: o resultado atual está te satisfazendo 100%? Se sim, não há nada a discutir. Se houver qualquer dúvida, vale 15 minutos para comparar — sem compromisso.',
  true
),
(
  'Me manda no WhatsApp mais tarde',
  'Vou mandar sim. Mas antes — você tem 3 minutos agora? Porque o que preciso te mostrar é uma informação que pode mudar sua decisão hoje. Depois no WhatsApp fica difícil de visualizar o impacto completo.',
  true
),
(
  'Preciso pensar melhor',
  'Com certeza, decisões assim merecem reflexão. O que exatamente ainda não está claro para você? Prefiro resolver sua dúvida agora do que deixar você pensando com informação incompleta. O que mais te trava nessa decisão?',
  true
);
