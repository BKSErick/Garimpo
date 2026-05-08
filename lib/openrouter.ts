export const queryOpenRouter = async (prompt: string, system: string = "Você é um especialista em copy e conversão estilo Thiago Finch.") => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AIOS_DEFAULT_MODEL || "anthropic/claude-3.5-sonnet";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: controller.signal,
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
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[OpenRouter] Erro HTTP ${response.status}:`, errText);
    throw new Error(`OpenRouter retornou ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error("[OpenRouter] Resposta sem content:", JSON.stringify(data));
    throw new Error("OpenRouter retornou resposta vazia");
  }
  return content;
};
