import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Environment configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string | undefined;

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY as string | undefined;
const CEREBRAS_API_BASE = (process.env.CEREBRAS_API_BASE as string | undefined) || 'https://api.cerebras.ai/v1';

const LLAMA_API_KEY = process.env.LLAMA_API_KEY as string | undefined;
const LLAMA_API_BASE = (process.env.LLAMA_API_BASE as string | undefined) || 'https://api.llama-api.com';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN as string | undefined;
const REPLICATE_API_BASE = (process.env.REPLICATE_API_BASE as string | undefined) || 'https://api.replicate.com/v1';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // We avoid crashing in dev; requests will fail with 500 and clear message instead
  console.warn('[gateway] Missing SUPABASE_URL or SUPABASE_ANON_KEY in env. Auth and logging will fail.');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Types
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type Provider = 'cerebras' | 'meta-llama' | 'replicate';

const ChatRequestSchema = z.object({
  provider: z.enum(['cerebras', 'meta-llama', 'replicate', 'auto', 'ensemble']),
  model: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    })
  ).min(1),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(32768).optional(),
  providers: z.array(z.enum(['cerebras', 'meta-llama', 'replicate'])).optional(),
  strategy: z.enum(['fallback', 'combine']).optional(),
});

function getSupabaseForToken(jwt: string | undefined) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  // Create a client that uses the provided JWT for RLS and auth.getUser
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

async function verifyUserId(jwt: string | undefined) {
  try {
    if (!jwt) return null;
    const supabase = getSupabaseForToken(jwt);
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser(jwt);
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function logAiEvent(params: {
  jwt: string | undefined;
  userId: string | null;
  provider: string;
  model: string;
  promptChars: number;
  completionChars: number;
  latencyMs: number;
  status: 'success' | 'error';
  errorText?: string;
}) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    const supabase = getSupabaseForToken(params.jwt);
    if (!supabase) return;
    await supabase.from('ai_logs').insert({
      user_id: params.userId,
      provider: params.provider,
      model: params.model,
      prompt_chars: params.promptChars,
      completion_chars: params.completionChars,
      latency_ms: params.latencyMs,
      status: params.status,
      error_text: params.errorText ?? null,
    });
  } catch (e) {
    console.warn('[gateway] failed to insert ai_log', e);
  }
}

