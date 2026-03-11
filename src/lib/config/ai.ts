const AI_KEY_ENV_NAMES = ['AI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY'] as const;

export function getAiApiKey(): string | null {
  for (const envName of AI_KEY_ENV_NAMES) {
    const value = process.env[envName];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export function hasAiApiKey(): boolean {
  return Boolean(getAiApiKey());
}
