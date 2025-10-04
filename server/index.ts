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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // We avoid crashing in dev; requests will fail with 500 and clear message instead
  console.warn('[gateway] Missing SUPABASE_URL or SUPABASE_ANON_KEY in env. Auth and logging will fail.');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Types
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const ChatRequestSchema = z.object({
  provider: z.enum(['cerebras', 'meta-llama']),
  model: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    })
  ).min(1),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(8192).optional(),
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
    let text = '';
    if (body.provider === 'cerebras') {
      text = await callCerebrasChat({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
      });
    } else {
      text = await callLlamaChat({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
      });
    }
    const latency = Date.now() - started;
    await logAiEvent({
      jwt: token,
      userId,
      provider: body.provider,
      model: body.model,
      promptChars,
      completionChars: text.length,
      latencyMs: latency,
      status: 'success',
    });
    return res.json({ content: text, model: body.model, provider: body.provider, latency_ms: latency });
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
