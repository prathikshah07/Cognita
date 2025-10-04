import { supabase } from '@/lib/supabase';

export type Provider = 'cerebras' | 'meta-llama' | 'replicate' | 'auto' | 'ensemble';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function aiChat(options: {
  provider: Provider;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  providers?: Array<Exclude<Provider, 'auto' | 'ensemble'>>;
  strategy?: 'fallback' | 'combine';
}): Promise<{ content: string }> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(options),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI request failed');
  }
  const data = await res.json();
  return { content: data.content as string };
}
