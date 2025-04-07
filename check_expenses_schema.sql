SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'expenses';
SELECT policy_name, definition FROM pg_policies WHERE tablename = 'expenses';
