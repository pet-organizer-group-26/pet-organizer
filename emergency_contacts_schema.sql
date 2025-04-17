-- Create emergency_contacts table with RLS
CREATE TABLE emergency_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Users can view their own emergency contacts
CREATE POLICY "Users can view their own emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own emergency contacts
CREATE POLICY "Users can insert their own emergency contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own emergency contacts
CREATE POLICY "Users can update their own emergency contacts"
  ON emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own emergency contacts
CREATE POLICY "Users can delete their own emergency contacts"
  ON emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
