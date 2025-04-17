-- Create shopping_items table with RLS
CREATE TABLE shopping_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own shopping items
CREATE POLICY "Users can view their own shopping items"
  ON shopping_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own shopping items
CREATE POLICY "Users can insert their own shopping items"
  ON shopping_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own shopping items
CREATE POLICY "Users can update their own shopping items"
  ON shopping_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shopping items
CREATE POLICY "Users can delete their own shopping items"
  ON shopping_items FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopping_items_updated_at
BEFORE UPDATE ON shopping_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
