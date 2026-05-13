-- Recriar tabela objections com schema correto para o módulo Quebra de Objeções
-- A versão anterior tinha lead_id NOT NULL que é incompatível com objeções universais

DROP TABLE IF EXISTS public.objections CASCADE;

CREATE TABLE public.objections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  response TEXT,
  is_universal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON public.objections FOR ALL USING (true) WITH CHECK (true);

-- Seed de objeções universais
INSERT INTO public.objections (text, response, is_universal) VALUES
('Não tenho dinheiro agora', 'Entendo completamente. Mas me conta — o que acontece com o seu negócio nos próximos 90 dias se esse problema continuar sem solução? O custo de não resolver quase sempre é maior que o investimento. Tenho condições especiais para começar hoje com menos de 30% do valor total.', true),
('Já tenho fornecedor', 'Ótimo! Isso significa que você já reconhece o valor disso. A questão é: seu fornecedor atual entrega o resultado que você precisa? Muitos dos nossos clientes disseram o mesmo — e hoje trabalham conosco porque encontraram um diferencial claro. Posso te mostrar a diferença em 15 minutos?', true),
('Não é o momento certo', 'Respeitável. Mas me conta — qual seria o momento certo? Na maioria dos casos, quando o momento "chega", a concorrência já saiu na frente. O que te impede de avançar com uma versão menor do investimento agora e escalar depois?', true),
('Preciso pensar', 'Claro, decisão importante merece reflexão. Para te ajudar: qual é sua maior dúvida? Se eu resolver ela agora, faz sentido avançarmos? Porque as condições que tenho hoje não estarei garantindo na semana que vem.', true),
('Está caro', 'Caro em relação a quê? Se o resultado esperado compensa o investimento, o ROI fala por si mesmo. O que está pesando mais — o valor total ou o impacto no caixa agora? Porque tenho formas de resolver os dois.', true),
('Vou falar com meu sócio', 'Faz todo sentido. Para facilitar essa conversa: posso preparar um resumo executivo de 1 página para você apresentar? Assim você já chega com os dados na mão. E se fizer sentido, marco uma call rápida com os dois juntos — 20 minutos resolve.', true),
('Me manda mais informações', 'Claro! Mas antes de mandar, quero garantir que enviarei o que é realmente relevante para o seu caso. Me conta: qual é o maior desafio que você está tentando resolver hoje? Assim monto um material personalizado.', true),
('Não conheço sua empresa', 'Totalmente justo. Trabalhamos com empresas do seu segmento e tenho resultados específicos do seu nicho. Posso te mostrar em 10 minutos — o que você precisa ver para se sentir seguro em avançar?', true),
('Não tenho tempo agora', 'Entendo, você é ocupado — isso é ótimo sinal. Exatamente por isso o que tenho é relevante: resolve [problema] sem tomar seu tempo. São 10 minutos que podem economizar horas por semana. Quando fica melhor para você — hoje às 17h ou amanhã de manhã?', true),
('Já tentei algo parecido e não funcionou', 'Obrigado por ser honesto — isso é informação valiosa. O que especificamente não funcionou? Porque dependendo da resposta, o problema era [abordagem/timing/parceiro]. Quero entender antes de te recomendar qualquer coisa.', true);
