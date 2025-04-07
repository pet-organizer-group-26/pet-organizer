ALTER TABLE expenses RENAME COLUMN event_date TO date;

-- Check all columns in the expenses table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'expenses';

-- Check if expenses table has RLS enabled
SELECT tablename, hasrls 
FROM pg_tables 
WHERE tablename = 'expenses';

-- Check existing RLS policies on expenses table
SELECT policyname, definition 
FROM pg_policies 
WHERE tablename = 'expenses';

-- Add the date column if it doesn't exist (this handles the case where the expense_date column might not exist)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date DATE;

-- Create a comprehensive expenses table (if needed)
-- If the table structure is too different, we could drop and recreate it
-- The following is commented out for safety, uncomment if you decide to recreate the table
/*
DROP TABLE IF EXISTS expenses;

CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own expenses
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own expenses
CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own expenses
CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own expenses
CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);
*/
