export const queryOpenRouter = async (prompt: string, system: string = "Você é um especialista em copy e conversão estilo Thiago Finch.") => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AIOS_DEFAULT_MODEL || "anthropic/claude-3.5-sonnet";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://garimpo-finch.vercel.app",
      "X-Title": "Garimpo Finch"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";
};
