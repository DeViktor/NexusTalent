import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = apiKey
  ? genkit({
      plugins: [googleAI({ apiKey })],
      model: 'googleai/gemini-2.5-flash',
    })
  : genkit({
      plugins: [],
    });
