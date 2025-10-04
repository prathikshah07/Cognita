-- AI logs table for MCP Gateway
CREATE TABLE IF NOT EXISTS ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text NOT NULL,
  prompt_chars integer NOT NULL DEFAULT 0,
  completion_chars integer NOT NULL DEFAULT 0,
  latency_ms integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('success','error')),
  error_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY "Users can view own ai logs" ON ai_logs
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Allow inserting with user_id = auth.uid() or null
CREATE POLICY "Insert own ai logs" ON ai_logs
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS ai_logs_user_id_idx ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_logs_created_at_idx ON ai_logs(created_at);
