-- Create admin_sessions table for admin authentication
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Enable Row Level Security (but allow service role to bypass)
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow service role to manage sessions (no public access)
CREATE POLICY "Service role can manage sessions" ON admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_sessions' 
ORDER BY ordinal_position;
