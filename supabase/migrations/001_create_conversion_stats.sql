-- Create conversion_stats table to track total files and size
CREATE TABLE IF NOT EXISTS conversion_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_files BIGINT DEFAULT 0,
  total_size BIGINT DEFAULT 0, -- Size in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial row
INSERT INTO conversion_stats (id, total_files, total_size)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Create function to increment stats
CREATE OR REPLACE FUNCTION increment_conversion_stats(file_size_to_add BIGINT)
RETURNS SETOF conversion_stats
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure there's always one row, create if not exists
  INSERT INTO conversion_stats (id, total_files, total_size)
  VALUES (1, 0, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Update the first (and should be only) row
  RETURN QUERY
  UPDATE conversion_stats
  SET
    total_files = total_files + 1,
    total_size = total_size + file_size_to_add,
    updated_at = NOW()
  WHERE id = 1
  RETURNING *;
END;
$$;

-- Create trigger for storage.objects table (if you want automatic updates)
-- Note: This might not work depending on your Supabase setup
-- You may need to manually update stats in your application code

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_conversion_stats_id ON conversion_stats(id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON conversion_stats TO authenticated;
GRANT USAGE ON SEQUENCE conversion_stats_id_seq TO authenticated;