// Provider adapters (OpenAI-compatible chat)
async function callCerebrasChat(args: {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  if (!CEREBRAS_API_KEY) throw new Error('CEREBRAS_API_KEY not configured');
  const url = `${CEREBRAS_API_BASE}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: args.temperature,
      max_tokens: args.max_tokens,
      stream: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cerebras error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No completion returned from Cerebras');
  return text;
}

async function callLlamaChat(args: {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  if (!LLAMA_API_KEY) throw new Error('LLAMA_API_KEY not configured');
  const url = `${LLAMA_API_BASE.replace(/\/$/, '')}/v1/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: args.temperature,
      max_tokens: args.max_tokens,
      stream: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Llama API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No completion returned from Llama API');
  return text;
}

async function callReplicateChat(args: {
  model: string; // e.g., 'meta/llama-3.1-8b-instruct' depending on Replicate model path
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');
  // Many Replicate models accept a single prompt. We'll join messages into a single prompt.
  const prompt = args.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  // Attempt OpenAI-compatible endpoint if available on Replicate
  const openaiCompatUrl = `${REPLICATE_API_BASE.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(openaiCompatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: args.temperature,
      max_tokens: args.max_tokens,
      stream: false,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('No completion returned from Replicate');
    return text;
  }

  // Fallback to generic predictions API for models that require prompt input
  const predictionsUrl = `${REPLICATE_API_BASE.replace(/\/$/, '')}/predictions`;
  const res2 = await fetch(predictionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      // For generic use we rely on model string; certain models require version hash instead
      // If this request fails, the error will surface to the caller
      model: args.model,
      input: { prompt, temperature: args.temperature, max_tokens: args.max_tokens },
    }),
  });
  if (!res2.ok) {
    const text = await res2.text();
    throw new Error(`Replicate error ${res2.status}: ${text}`);
  }
  const data2 = await res2.json();
  const output = data2?.output;
  const textOut: string | undefined = Array.isArray(output) ? output.join('') : output?.toString?.();
  if (!textOut) throw new Error('No output returned from Replicate');
  return textOut;
}

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'cognita-mcp-gateway' });
});

app.post('/api/ai/chat', async (req, res) => {
  const started = Date.now();
  const parse = ChatRequestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parse.error.flatten() });
  }
  const body = parse.data;
  const authHeader = req.headers['authorization'];
  const jwt = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const token = jwt?.startsWith('Bearer ') ? jwt.slice('Bearer '.length) : undefined;

  try {
    const userId = await verifyUserId(token);
    const promptChars = body.messages.reduce((sum, m) => sum + m.content.length, 0);
    const requestedProviders: Provider[] = (body.providers as Provider[] | undefined) ?? ['cerebras', 'replicate', 'meta-llama'];
    const strategy = body.strategy ?? (body.provider === 'ensemble' ? 'combine' : body.provider === 'auto' ? 'fallback' : 'fallback');

    const callByProvider = async (provider: Provider) => {
      if (provider === 'cerebras') return callCerebrasChat(body);
      if (provider === 'meta-llama') return callLlamaChat(body);
      if (provider === 'replicate') return callReplicateChat(body);
      throw new Error(`Unknown provider: ${provider}`);
    };

    if (body.provider === 'auto' || strategy === 'fallback') {
      let lastError: any = null;
      for (const p of requestedProviders) {
        try {
          const text = await callByProvider(p);
          const latency = Date.now() - started;
          await logAiEvent({
            jwt: token,
            userId,
            provider: p,
            model: body.model,
            promptChars,
            completionChars: text.length,
            latencyMs: latency,
            status: 'success',
          });
          return res.json({ content: text, model: body.model, provider: p, latency_ms: latency });
        } catch (e) {
          lastError = e;
          continue;
        }
      }
      throw lastError ?? new Error('All providers failed');
    }

    if (body.provider === 'ensemble' || strategy === 'combine') {
      const uniqueProviders = Array.from(new Set(requestedProviders));
      const results = await Promise.allSettled(uniqueProviders.map((p) => callByProvider(p)));
      const successful = results
        .map((r, i) => ({ r, provider: uniqueProviders[i] }))
        .filter((x) => x.r.status === 'fulfilled') as Array<{ r: PromiseFulfilledResult<string>; provider: Provider }>;
      if (successful.length === 0) throw new Error('All providers failed');
      const combined = successful
        .map((x) => `### ${x.provider}\n\n${x.r.value}`)
        .join('\n\n---\n\n');
      const latency = Date.now() - started;
      await logAiEvent({
        jwt: token,
        userId,
        provider: 'ensemble',
        model: body.model,
        promptChars,
        completionChars: combined.length,
        latencyMs: latency,
        status: 'success',
      });
      return res.json({ content: combined, model: body.model, provider: 'ensemble', latency_ms: latency });
    }

    // Direct single provider
    const singleProvider = body.provider as Provider;
    const text = await callByProvider(singleProvider);
    const latency = Date.now() - started;
    await logAiEvent({
      jwt: token,
      userId,
      provider: singleProvider,
      model: body.model,
      promptChars,
      completionChars: text.length,
      latencyMs: latency,
      status: 'success',
    });
    return res.json({ content: text, model: body.model, provider: singleProvider, latency_ms: latency });
  } catch (e: any) {
    const latency = Date.now() - started;
    await logAiEvent({
      jwt: token,
      userId: null,
      provider: body.provider,
      model: body.model,
      promptChars: body.messages.reduce((sum, m) => sum + m.content.length, 0),
      completionChars: 0,
      latencyMs: latency,
      status: 'error',
      errorText: e?.message || String(e),
    });
    return res.status(500).json({ error: e?.message || 'Provider error' });
  }
});

export default app;
