import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { getAiApiKey } from '@/lib/config/ai';

type AiInstance = ReturnType<typeof genkit>;

const cache = new Map<string, AiInstance>();
const noKeyAi: AiInstance = genkit({ plugins: [] });

export function getAi(apiKey?: string | null): AiInstance {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) return noKeyAi;

  const existing = cache.get(key);
  if (existing) return existing;

  const instance: AiInstance = genkit({
    plugins: [googleAI({ apiKey: key })],
    model: 'googleai/gemini-2.5-flash',
  });
  cache.set(key, instance);
  return instance;
}

export const ai = getAi(getAiApiKey());
