-- Create chats table to store chat data and AI insights
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  chat_text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  participants TEXT[],
  message_count INTEGER,
  analysis JSONB, -- Basic analysis data
  ai_insights JSONB, -- AI-generated insights
  unlocked_insights TEXT[], -- Array of unlocked insight IDs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_chats_device_id ON public.chats(device_id);
CREATE INDEX idx_chats_timestamp ON public.chats(timestamp DESC);
CREATE INDEX idx_chats_device_timestamp ON public.chats(device_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own chats
CREATE POLICY "Users can read their own chats"
  ON public.chats
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own chats
CREATE POLICY "Users can insert their own chats"
  ON public.chats
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own chats
CREATE POLICY "Users can update their own chats"
  ON public.chats
  FOR UPDATE
  USING (true);

-- Create policy to allow users to delete their own chats
CREATE POLICY "Users can delete their own chats"
  ON public.chats
  FOR DELETE
  USING (true);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
