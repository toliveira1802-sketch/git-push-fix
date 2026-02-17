/**
 * OLLAMA CLIENT - LLMs locais na VPS (custo zero)
 * Usado como LLM padrao pra tudo que nao precisa de Claude
 *
 * Modelos disponiveis:
 * - llama3.1:8b  -> uso geral, bots, analise
 * - mistral:7b   -> conversacao, resumos
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

/**
 * Chat com Ollama - uso geral
 */
export async function ollamaChat(
  prompt: string,
  model: string = 'llama3.1:8b',
  options?: {
    temperature?: number;
    system?: string;
    maxTokens?: number;
  },
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [];

  if (options?.system) {
    messages.push({ role: 'system', content: options.system });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 2048,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as OllamaResponse;
  return data.message.content;
}

/**
 * Generate com Ollama - pra tarefas simples (sem chat history)
 */
export async function ollamaGenerate(
  prompt: string,
  model: string = 'llama3.1:8b',
  options?: {
    temperature?: number;
    maxTokens?: number;
  },
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 2048,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Verifica se Ollama esta online e quais modelos tem
 */
export async function ollamaStatus(): Promise<{
  online: boolean;
  models: string[];
}> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) return { online: false, models: [] };

    const data = await response.json();
    const models = (data.models || []).map((m: any) => m.name);
    return { online: true, models };
  } catch {
    return { online: false, models: [] };
  }
}

/**
 * Pull um modelo se nao existir
 */
export async function ollamaPull(model: string): Promise<boolean> {
  try {
    const status = await ollamaStatus();
    if (status.models.includes(model)) return true;

    console.log(`[OLLAMA] Baixando modelo ${model}...`);

    const response = await fetch(`${OLLAMA_URL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: false }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
